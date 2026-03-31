const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./common.js');

async function getKvkFarmImplements(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkFarmImplement.findMany({
        where,
        orderBy: [
            { yearOfPurchase: 'desc' },
            { implementName: 'asc' },
        ],
    });
}

module.exports = {
    getKvkFarmImplements,
};
