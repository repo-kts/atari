const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./common.js');

async function getKvkEmployees(kvkId, filters = {}) {
    const where = {
        kvkId,
        transferStatus: 'ACTIVE',
    };

    applyCreatedAtFilters(where, filters);

    return await prisma.kvkStaff.findMany({
        where,
        include: {
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
    getKvkStaffTransferred,
};
