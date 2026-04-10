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

/**
 * Rows for modular KVK report: one line per award (detailed layout).
 */
async function getKvkAwardReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.kvkAward.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                    district: { select: { districtName: true } },
                },
            },
        },
        orderBy: [{ reportingYear: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((r) => ({
        kvkAwardId: r.kvkAwardId,
        kvkName: r.kvk?.kvkName || '',
        stateName: r.kvk?.state?.stateName || '',
        districtName: r.kvk?.district?.districtName || '',
        awardName: r.awardName || '',
        amount: r.amount != null ? Number(r.amount) : 0,
        achievement: r.achievement || '',
        conferringAuthority: r.conferringAuthority || '',
    }));
}

module.exports = {
    getKvkAwardReportData,
};
