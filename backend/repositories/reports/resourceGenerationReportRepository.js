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

async function getResourceGenerationReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.resourceGeneration.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ createdAt: 'asc' }],
    });

    return rows.map((r) => ({
        resourceGenerationId: r.resourceGenerationId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName || '',
        programmeName: r.programmeName || '',
        programmePurpose: r.programmePurpose || '',
        sourcesOfFund: r.sourcesOfFund || '',
        amount: r.amount,
        infrastructureCreated: r.infrastructureCreated || '',
    }));
}

module.exports = {
    getResourceGenerationReportData,
};
