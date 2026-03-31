const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./common.js');

async function getKvkEquipments(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkEquipment.findMany({
        where,
        orderBy: [
            { yearOfPurchase: 'desc' },
            { equipmentName: 'asc' },
        ],
    });
}

module.exports = {
    getKvkEquipments,
};
