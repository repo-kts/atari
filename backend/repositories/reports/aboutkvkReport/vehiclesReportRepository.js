const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./common.js');

async function getKvkVehicles(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkVehicle.findMany({
        where,
        orderBy: [
            { yearOfPurchase: 'desc' },
            { vehicleName: 'asc' },
        ],
    });
}

module.exports = {
    getKvkVehicles,
};
