'use strict';

const prisma = require('../../../config/prisma.js');
const { formatReportingYear } = require('../../../utils/reportingYearUtils.js');

// ─── Helpers ────────────────────────────────────────────────────────────────

function toNumber(v) {
    if (v == null) return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
}

function buildDateRangeForYear(yearStr) {
    if (!yearStr) return null;
    const [startY, endY] = String(yearStr).split('-').map(Number);
    if (!startY) return null;
    const effectiveEnd = endY || startY + 1;
    return {
        gte: new Date(`${startY}-04-01T00:00:00.000Z`),
        lte: new Date(`${effectiveEnd}-03-31T23:59:59.999Z`),
    };
}

function buildWhere(kvkId, filters, type) {
    const where = { kvkId: parseInt(kvkId), type };

    const rawYear = filters?.reportingYear || filters?.year;
    if (rawYear) {
        const range = buildDateRangeForYear(rawYear);
        if (range) where.reportingYear = range;
    } else if (filters?.reportingYearFrom || filters?.reportingYearTo) {
        where.reportingYear = {};
        if (filters.reportingYearFrom) {
            const r = buildDateRangeForYear(filters.reportingYearFrom);
            if (r) where.reportingYear.gte = r.gte;
        }
        if (filters.reportingYearTo) {
            const r = buildDateRangeForYear(filters.reportingYearTo);
            if (r) where.reportingYear.lte = r.lte;
        }
    }

    return where;
}

const ACTIVITY_INCLUDE = {
    kvk: { select: { kvkName: true } },
    tspScspType: { select: { typeName: true } },
    activity: { select: { activityName: true } },
    district: { select: { districtName: true } },
};

// ─── Mapping helpers ─────────────────────────────────────────────────────────

function mapRecord(r) {
    return {
        tspScspId: r.tspScspId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName || '',
        reportingYear: formatReportingYear(r.reportingYear),
        type: r.type,
        typeName: r.tspScspType?.typeName || r.type,
        activityId: r.activityId,
        activityName: r.activity?.activityName || '',
        noOfTrainings: toNumber(r.numberOfTrainingsOrDemos),
        noOfBeneficiaries: toNumber(r.numberOfBeneficiaries),
        fundsReceived: toNumber(r.fundsReceived),
        outcome1Unit: r.achievementFamilyIncomeUnit != null ? r.achievementFamilyIncomeUnit : '%',
        outcome2Unit: r.achievementConsumptionLevelUnit != null ? r.achievementConsumptionLevelUnit : '%',
        outcome3Unit: r.achievementImplementsAvailabilityUnit != null ? r.achievementImplementsAvailabilityUnit : '%',
        outcome1Achievement: toNumber(r.achievementFamilyIncome),
        outcome2Achievement: toNumber(r.achievementConsumptionLevel),
        outcome3Achievement: toNumber(r.achievementImplementsAvailability),
        districtId: r.districtId,
        districtName: r.district?.districtName || '',
        subDistrict: r.subDistrict || '',
        villagesCount: toNumber(r.numberOfVillagesCovered),
        villageNames: r.villageNamesCovered || '',
        stMale: toNumber(r.stMale),
        stFemale: toNumber(r.stFemale),
        stTotal: toNumber(r.stTotal),
    };
}

/**
 * Build structured TSP/SCSP report payload from raw records.
 * TSP has sections a (activities), b (fund), c (outcomes), d (location).
 * SCSP has only section a (activities).
 */
function buildStructuredData(records, type) {
    if (!records.length) {
        return {
            kvkName: '',
            reportingYear: '',
            type,
            activities: [],
            fundsReceived: null,
            outcomes: null,
            locationDetails: [],
            records: [],
        };
    }

    const mapped = records.map(mapRecord);
    const isTsp = type === 'TSP';

    // (a) Physical output – one row per activity record
    const activities = mapped.map(r => ({
        activityName: r.activityName,
        noOfTrainings: r.noOfTrainings,
        noOfBeneficiaries: r.noOfBeneficiaries,
    }));

    // (b) Fund received – first record with a non-zero value (TSP only)
    const fundsRecord = isTsp ? mapped.find(r => r.fundsReceived > 0) || mapped[0] : null;

    // (c) Physical outcomes – first record with outcome data (TSP only)
    const outcomesRecord = isTsp
        ? mapped.find(r => r.outcome1Achievement > 0 || r.outcome2Achievement > 0 || r.outcome3Achievement > 0) || mapped[0]
        : null;

    // (d) Location & beneficiary details – records that have district data (TSP only)
    const locationDetails = isTsp
        ? mapped.filter(r => r.districtId || r.subDistrict || r.villageNames)
        : [];

    return {
        kvkName: mapped[0].kvkName,
        reportingYear: mapped[0].reportingYear,
        type,
        activities,
        fundsReceived: fundsRecord?.fundsReceived ?? null,
        outcomes: outcomesRecord
            ? {
                familyIncome: {
                    description: 'Change in family income',
                    unit: outcomesRecord.outcome1Unit,
                    achievement: outcomesRecord.outcome1Achievement,
                },
                consumptionLevel: {
                    description: 'Change in family consumption level',
                    unit: outcomesRecord.outcome2Unit,
                    achievement: outcomesRecord.outcome2Achievement,
                },
                implementsAvailability: {
                    description: 'Change in availability of agricultural implements/ tools etc.',
                    unit: outcomesRecord.outcome3Unit,
                    achievement: outcomesRecord.outcome3Achievement,
                },
            }
            : null,
        locationDetails,
        records: mapped,
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch and structure TSP data for reporting.
 */
async function getTspData(kvkId, filters) {
    const records = await prisma.tspScsp.findMany({
        where: buildWhere(kvkId, filters, 'TSP'),
        include: ACTIVITY_INCLUDE,
        orderBy: { tspScspId: 'asc' },
    });
    return buildStructuredData(records, 'TSP');
}

/**
 * Fetch and structure SCSP data for reporting.
 */
async function getScspData(kvkId, filters) {
    const records = await prisma.tspScsp.findMany({
        where: buildWhere(kvkId, filters, 'SCSP'),
        include: ACTIVITY_INCLUDE,
        orderBy: { tspScspId: 'asc' },
    });
    return buildStructuredData(records, 'SCSP');
}

/**
 * Fetch and return combined TSP + SCSP structured data.
 * Used by the all-report section 2.23 which renders both sub-plans together.
 * Returns: { type: 'combined', tsp: {...}, scsp: {...} }
 */
async function getCombinedTspScspData(kvkId, filters) {
    const [tspRecords, scspRecords] = await Promise.all([
        prisma.tspScsp.findMany({
            where: buildWhere(kvkId, filters, 'TSP'),
            include: ACTIVITY_INCLUDE,
            orderBy: { tspScspId: 'asc' },
        }),
        prisma.tspScsp.findMany({
            where: buildWhere(kvkId, filters, 'SCSP'),
            include: ACTIVITY_INCLUDE,
            orderBy: { tspScspId: 'asc' },
        }),
    ]);

    return {
        type: 'combined',
        tsp: buildStructuredData(tspRecords, 'TSP'),
        scsp: buildStructuredData(scspRecords, 'SCSP'),
    };
}

module.exports = {
    getTspData,
    getScspData,
    getCombinedTspScspData,
};
