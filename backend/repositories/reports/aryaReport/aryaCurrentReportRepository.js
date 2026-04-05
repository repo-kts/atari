const prisma = require('../../../config/prisma.js');

function buildDateRangeForYear(year) {
    const y = Number(year);
    if (!Number.isFinite(y) || y < 1900 || y > 9999) return null;
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
        if (range) where.reportingYear = { gte: range.start, lte: range.end };
    }

    return where;
}

function mapRecord(record) {
    const unitsMale = Number(record.unitsMale || 0);
    const unitsFemale = Number(record.unitsFemale || 0);
    const youthMale = Number(record.youthMale || 0);
    const youthFemale = Number(record.youthFemale || 0);
    const perUnitCostOfProduction = Number(record.perUnitCostOfProduction || 0);
    const saleValueOfProduce = Number(record.saleValueOfProduce || 0);
    const economicGainsPerUnit = saleValueOfProduce - perUnitCostOfProduction;

    return {
        aryaCurrentYearId: record.aryaCurrentYearId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        enterpriseName: record.enterprise?.enterpriseName || '',
        trainingsConducted: Number(record.trainingsConducted || 0),
        unitsMale,
        unitsFemale,
        youthMale,
        youthFemale,
        viableUnits: Number(record.viableUnits || 0),
        closedUnits: Number(record.closedUnits || 0),
        avgSizeOfUnit: Number(record.avgSizeOfUnit || 0),
        totalProductionPerYear: Number(record.totalProductionPerYear || 0),
        perUnitCostOfProduction,
        saleValueOfProduce,
        economicGainsPerUnit,
        employmentGeneratedMandays: Number(record.employmentGeneratedMandays || 0),
        reportingYear: record.reportingYear || null,
    };
}

async function getAryaCurrentData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.aryaCurrentYear.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
            enterprise: { select: { enterpriseName: true } },
        },
        orderBy: [{ reportingYear: 'asc' }, { aryaCurrentYearId: 'asc' }],
    });

    return rows.map(mapRecord);
}

module.exports = { getAryaCurrentData };
