const formAttachmentRepository = require('../repositories/formAttachmentRepository');
const s3 = require('./storage/s3Service');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errorHandler');

const KIND = { PHOTO: 'PHOTO', DATASHEET: 'DATASHEET', DOCUMENT: 'DOCUMENT' };

const MAX_BYTES = {
    PHOTO: 5 * 1024 * 1024,
    DATASHEET: 5 * 1024 * 1024,
    DOCUMENT: 25 * 1024 * 1024,
};

const ALLOWED_MIME_PREFIXES = {
    PHOTO: ['image/'],
    DATASHEET: [
        'application/pdf',
        'image/',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml',
        'text/csv',
        'text/plain',
    ],
    DOCUMENT: [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml',
        'text/csv',
        'text/plain',
        'image/',
        'video/',
        'audio/',
    ],
};

function assertKvkAccess(user, kvkId) {
    if (!user) throw new UnauthorizedError();
    if (user.kvkId && user.kvkId !== Number(kvkId)) {
        throw new UnauthorizedError('Cannot upload attachment for a different KVK');
    }
}

function assertCanMutate(user, attachment) {
    if (!user) throw new UnauthorizedError();
    if (user.kvkId && attachment.kvkId !== user.kvkId) {
        throw new UnauthorizedError('Cannot modify attachment from a different KVK');
    }
}

function validateUploadInput({ kind, fileName, mimeType, size }) {
    if (!kind || !KIND[kind]) {
        throw new ValidationError(`Invalid attachment kind: ${kind}`);
    }
    if (!mimeType || typeof mimeType !== 'string') {
        throw new ValidationError('mimeType is required');
    }
    const allowed = ALLOWED_MIME_PREFIXES[kind] || [];
    const ok = allowed.some((p) => mimeType.toLowerCase().startsWith(p.toLowerCase()));
    if (!ok) {
        throw new ValidationError(`mimeType ${mimeType} is not allowed for ${kind}`);
    }
    const max = MAX_BYTES[kind];
    if (typeof size !== 'number' || size <= 0) {
        throw new ValidationError('size must be a positive number');
    }
    if (size > max) {
        throw new ValidationError(`File exceeds max size ${(max / (1024 * 1024)).toFixed(0)}MB for ${kind}`);
    }
    if (!fileName || typeof fileName !== 'string' || fileName.length > 255) {
        throw new ValidationError('fileName is required and must be < 255 chars');
    }
}

async function presignUpload({ formCode, kind, fileName, mimeType, size, kvkId }, user) {
    assertKvkAccess(user, kvkId);
    validateUploadInput({ kind, fileName, mimeType, size });
    if (!s3.isConfigured()) {
        throw new ValidationError('Object storage not configured on server');
    }
    const s3Key = s3.buildAttachmentKey({ formCode, fileName, mimeType });
    const uploadUrl = await s3.presignPut({ key: s3Key, mimeType });
    return {
        s3Key,
        uploadUrl,
        expiresIn: s3.PUT_TTL_SECONDS,
        headers: { 'Content-Type': mimeType },
    };
}

async function confirmUpload(payload, user) {
    const {
        s3Key,
        formCode,
        kind,
        recordId,
        kvkId,
        fileName,
        mimeType,
        size,
        caption,
        sortOrder,
        reportingYearDate,
    } = payload || {};
    assertKvkAccess(user, kvkId);
    validateUploadInput({ kind, fileName, mimeType, size });
    if (!s3Key || typeof s3Key !== 'string' || !s3Key.startsWith(`forms/${formCode}/`)) {
        throw new ValidationError('s3Key does not match formCode');
    }
    const data = {
        kvkId: Number(kvkId),
        formCode: String(formCode),
        recordId: recordId !== undefined && recordId !== null ? String(recordId) : null,
        kind,
        s3Key,
        fileName,
        mimeType,
        size: Number(size),
        caption: caption ? String(caption).slice(0, 1000) : null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        reportingYearDate: reportingYearDate ? new Date(reportingYearDate) : null,
        uploadedByUserId: user?.userId || null,
    };
    const row = await formAttachmentRepository.create(data);
    return decorate(row);
}

async function listByRecord(params, user) {
    if (!user) throw new UnauthorizedError();
    const filters = { ...params };
    if (user.kvkId && !filters.kvkId) filters.kvkId = user.kvkId;
    const rows = await formAttachmentRepository.listByRecord(filters);
    return Promise.all(rows.map(decorate));
}

async function attachToRecord({ attachmentIds, formCode, recordId, kvkId }, user) {
    assertKvkAccess(user, kvkId);
    return formAttachmentRepository.attachToRecord({
        attachmentIds,
        formCode,
        recordId: String(recordId),
        kvkId: Number(kvkId),
    });
}

async function updateAttachment(attachmentId, patch, user) {
    const existing = await formAttachmentRepository.findById(Number(attachmentId));
    if (!existing) throw new NotFoundError('Attachment');
    assertCanMutate(user, existing);
    const data = {};
    if (patch.caption !== undefined) data.caption = patch.caption ? String(patch.caption).slice(0, 1000) : null;
    if (patch.sortOrder !== undefined) data.sortOrder = Number(patch.sortOrder);
    const updated = await formAttachmentRepository.update(Number(attachmentId), data);
    return decorate(updated);
}

async function deleteAttachment(attachmentId, user) {
    const existing = await formAttachmentRepository.findById(Number(attachmentId));
    if (!existing) throw new NotFoundError('Attachment');
    assertCanMutate(user, existing);
    await formAttachmentRepository.deleteByIds([Number(attachmentId)]);
    if (existing.s3Key) {
        try { await s3.deleteOne(existing.s3Key); } catch { /* best-effort */ }
    }
    return { ok: true };
}

async function deleteManyByRecord({ formCode, recordId, kvkId }, user) {
    if (!user) throw new UnauthorizedError();
    const rows = await formAttachmentRepository.listByRecord({ formCode, recordId, kvkId });
    if (rows.length === 0) return { count: 0 };
    rows.forEach((r) => assertCanMutate(user, r));
    const ids = rows.map((r) => r.attachmentId);
    await formAttachmentRepository.deleteByIds(ids);
    try { await s3.deleteMany(rows.map((r) => r.s3Key)); } catch { /* best-effort */ }
    return { count: ids.length };
}

async function listForGallery(params, user) {
    if (!user) throw new UnauthorizedError();
    const filters = { ...params, kind: 'PHOTO' };
    if (user.kvkId) filters.kvkId = user.kvkId;
    const result = await formAttachmentRepository.listForGallery(filters);
    const data = await Promise.all(result.data.map(decorate));
    return { data, meta: result.meta };
}

async function listForms(user) {
    if (!user) throw new UnauthorizedError();
    return formAttachmentRepository.distinctFormCodes({ kvkId: user.kvkId, kind: 'PHOTO' });
}

async function listKvks(user) {
    if (!user) throw new UnauthorizedError();
    if (user.kvkId) {
        return formAttachmentRepository.distinctKvks({ kind: 'PHOTO' })
            .then((all) => all.filter((k) => k.kvkId === user.kvkId));
    }
    return formAttachmentRepository.distinctKvks({ kind: 'PHOTO' });
}

async function decorate(row) {
    if (!row) return row;
    const url = row.s3Key
        ? await s3.presignGet({ key: row.s3Key, downloadFileName: row.fileName || undefined })
        : null;
    return {
        ...row,
        fileUrl: url,
        downloadUrl: url,
    };
}

module.exports = {
    presignUpload,
    confirmUpload,
    listByRecord,
    attachToRecord,
    updateAttachment,
    deleteAttachment,
    deleteManyByRecord,
    listForGallery,
    listForms,
    listKvks,
    KIND,
    MAX_BYTES,
};
