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
    return {
        aryaPrevYearId: record.aryaPrevYearId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateName: record.kvk?.state?.stateName || '',
        enterpriseName: record.enterprise?.enterpriseName || '',
        unitsMale: Number(record.unitsMale || 0),
        unitsFemale: Number(record.unitsFemale || 0),
        nonFunctionalUnitsClosed: Number(record.nonFunctionalUnitsClosed || 0),
        dateOfClosing: record.dateOfClosing || null,
        nonFunctionalUnitsRestarted: Number(record.nonFunctionalUnitsRestarted || 0),
        dateOfRestart: record.dateOfRestart || null,
        numberOfUnits: Number(record.numberOfUnits || 0),
        unitCapacity: Number(record.unitCapacity || 0),
        fixedCost: Number(record.fixedCost || 0),
        variableCost: Number(record.variableCost || 0),
        totalProductionPerUnitYear: Number(record.totalProductionPerUnitYear || 0),
        grossCostPerUnitYear: Number(record.grossCostPerUnitYear || 0),
        grossReturnPerUnitYear: Number(record.grossReturnPerUnitYear || 0),
        netBenefitPerUnitYear: Number(record.netBenefitPerUnitYear || 0),
        employmentFamilyMandays: Number(record.employmentFamilyMandays || 0),
        employmentOtherMandays: Number(record.employmentOtherMandays || 0),
        employmentTotalMandays: Number(record.employmentFamilyMandays || 0) + Number(record.employmentOtherMandays || 0),
        personsVisitedUnit: Number(record.personsVisitedUnit || 0),
        reportingYear: record.reportingYear || null,
    };
}

async function getAryaPrevData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.aryaPrevYear.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
            enterprise: { select: { enterpriseName: true } },
        },
        orderBy: [{ reportingYear: 'asc' }, { aryaPrevYearId: 'asc' }],
    });
    return rows.map(mapRecord);
}

module.exports = { getAryaPrevData };
