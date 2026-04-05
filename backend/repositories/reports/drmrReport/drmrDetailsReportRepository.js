const prisma = require('../../../config/prisma.js');

function buildDateRangeForYear(year) {
    const y = Number(year);
    if (!Number.isFinite(y) || y < 1900 || y > 9999) {
        return null;
    }
    return {
        start: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
    };
}

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate || filters.endDate) {
        where.reportingYear = {};
        if (filters.startDate) where.reportingYear.gte = new Date(filters.startDate);
        if (filters.endDate) where.reportingYear.lte = new Date(filters.endDate);
    }

    if (filters.year) {
        const range = buildDateRangeForYear(filters.year);
        if (range) {
            where.reportingYear = {
                gte: range.start,
                lte: range.end,
            };
        }
    }

    return where;
}

function mapRecord(record) {
    return {
        drmrDetailsId: record.drmrDetailsId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        situation: record.situation || '',
        varietiesUsedInIp: record.varietyImprovedPractice || '',
        varietiesUsedInFp: record.varietyFarmerPractice || '',
        yieldImprovedKgPerHa: Number(record.yieldImprovedKgPerHa || 0),
        yieldFarmerKgPerHa: Number(record.yieldFarmerKgPerHa || 0),
        yieldIncreasePercent: Number(record.yieldIncreasePercent || 0),
        costImprovedPerHa: Number(record.costImprovedPerHa || 0),
        costFarmerPerHa: Number(record.costFarmerPerHa || 0),
        grossReturnImprovedPerHa: Number(record.grossReturnImprovedPerHa || 0),
        grossReturnFarmerPerHa: Number(record.grossReturnFarmerPerHa || 0),
        netReturnImprovedPerHa: Number(record.netReturnImprovedPerHa || 0),
        netReturnFarmerPerHa: Number(record.netReturnFarmerPerHa || 0),
        bcRatioImproved: Number(record.bcRatioImproved || 0),
        bcRatioFarmer: Number(record.bcRatioFarmer || 0),
        reportingYear: record.reportingYear || null,
    };
}

async function getDrmrDetailsData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.drmrDetails.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ reportingYear: 'asc' }, { drmrDetailsId: 'asc' }],
    });

    return rows.map(mapRecord);
}

module.exports = {
    getDrmrDetailsData,
};
