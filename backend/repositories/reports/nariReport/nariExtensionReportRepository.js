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
    const generalM = Number(record.generalM || 0);
    const generalF = Number(record.generalF || 0);
    const obcM = Number(record.obcM || 0);
    const obcF = Number(record.obcF || 0);
    const scM = Number(record.scM || 0);
    const scF = Number(record.scF || 0);
    const stM = Number(record.stM || 0);
    const stF = Number(record.stF || 0);

    const generalT = generalM + generalF;
    const obcT = obcM + obcF;
    const scT = scM + scF;
    const stT = stM + stF;
    const grandM = generalM + obcM + scM + stM;
    const grandF = generalF + obcF + scF + stF;
    const grandT = grandM + grandF;

    return {
        nariExtensionActivityId: record.nariExtensionActivityId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateName: record.kvk?.state?.stateName || '',
        districtName: record.kvk?.district?.districtName || '',
        nameOfNutriSmartVillage: record.nameOfNutriSmartVillage || '',
        titleOrTypeOfActivity: record.nameOfActivity || record.activity?.activityName || '',
        noOfActivities: Number(record.noOfActivities || 0),
        generalM, generalF, generalT,
        obcM, obcF, obcT,
        scM, scF, scT,
        stM, stF, stT,
        grandM, grandF, grandT,
        reportingYear: record.reportingYear || null,
    };
}

async function getNariExtensionData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.nariExtensionActivity.findMany({
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
        },
        orderBy: [{ reportingYear: 'asc' }, { nariExtensionActivityId: 'asc' }],
    });

    return rows.map(mapRecord);
}

module.exports = { getNariExtensionData };
