const prisma = require('../config/prisma');

const SELECT = {
    attachmentId: true,
    kvkId: true,
    formCode: true,
    recordId: true,
    kind: true,
    s3Key: true,
    fileName: true,
    mimeType: true,
    size: true,
    caption: true,
    sortOrder: true,
    reportingYearDate: true,
    uploadedByUserId: true,
    createdAt: true,
    updatedAt: true,
    kvk: { select: { kvkId: true, kvkName: true } },
    uploadedBy: { select: { userId: true, name: true, email: true } },
};

async function create(data) {
    return prisma.formAttachment.create({ data, select: SELECT });
}

async function findById(attachmentId) {
    return prisma.formAttachment.findUnique({
        where: { attachmentId },
        select: SELECT,
    });
}

async function findByIds(attachmentIds) {
    if (!Array.isArray(attachmentIds) || attachmentIds.length === 0) return [];
    return prisma.formAttachment.findMany({
        where: { attachmentId: { in: attachmentIds.map(Number).filter((n) => !Number.isNaN(n)) } },
        select: SELECT,
    });
}

async function listByRecord({ formCode, recordId, kvkId, kind }) {
    const where = { formCode };
    if (recordId !== undefined && recordId !== null) where.recordId = String(recordId);
    if (kvkId) where.kvkId = Number(kvkId);
    if (kind) where.kind = kind;
    return prisma.formAttachment.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: SELECT,
    });
}

async function listForGallery({
    page = 1,
    limit = 50,
    kvkId,
    formCode,
    kind = 'PHOTO',
    reportingYear,
    search,
}) {
    const where = { kind, AND: [] };
    if (kvkId) where.kvkId = Number(kvkId);
    if (formCode) where.formCode = formCode;
    if (reportingYear) {
        const yearNum = Number(reportingYear);
        if (!Number.isNaN(yearNum)) {
            const start = new Date(`${yearNum}-04-01T00:00:00.000Z`);
            const end = new Date(`${yearNum + 1}-04-01T00:00:00.000Z`);
            // Use either reportingYearDate (if set) or createdAt as fallback,
            // so attachments uploaded without an explicit fiscal year still
            // appear in the gallery for the year they were created.
            where.AND.push({
                OR: [
                    { reportingYearDate: { gte: start, lt: end } },
                    {
                        AND: [
                            { reportingYearDate: null },
                            { createdAt: { gte: start, lt: end } },
                        ],
                    },
                ],
            });
        }
    }
    if (search) {
        where.AND.push({
            OR: [
                { caption: { contains: search, mode: 'insensitive' } },
                { fileName: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (where.AND.length === 0) delete where.AND;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));
    const [total, data] = await Promise.all([
        prisma.formAttachment.count({ where }),
        prisma.formAttachment.findMany({
            where,
            orderBy: [{ createdAt: 'desc' }, { attachmentId: 'desc' }],
            skip: (safePage - 1) * safeLimit,
            take: safeLimit,
            select: SELECT,
        }),
    ]);
    return {
        data,
        meta: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
        },
    };
}

async function update(attachmentId, data) {
    return prisma.formAttachment.update({
        where: { attachmentId },
        data,
        select: SELECT,
    });
}

async function deleteByIds(attachmentIds) {
    if (!Array.isArray(attachmentIds) || attachmentIds.length === 0) return { count: 0 };
    return prisma.formAttachment.deleteMany({
        where: { attachmentId: { in: attachmentIds.map(Number).filter((n) => !Number.isNaN(n)) } },
    });
}

async function attachToRecord({ attachmentIds, formCode, recordId, kvkId }) {
    if (!Array.isArray(attachmentIds) || attachmentIds.length === 0) return { count: 0 };
    const ids = attachmentIds.map(Number).filter((n) => !Number.isNaN(n));
    const recordIdStr = String(recordId);
    return prisma.formAttachment.updateMany({
        where: {
            attachmentId: { in: ids },
            kvkId,
            formCode,
            OR: [{ recordId: null }, { recordId: recordIdStr }],
        },
        data: { recordId: recordIdStr },
    });
}

async function distinctFormCodes({ kvkId, kind = 'PHOTO' }) {
    const where = { kind };
    if (kvkId) where.kvkId = Number(kvkId);
    const rows = await prisma.formAttachment.groupBy({
        by: ['formCode'],
        where,
        _count: { _all: true },
        orderBy: { formCode: 'asc' },
    });
    return rows.map((r) => ({ formCode: r.formCode, count: r._count._all }));
}

async function distinctKvks({ kind = 'PHOTO' }) {
    const rows = await prisma.formAttachment.groupBy({
        by: ['kvkId'],
        where: { kind },
        _count: { _all: true },
    });
    if (rows.length === 0) return [];
    const kvks = await prisma.kvk.findMany({
        where: { kvkId: { in: rows.map((r) => r.kvkId) } },
        select: { kvkId: true, kvkName: true },
    });
    const counts = new Map(rows.map((r) => [r.kvkId, r._count._all]));
    return kvks
        .map((k) => ({ kvkId: k.kvkId, kvkName: k.kvkName, count: counts.get(k.kvkId) || 0 }))
        .sort((a, b) => a.kvkName.localeCompare(b.kvkName));
}

module.exports = {
    create,
    findById,
    findByIds,
    listByRecord,
    listForGallery,
    update,
    deleteByIds,
    attachToRecord,
    distinctFormCodes,
    distinctKvks,
};
