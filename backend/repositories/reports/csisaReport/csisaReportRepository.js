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

function fmtDate(d) {
    if (!d) return '';
    try { return new Date(d).toISOString().split('T')[0]; } catch { return ''; }
}

function fmtNum(v, decimals = 2) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return decimals === 0 ? Math.round(n) : parseFloat(n.toFixed(decimals));
}

/**
 * Expand each CSISA parent record into one flat row per CsisaCropDetail.
 * Parent fields (season, coverage counts, trial name, area) are repeated on
 * each crop row so the report renders without any rowspan complexity.
 *
 * @param {object} record – raw Prisma Csisa record with cropDetails included
 * @returns {Array<object>} – one normalised object per crop detail
 */
function expandRecord(record) {
    const crops = record.cropDetails && record.cropDetails.length > 0
        ? record.cropDetails
        : [null]; // render one row even if no crop detail exists

    return crops.map((crop) => ({
        // ── identity ──────────────────────────────────────────────────────
        csisaId:    record.csisaId,
        kvkId:      record.kvkId,

        // ── KVK / location ────────────────────────────────────────────────
        kvkName:      record.kvk?.kvkName      || '',
        stateName:    record.kvk?.state?.stateName    || '',
        districtName: record.kvk?.district?.districtName || '',

        // ── CSISA parent fields ───────────────────────────────────────────
        seasonName:       record.season?.seasonName || '',
        villagesCovered:  Number(record.villagesCovered  || 0),
        blocksCovered:    Number(record.blocksCovered    || 0),
        districtsCovered: Number(record.districtsCovered || 0),
        respondents:      Number(record.respondents      || 0),
        trialName:        record.trialName     || '',
        areaCoveredHa:    fmtNum(record.areaCoveredHa),

        // ── Crop detail fields (null-safe) ────────────────────────────────
        cropName:         crop?.cropName        || '',
        technologyOption: crop?.technologyOption || '',
        varietyName:      crop?.varietyName     || '',
        durationDays:     Number(crop?.durationDays    || 0),
        sowingDate:       fmtDate(crop?.sowingDate),
        harvestingDate:   fmtDate(crop?.harvestingDate),
        daysOfMaturity:   Number(crop?.daysOfMaturity  || 0),
        grainYieldQPerHa: fmtNum(crop?.grainYieldQPerHa),
        costOfCultivation:fmtNum(crop?.costOfCultivation),
        grossReturn:      fmtNum(crop?.grossReturn),
        netReturn:        fmtNum(crop?.netReturn),
        bcr:              fmtNum(crop?.bcr),

        // ── reporting year ────────────────────────────────────────────────
        reportingYear: record.reportingYear || null,
    }));
}

/**
 * Fetch CSISA records for a KVK and expand each into one row per crop detail.
 * @param {number} kvkId
 * @param {object} filters  – { year?, startDate?, endDate? }
 * @returns {Promise<Array>}
 */
async function getCsisaData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);

    const rows = await prisma.csisa.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName:  true,
                    state:    { select: { stateName:    true } },
                    district: { select: { districtName: true } },
                },
            },
            season:     { select: { seasonName: true } },
            cropDetails: true,
        },
        orderBy: [
            { reportingYear: 'asc' },
            { csisaId:       'asc' },
        ],
    });

    // Flatten: one flat object per crop detail
    return rows.flatMap(expandRecord);
}

module.exports = { getCsisaData };
