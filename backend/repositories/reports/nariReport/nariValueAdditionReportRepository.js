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
        productName: r.productName || '',
        amountProduced: Number(r.amountProduced || 0),
        marketPrice: Number(r.marketPrice || 0),
        netIncome: Number(r.netIncome || 0),
        shelfLife: r.shelfLife || '',
        fssaiCertified: r.fssaiCertified || '',
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
    const nameOfCrop = record.nameOfCrop || '';

    return {
        nariValueAdditionId: record.nariValueAdditionId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateName: record.kvk?.state?.stateName || '',
        districtName: record.kvk?.district?.districtName || '',
        nameOfNutriSmartVillage: record.nameOfNutriSmartVillage || '',
        nameOfCrop,
        cropName: nameOfCrop,
        nameOfValueAddedProduct: record.nameOfValueAddedProduct || '',
        activityName: record.activity?.activityName || '',
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

async function getNariValueAdditionData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.nariValueAddition.findMany({
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
            results: { orderBy: { nariValueAdditionResultId: 'asc' } },
        },
        orderBy: [{ reportingYear: 'asc' }, { nariValueAdditionId: 'asc' }],
    });

    return rows.map(mapRecord);
}

module.exports = {
    getNariValueAdditionData,
};
