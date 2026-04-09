const prisma = require('../../config/prisma.js');

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate && filters.endDate) {
        where.reportingYear = {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
        };
    } else if (filters.year) {
        const yearStr = String(filters.year);
        where.reportingYear = {
            gte: new Date(`${yearStr}-01-01`),
            lte: new Date(`${yearStr}-12-31T23:59:59.999Z`),
        };
    }

    return where;
}

async function getRevolvingFundReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.revolvingFund.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ reportingYear: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((r) => {
        const opening = Number(r.openingBalance) || 0;
        const income = Number(r.incomeDuringYear) || 0;
        const exp = Number(r.expenditureDuringYear) || 0;
        const closing = opening + income - exp;

        return {
            revolvingFundId: r.revolvingFundId,
            kvkId: r.kvkId,
            kvkName: r.kvk?.kvkName || '',
            reportingYear: r.reportingYear,
            openingBalance: r.openingBalance,
            incomeDuringYear: r.incomeDuringYear,
            expenditureDuringYear: r.expenditureDuringYear,
            closingBalance: closing,
            kind: r.kind,
        };
    });
}

module.exports = {
    getRevolvingFundReportData,
};
