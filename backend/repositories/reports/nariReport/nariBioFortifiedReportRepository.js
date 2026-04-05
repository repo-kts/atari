const prisma = require('../../../config/prisma.js');

/**
 * Shared helper: build a UTC year range from a calendar year integer.
 */
function buildDateRangeForYear(year) {
    const y = Number(year);
    if (!Number.isFinite(y) || y < 1900 || y > 9999) return null;
    return {
        start: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
    };
}

/**
 * Build Prisma `where` clause from kvkId + year/date filters.
 */
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
            where.reportingYear = { gte: range.start, lte: range.end };
        }
    }

    return where;
}

/**
 * Normalise a raw DB record into the canonical report shape.
 * Computed totals (T columns) are derived here so templates/exports
 * never need to recompute them.
 */
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
        // ── identity ──────────────────────────────────────────────────────
        nariBioFortifiedCropId: record.nariBioFortifiedCropId,
        kvkId: record.kvkId,

        // ── KVK / location ────────────────────────────────────────────────
        kvkName: record.kvk?.kvkName || '',
        stateName: record.kvk?.state?.stateName || '',
        districtName: record.kvk?.district?.districtName || '',

        // ── crop meta ─────────────────────────────────────────────────────
        nameOfNutriSmartVillage: record.nameOfNutriSmartVillage || '',
        seasonName: record.season?.seasonName || '',
        activityName: record.activity?.activityName || '',
        cropCategoryName: record.cropCategory?.name || '',
        nameOfCrop: record.nameOfCrop || '',
        variety: record.variety || '',
        areaHa: Number(record.areaHa || 0),

        // ── beneficiary counts ────────────────────────────────────────────
        generalM, generalF, generalT,
        obcM, obcF, obcT,
        scM, scF, scT,
        stM, stF, stT,
        grandM, grandF, grandT,

        // ── flat aliases (frontend payload & export compatibility) ─────────
        villageName: record.nameOfNutriSmartVillage || '',
        cropCategory: record.cropCategory?.name || '',
        cropName: record.nameOfCrop || '',
        genMale: generalM, genFemale: generalF,
        obcMale: obcM, obcFemale: obcF,
        scMale: scM, scFemale: scF,
        stMale: stM, stFemale: stF,

        // ── reporting year ────────────────────────────────────────────────
        reportingYear: record.reportingYear || null,
    };
}

/**
 * Fetch bio-fortified crop records for a KVK, with optional year/date filters.
 * @param {number} kvkId
 * @param {object} filters  – { year?, startDate?, endDate? }
 * @returns {Promise<Array>}
 */
async function getNariBioFortifiedData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);

    const rows = await prisma.nariBioFortifiedCrop.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                    district: { select: { districtName: true } },
                },
            },
            season: { select: { seasonName: true } },
            activity: { select: { activityName: true } },
            cropCategory: { select: { name: true } },
        },
        orderBy: [
            { reportingYear: 'asc' },
            { nariBioFortifiedCropId: 'asc' },
        ],
    });

    return rows.map(mapRecord);
}

module.exports = { getNariBioFortifiedData };
