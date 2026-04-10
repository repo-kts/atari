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

async function getOperationalAreaReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.operationalArea.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ taluk: 'asc' }, { block: 'asc' }, { village: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((r) => ({
        operationalAreaId: r.operationalAreaId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName || '',
        taluk: r.taluk || '',
        block: r.block || '',
        village: r.village || '',
        majorCrops: r.majorCrops || '',
        majorProblems: r.majorProblems || '',
        thrustAreas: r.thrustAreas || '',
    }));
}

module.exports = {
    getOperationalAreaReportData,
};
