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

async function getDistrictLevelDataReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.districtLevelData.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ createdAt: 'asc' }],
    });

    return rows.map((r) => ({
        districtLevelDataId: r.districtLevelDataId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName || '',
        reportingYear: r.reportingYear,
        items: r.items || '',
        information: r.information || '',
        season: r.season || '',
        type: r.type || '',
        cropName: r.cropName || '',
        area: r.area,
        production: r.production,
        productivity: r.productivity,
        month: r.month || '',
        rainfall: r.rainfall,
        maxTemp: r.maxTemp,
        minTemp: r.minTemp,
        maxRH: r.maxRH,
        minRH: r.minRH,
        livestockName: r.livestockName || '',
        number: r.number,
    }));
}

module.exports = {
    getDistrictLevelDataReportData,
};
