const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters, applyDateFilters } = require('./commonFilters.js');

async function getKvkEmployees(kvkId, filters = {}) {
    const where = {
        kvkId,
        transferStatus: 'ACTIVE',
    };
    applyCreatedAtFilters(where, filters);

    const rows = await prisma.kvkStaff.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
            sanctionedPost: {
                select: { sanctionedPostId: true, postName: true },
            },
            discipline: {
                select: { disciplineId: true, disciplineName: true },
            },
            payLevel: {
                select: { payLevelId: true, levelName: true },
            },
            staffCategory: {
                select: { staffCategoryId: true, categoryName: true },
            },
            jobTypeMaster: { select: { name: true } },
        },
        orderBy: { staffName: 'asc' },
    });

    // Display job type: master name → "Other" specify text.
    return rows.map((r) => ({
        ...r,
        jobType: r.jobTypeMaster?.name || r.jobTypeOther || '',
    }));
}

async function getKvkEmployeeHeads(kvkId, filters = {}) {
    const where = {
        kvkId,
        transferStatus: 'ACTIVE',
    };
    applyCreatedAtFilters(where, filters);

    const all = await prisma.kvkStaff.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            sanctionedPost: { select: { postName: true } },
        },
        orderBy: [
            { positionOrder: 'asc' },
            { staffName: 'asc' },
        ],
    });

    const heads = all.filter(emp => Number(emp.positionOrder) === 1);
    if (heads.length > 0) return heads;

    const byTitle = all.filter(emp =>
        (emp.sanctionedPost?.postName || '').toLowerCase().includes('head')
    );
    if (byTitle.length > 0) return byTitle;

    return all.slice(0, 1);
}

async function getKvkStaffTransferred(kvkId, filters = {}) {
    // Source of truth is the transfer-history table — the same one the "Staff
    // Transferred" management page reads. The kvkStaff row is marked ACTIVE at its
    // new KVK after a transfer (see aboutKvkService.transferEmployee), so filtering
    // kvkStaff by transferStatus === 'TRANSFERRED' never returned any rows and the
    // report section came up empty.
    //
    // Each transfer is attributed to its origin KVK (fromKvkId), so the aggregated
    // (superadmin) report — which fans out per-KVK and concatenates — counts a
    // transfer between two in-scope KVKs exactly once.
    const where = { fromKvkId: kvkId };
    applyDateFilters(where, filters, 'transferDate');

    const rows = await prisma.staffTransferHistory.findMany({
        where,
        include: {
            staff: { select: { staffName: true, transferCount: true } },
            fromKvk: { select: { kvkId: true, kvkName: true } },
            toKvk: { select: { kvkId: true, kvkName: true } },
        },
        orderBy: [{ transferDate: 'desc' }, { transferId: 'desc' }],
    });

    // Shape rows for the staff-transferred template: originalKvk = from, kvk = to.
    return rows.map((row) => ({
        staffName: row.staff?.staffName || '',
        originalKvk: row.fromKvk,
        kvk: row.toKvk,
        lastTransferDate: row.transferDate,
        transferCount: row.staff?.transferCount ?? null,
    }));
}

module.exports = {
    getKvkEmployees,
    getKvkEmployeeHeads,
    getKvkStaffTransferred,
};

