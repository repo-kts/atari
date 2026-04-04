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
        if (filters.startDate) {
            where.reportingYear.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            where.reportingYear.lte = new Date(filters.endDate);
        }
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
        craDetailsId: record.craDetailsId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateId: record.kvk?.state?.stateId || null,
        stateName: record.kvk?.state?.stateName || '',
        seasonName: record.season?.seasonName || '',
        interventions: record.interventions || '',
        croppingSystem: record.croppingSystem || '',
        farmingSystemName: record.farmingSystem?.farmingSystemName || '',
        areaInAcre: Number(record.areaInAcre || 0),
        cropYield: Number(record.cropYield || 0),
        systemProductivity: Number(record.systemProductivity || 0),
        totalReturn: Number(record.totalReturn || 0),
        farmerPracticeYield: Number(record.farmerPracticeYield || 0),
        reportingYear: record.reportingYear || null,
        generalM: Number(record.generalM || 0),
        generalF: Number(record.generalF || 0),
        obcM: Number(record.obcM || 0),
        obcF: Number(record.obcF || 0),
        scM: Number(record.scM || 0),
        scF: Number(record.scF || 0),
        stM: Number(record.stM || 0),
        stF: Number(record.stF || 0),
    };
}

async function getCraDetailsData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.craDetails.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                    state: { select: { stateId: true, stateName: true } },
                },
            },
            season: { select: { seasonId: true, seasonName: true } },
            farmingSystem: { select: { craFarmingSystemId: true, farmingSystemName: true } },
        },
        orderBy: [{ reportingYear: 'asc' }, { craDetailsId: 'asc' }],
    });

    return rows.map(mapRecord);
}

function mapExtensionRecord(record) {
    return {
        craExtensionActivityId: record.craExtensionActivityId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateName: record.kvk?.state?.stateName || '',
        extensionActivityName: record.activity?.activityName || '',
        withinStateOrOutState: record.withinStateWithoutState || record.withinStateOrWithoutState || record.withinState || '-',
        exposureVisitNo: Number(record.exposureVisitNo || 0),
        startDate: record.startDate || null,
        endDate: record.endDate || null,
        generalM: Number(record.generalM || 0),
        generalF: Number(record.generalF || 0),
        obcM: Number(record.obcM || 0),
        obcF: Number(record.obcF || 0),
        scM: Number(record.scM || 0),
        scF: Number(record.scF || 0),
        stM: Number(record.stM || 0),
        stF: Number(record.stF || 0),
    };
}

async function getCraExtensionActivityData(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate || filters.endDate) {
        where.startDate = {};
        if (filters.startDate) {
            where.startDate.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            where.startDate.lte = new Date(filters.endDate);
        }
    }

    const rows = await prisma.craExtensionActivity.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                    state: { select: { stateId: true, stateName: true } },
                },
            },
            activity: { select: { activityId: true, activityName: true } },
        },
        orderBy: [{ startDate: 'asc' }, { craExtensionActivityId: 'asc' }],
    });

    return rows.map(mapExtensionRecord);
}

module.exports = {
    getCraDetailsData,
    getCraExtensionActivityData,
};
