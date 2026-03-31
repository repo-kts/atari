const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./commonFilters.js');

async function getKvkBankAccounts(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkBankAccount.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
}

module.exports = {
    getKvkBankAccounts,
};

