const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./common.js');

async function getKvkInfrastructure(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkInfrastructure.findMany({
        where,
        include: {
            infraMaster: {
                select: { infraMasterId: true, name: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
}

module.exports = {
    getKvkInfrastructure,
};
