const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./commonFilters.js');

async function getKvkEmployees(kvkId, filters = {}) {
    const where = {
        kvkId,
        transferStatus: 'ACTIVE',
    };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkStaff.findMany({
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
        },
        orderBy: { staffName: 'asc' },
    });
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
    const where = {
        transferStatus: 'TRANSFERRED',
    };
    applyCreatedAtFilters(where, filters);

    const allTransferred = await prisma.kvkStaff.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
            originalKvk: {
                select: { kvkId: true, kvkName: true },
            },
        },
        orderBy: { staffName: 'asc' },
    });

    return allTransferred.filter(staff => {
        if (staff.originalKvkId === kvkId) return true;
        if (!staff.sourceKvkIds) return false;

        const sourceIds = Array.isArray(staff.sourceKvkIds)
            ? staff.sourceKvkIds
            : (typeof staff.sourceKvkIds === 'string' ? JSON.parse(staff.sourceKvkIds) : []);
        return Array.isArray(sourceIds) && sourceIds.includes(kvkId);
    });
}

module.exports = {
    getKvkEmployees,
    getKvkEmployeeHeads,
    getKvkStaffTransferred,
};

