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

function mapResultRow(r) {
    return {
        cropName: r.cropName || '',
        variety: r.variety || '',
        areaSqm: Number(r.areaSqm || 0),
        productionKg: Number(r.productionKg || 0),
        consumptionKg: Number(r.consumptionKg || 0),
        sellKg: Number(r.sellKg || 0),
        income: Number(r.income || 0),
        reportingYear: r.reportingYear || null,
    };
}

function mapRecord(record) {
    const generalM = Number(record.generalM || 0);
    const generalF = Number(record.generalF || 0);
    const obcM = Number(record.obcM || 0);
    const obcF = Number(record.obcF || 0);
    const scM = Number(record.scM || 0);
    const scF = Number(record.scF || 0);
    const stM = Number(record.stM || 0);
    const stF = Number(record.stF || 0);
    const totalM = generalM + obcM + scM + stM;
    const totalF = generalF + obcF + scF + stF;

    return {
        nariNutritionalGardenId: record.nariNutritionalGardenId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateName: record.kvk?.state?.stateName || '',
        districtName: record.kvk?.district?.districtName || '',
        nameOfNutriSmartVillage: record.nameOfNutriSmartVillage || '',
        activityName: record.activity?.activityName || '',
        typeOfNutritionalGarden: record.typeOfNutritionalGarden?.name || '',
        number: Number(record.number || 0),
        areaSqm: Number(record.areaSqm || 0),
        generalM,
        generalF,
        obcM,
        obcF,
        scM,
        scF,
        stM,
        stF,
        totalM,
        totalF,
        totalT: totalM + totalF,
        reportingYear: record.reportingYear || null,
        results: Array.isArray(record.results) ? record.results.map(mapResultRow) : [],
    };
}

async function getNariNutritionGardenData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.nariNutritionalGarden.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                    district: { select: { districtName: true } },
                },
            },
            activity: { select: { activityName: true } },
            typeOfNutritionalGarden: { select: { name: true } },
            results: {
                orderBy: { nariNutritionalGardenResultId: 'asc' },
            },
        },
        orderBy: [{ reportingYear: 'asc' }, { nariNutritionalGardenId: 'asc' }],
    });

    return rows.map(mapRecord);
}

module.exports = {
    getNariNutritionGardenData,
};
