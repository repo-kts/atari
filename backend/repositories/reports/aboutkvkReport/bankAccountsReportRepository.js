const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./commonFilters.js');

async function getKvkBankAccounts(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    const rows = await prisma.kvkBankAccount.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
            accountTypeMaster: { select: { accountType: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    // Display account type: master name → "Other" specify text → legacy enum.
    return rows.map((r) => ({
        ...r,
        accountType: r.accountTypeMaster?.accountType
            || r.accountTypeOther
            || r.accountType
            || '-',
    }));
}

module.exports = {
    getKvkBankAccounts,
};

