const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./common.js');

async function getKvkBankAccounts(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkBankAccount.findMany({
        where,
        orderBy: { createdAt: 'asc' },
    });
}

module.exports = {
    getKvkBankAccounts,
};
