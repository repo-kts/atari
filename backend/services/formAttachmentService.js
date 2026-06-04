const formAttachmentRepository = require('../repositories/formAttachmentRepository.js');
const s3 = require('./storage/s3Service.js');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errorHandler.js');

const KIND = { PHOTO: 'PHOTO', DATASHEET: 'DATASHEET', DOCUMENT: 'DOCUMENT' };

// Form codes that *can* hold image-bearing attachments. Always surfaced in the
// gallery sidebar even when their count is currently 0 — users still need to
// be able to click into them to upload via the linked record's form.
const KNOWN_GALLERY_FORM_CODES = [
    'oft_result',
    'arya_current_year',
    'rawe_fet',
    'sac_meeting',
    'farmer_award',
    'nicra_details',
    'nicra_farm_implement',
    'nicra_vcrmc',
    'nicra_soil_health',
    'nicra_convergence',
    'nicra_dignitaries',
    'cfld_technical_training',
    'cfld_technical_action',
    'natural_farming_physical',
    'natural_farming_demo',
    'ppv_fra',
    'success_story',
    'kvk_staff',
];

// Form codes that should NEVER appear in the gallery sidebar even if rows
// exist in the DB (Natural Farming Farmers Practicing is excluded by request).
const HIDDEN_GALLERY_FORM_CODES = new Set([
    'natural_farming_farmers',
]);

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
    const filters = { ...params };
    if (user.kvkId) filters.kvkId = user.kvkId;
    const result = await formAttachmentRepository.listForGallery(filters);
    // Drop rows whose formCode is hidden from the gallery (kvk_staff, etc.)
    const visibleRows = result.data.filter((r) => !HIDDEN_GALLERY_FORM_CODES.has(r.formCode));
    const data = await Promise.all(visibleRows.map(decorate));
    return {
        data,
        meta: { ...result.meta, total: visibleRows.length === result.data.length ? result.meta.total : visibleRows.length },
    };
}

async function listForms(user) {
    if (!user) throw new UnauthorizedError();
    const dbRows = await formAttachmentRepository.distinctFormCodes({ kvkId: user.kvkId });
    const counts = new Map(dbRows.map((r) => [r.formCode, r.count]));
    const known = KNOWN_GALLERY_FORM_CODES.map((formCode) => ({
        formCode,
        count: counts.get(formCode) || 0,
    }));
    // Append any formCode the DB knows about but our static list missed.
    for (const r of dbRows) {
        if (!KNOWN_GALLERY_FORM_CODES.includes(r.formCode)) {
            known.push(r);
        }
    }
    // Exclude codes that should never surface in the gallery sidebar.
    return known.filter((r) => !HIDDEN_GALLERY_FORM_CODES.has(r.formCode));
}

async function listKvks(user) {
    if (!user) throw new UnauthorizedError();
    if (user.kvkId) {
        return formAttachmentRepository.distinctKvks()
            .then((all) => all.filter((k) => k.kvkId === user.kvkId));
    }
    return formAttachmentRepository.distinctKvks();
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
