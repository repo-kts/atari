const prisma = require('../../../config/prisma.js');

function buildDateRangeForYear(year) {
    const y = Number(year);
    if (!Number.isFinite(y) || y < 1900 || y > 9999) return null;
    return {
        start: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
        end:   new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
    };
}

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate || filters.endDate) {
        where.reportingYear = {};
        if (filters.startDate) where.reportingYear.gte = new Date(filters.startDate);
        if (filters.endDate)   where.reportingYear.lte = new Date(filters.endDate);
    }

    if (filters.year) {
        const range = buildDateRangeForYear(filters.year);
        if (range) {
            where.reportingYear = { gte: range.start, lte: range.end };
        }
    }

    return where;
}

/**
 * Format CampusType enum value into a human-readable label.
 * Values: ON_CAMPUS | OFF_CAMPUS
 */
function formatCampusType(value) {
    if (!value) return '-';
    return value === 'ON_CAMPUS' ? 'On Campus'
        :  value === 'OFF_CAMPUS' ? 'Off Campus'
        :  String(value).replace(/_/g, ' ');
}

function mapRecord(record) {
    const generalM = Number(record.generalM || 0);
    const generalF = Number(record.generalF || 0);
    const obcM     = Number(record.obcM     || 0);
    const obcF     = Number(record.obcF     || 0);
    const scM      = Number(record.scM      || 0);
    const scF      = Number(record.scF      || 0);
    const stM      = Number(record.stM      || 0);
    const stF      = Number(record.stF      || 0);

    const generalT = generalM + generalF;
    const obcT     = obcM + obcF;
    const scT      = scM + scF;
    const stT      = stM + stF;
    const grandM   = generalM + obcM + scM + stM;
    const grandF   = generalF + obcF + scF + stF;
    const grandT   = grandM + grandF;

    return {
        // ── identity ──────────────────────────────────────────────────────
        nariTrainingProgrammeId: record.nariTrainingProgrammeId,
        kvkId:                   record.kvkId,

        // ── KVK / location ────────────────────────────────────────────────
        kvkName:      record.kvk?.kvkName      || '',
        stateName:    record.kvk?.state?.stateName    || '',
        districtName: record.kvk?.district?.districtName || '',

        // ── programme details ─────────────────────────────────────────────
        nameOfNutriSmartVillage: record.nameOfNutriSmartVillage || '',
        villageName:             record.nameOfNutriSmartVillage || '',
        activityName:            record.activity?.activityName  || '',
        areaOfTraining:          record.areaOfTraining  || '',
        titleOfTraining:         record.titleOfTraining || '',
        campusType:              record.campusType || '',
        campusTypeLabel:         formatCampusType(record.campusType),
        venue:                   record.venue      || '',
        noOfDays:                Number(record.noOfDays     || 0),
        noOfCourses:             Number(record.noOfCourses  || 0),

        // ── beneficiary counts ────────────────────────────────────────────
        generalM, generalF, generalT,
        obcM,     obcF,     obcT,
        scM,      scF,      scT,
        stM,      stF,      stT,
        grandM,   grandF,   grandT,

        // ── flat aliases for frontend payload compatibility ────────────────
        genMale: generalM, genFemale: generalF,
        obcMale: obcM,     obcFemale: obcF,
        scMale:  scM,      scFemale:  scF,
        stMale:  stM,      stFemale:  stF,

        // ── reporting year ────────────────────────────────────────────────
        reportingYear: record.reportingYear || null,
    };
}

/**
 * Fetch training programme records for a KVK, with optional year/date filters.
 * @param {number} kvkId
 * @param {object} filters  – { year?, startDate?, endDate? }
 * @returns {Promise<Array>}
 */
async function getNariTrainingData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);

    const rows = await prisma.nariTrainingProgramme.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName:  true,
                    state:    { select: { stateName:    true } },
                    district: { select: { districtName: true } },
                },
            },
            activity: { select: { activityName: true } },
        },
        orderBy: [
            { reportingYear:            'asc' },
            { nariTrainingProgrammeId:  'asc' },
        ],
    });

    return rows.map(mapRecord);
}

module.exports = { getNariTrainingData };
