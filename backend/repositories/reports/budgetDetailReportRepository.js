const prisma = require('../../config/prisma.js');

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate && filters.endDate) {
        where.AND = [
            { startDate: { lte: new Date(filters.endDate) } },
            { endDate: { gte: new Date(filters.startDate) } },
        ];
    } else if (filters.year) {
        const yearStr = String(filters.year);
        const yStart = new Date(`${yearStr}-01-01T00:00:00.000Z`);
        const yEnd = new Date(`${yearStr}-12-31T23:59:59.999Z`);
        where.AND = [
            { startDate: { lte: yEnd } },
            { endDate: { gte: yStart } },
        ];
    }

    return where;
}

function sum3(a, b, c) {
    return (Number(a) || 0) + (Number(b) || 0) + (Number(c) || 0);
}

async function getBudgetDetailReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.budgetDetail.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((r) => {
        const genTotal = sum3(
            r.generalMainGrantAllocation,
            r.generalTspGrantAllocation,
            r.generalScspGrantAllocation,
        );
        const capTotal = sum3(
            r.capitalMainGrantAllocation,
            r.capitalTspGrantAllocation,
            r.capitalScspGrantAllocation,
        );
        const grandTotal = (Number(r.salaryAllocation) || 0) + genTotal + capTotal;

        return {
            budgetDetailId: r.budgetDetailId,
            kvkId: r.kvkId,
            kvkName: r.kvk?.kvkName || '',
            startDate: r.startDate,
            endDate: r.endDate,
            salaryAllocation: r.salaryAllocation,
            generalMainGrantAllocation: r.generalMainGrantAllocation,
            generalTspGrantAllocation: r.generalTspGrantAllocation,
            generalScspGrantAllocation: r.generalScspGrantAllocation,
            generalTotalAllocation: genTotal,
            capitalMainGrantAllocation: r.capitalMainGrantAllocation,
            capitalTspGrantAllocation: r.capitalTspGrantAllocation,
            capitalScspGrantAllocation: r.capitalScspGrantAllocation,
            capitalTotalAllocation: capTotal,
            grandTotalAllocation: grandTotal,
        };
    });
}

module.exports = {
    getBudgetDetailReportData,
};
