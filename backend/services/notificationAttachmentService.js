const prisma = require('../config/prisma.js');
const s3 = require('./storage/s3Service.js');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errorHandler.js');

const SUPER_ADMIN_ROLE = 'super_admin';

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES_PER_NOTIFICATION = 10;

const ALLOWED_MIME_PREFIXES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml',
    'image/',
    'text/csv',
    'text/plain',
];

function assertSuperAdmin(user) {
    if (!user) throw new UnauthorizedError();
    if (user.roleName !== SUPER_ADMIN_ROLE) {
        throw new ValidationError('Only super_admin can manage notification attachments');
    }
}

function validateUploadInput({ fileName, mimeType, size }) {
    if (!fileName || typeof fileName !== 'string' || fileName.length > 255) {
        throw new ValidationError('fileName is required and must be < 255 chars');
    }
    if (!mimeType || typeof mimeType !== 'string') {
        throw new ValidationError('mimeType is required');
    }
    const allowed = ALLOWED_MIME_PREFIXES.some((p) => mimeType.startsWith(p));
    if (!allowed) {
        throw new ValidationError(`File type not allowed: ${mimeType}`);
    }
    const num = Number(size);
    if (!Number.isFinite(num) || num <= 0) {
        throw new ValidationError('Invalid file size');
    }
    if (num > MAX_BYTES) {
        throw new ValidationError(`File exceeds max size ${(MAX_BYTES / (1024 * 1024)).toFixed(0)}MB`);
    }
}

async function decorate(row) {
    if (!row) return row;
    const url = row.s3Key
        ? await s3.presignGet({ key: row.s3Key, downloadFileName: row.fileName || undefined })
        : null;
    return {
        attachmentId: row.attachmentId,
        notificationId: row.notificationId,
        fileName: row.fileName,
        mimeType: row.mimeType,
        size: row.size,
        createdAt: row.createdAt,
        fileUrl: url,
        downloadUrl: url,
        uploadedBy: row.uploadedBy
            ? { userId: row.uploadedBy.userId, name: row.uploadedBy.name, email: row.uploadedBy.email }
            : null,
    };
}

async function presignUpload({ fileName, mimeType, size }, user) {
    assertSuperAdmin(user);
    validateUploadInput({ fileName, mimeType, size });
    if (!s3.isConfigured()) {
        throw new ValidationError('Object storage not configured on server');
    }
    const s3Key = s3.buildNotificationAttachmentKey({ fileName, mimeType });
    const uploadUrl = await s3.presignPut({ key: s3Key, mimeType });
    return {
        s3Key,
        uploadUrl,
        expiresIn: s3.PUT_TTL_SECONDS,
        headers: { 'Content-Type': mimeType },
    };
}

async function confirmUpload(payload, user) {
    assertSuperAdmin(user);
    const { s3Key, fileName, mimeType, size } = payload || {};
    validateUploadInput({ fileName, mimeType, size });
    if (!s3Key || typeof s3Key !== 'string' || !s3Key.startsWith('notifications/')) {
        throw new ValidationError('s3Key does not match notification path');
    }
    const row = await prisma.notificationAttachment.create({
        data: {
            notificationId: null,
            s3Key,
            fileName,
            mimeType,
            size: Number(size),
            uploadedByUserId: user.userId,
        },
        include: { uploadedBy: { select: { userId: true, name: true, email: true } } },
    });
    return decorate(row);
}

async function attachToNotification({ attachmentIds, notificationId, user, tx }) {
    const ids = (Array.isArray(attachmentIds) ? attachmentIds : [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);
    if (ids.length === 0) return { count: 0 };
    if (ids.length > MAX_FILES_PER_NOTIFICATION) {
        throw new ValidationError(`Maximum ${MAX_FILES_PER_NOTIFICATION} attachments per notification`);
    }
    const client = tx || prisma;
    return client.notificationAttachment.updateMany({
        where: {
            attachmentId: { in: ids },
            uploadedByUserId: user.userId,
            OR: [{ notificationId: null }, { notificationId }],
        },
        data: { notificationId },
    });
}

async function listForNotification(notificationId) {
    const rows = await prisma.notificationAttachment.findMany({
        where: { notificationId },
        orderBy: [{ attachmentId: 'asc' }],
        include: { uploadedBy: { select: { userId: true, name: true, email: true } } },
    });
    return Promise.all(rows.map(decorate));
}

async function listForNotificationIds(notificationIds) {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return new Map();
    }
    const rows = await prisma.notificationAttachment.findMany({
        where: { notificationId: { in: notificationIds } },
        orderBy: [{ attachmentId: 'asc' }],
        include: { uploadedBy: { select: { userId: true, name: true, email: true } } },
    });
    const decorated = await Promise.all(rows.map(decorate));
    const grouped = new Map();
    for (const att of decorated) {
        if (att.notificationId == null) continue;
        const list = grouped.get(att.notificationId) || [];
        list.push(att);
        grouped.set(att.notificationId, list);
    }
    return grouped;
}

async function deleteAttachment(attachmentId, user) {
    assertSuperAdmin(user);
    const existing = await prisma.notificationAttachment.findUnique({
        where: { attachmentId: Number(attachmentId) },
    });
    if (!existing) throw new NotFoundError('Attachment');
    await prisma.notificationAttachment.delete({ where: { attachmentId: existing.attachmentId } });
    if (existing.s3Key) {
        try { await s3.deleteOne(existing.s3Key); } catch { /* best-effort */ }
    }
    return { ok: true };
}

module.exports = {
    presignUpload,
    confirmUpload,
    attachToNotification,
    listForNotification,
    listForNotificationIds,
    deleteAttachment,
    MAX_BYTES,
    MAX_FILES_PER_NOTIFICATION,
};
