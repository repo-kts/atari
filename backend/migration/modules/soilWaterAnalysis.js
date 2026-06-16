const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Soil, Water & Plant Analysis (Achievements). Source:
 * atariams.org `soil-water-testing/analysis-details`. Writes
 * kvk_soil_water_analysis (model KkvSoilWaterAnalysis).
 *
 * Every field lives on the DataTables list row (nested kvk/analysis_data
 * objects, flat demographics) — no per-row edit-page fetch. The old `_t` totals
 * (general_t, total_*) are derived on the old site and recomputed in our UI —
 * dropped here.
 *
 * analysis_data.name → SoilWaterAnalysis master (analysis_name @unique, global,
 * no kvkId). It's a REQUIRED non-null FK with no `_other` escape column, so an
 * unmatched name is findOrCreate'd into the master (mirrors the celebration-day
 * ImportantDay path) rather than dropping the row.
 *
 * samples_analysed_through is a REQUIRED string; the new form restricts it to a
 * fixed list ('Mini soil testing kit' / 'Soil testing laboratory' / 'Other').
 * The old `testing_through` is a slug (e.g. "testing_laboratory") canonicalised
 * onto that list, falling back to 'Other'.
 *
 * reporting_year is nullable; the old row carries it as a bare year int (e.g.
 * 2026) → parseDate turns it into Jan 1 of that year (UTC), which lands inside
 * the calendar-year report filter.
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return null; }
    }
    return null;
}

/** Canonicalise the old `testing_through` slug onto the form's fixed list. */
function canonicalMode(raw) {
    const t = normalize(raw || '');
    if (!t) return null;
    if (t.includes('kit')) return 'Mini soil testing kit';
    if (t.includes('lab')) return 'Soil testing laboratory';
    return 'Other';
}

module.exports = {
    key: 'soilWaterAnalysis',
    label: 'Soil, Water & Plant Analysis',
    model: 'kkvSoilWaterAnalysis',
    idField: 'soilWaterAnalysisId',
    naturalKey: ['kvkId', 'startDate', 'endDate', 'analysisId', 'samplesAnalysed'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        analysisId: { master: 'soilWaterAnalysis' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // ── KVK ───────────────────────────────────────────────────────────
        const kvkObj = asObject(row.kvk);
        const oldKvkName = decodeEntities(cleanText(kvkObj?.kvk_name || row['kvk.kvk_name'])) || '';
        if (!oldKvkName) {
            warn('kvkId', 'KVK name not in row — using selected target KVK');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }
        const kvkId = ctx.kvkId;

        // ── Dates (both REQUIRED) — old format is DD-MM-YYYY ───────────────
        const startIso = parseDate(row.start_date);
        const startDate = startIso ? new Date(startIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start_date "${row.start_date}"`);

        const endIso = parseDate(row.end_date);
        const endDate = endIso ? new Date(endIso) : null;
        if (!endDate) err('endDate', `Missing/invalid end_date "${row.end_date}"`);

        // ── Analysis type ← analysis_data.name → SoilWaterAnalysis master ──
        // REQUIRED non-null FK, no `_other` column → findOrCreate when unmatched.
        let analysisId = null;
        const analysisObj = asObject(row.analysis_data);
        const analysisName = decodeEntities(cleanText(analysisObj?.name || row['analysis_data.name'] || ''));
        if (analysisName) {
            const hit = await r.findOrCreate('soilWaterAnalysis', 'analysisName', 'soilWaterAnalysisId', analysisName);
            analysisId = hit.id;
            if (hit.created) warn('analysisId', `Analysis "${analysisName}" not in master — created`);
        } else {
            err('analysisId', 'No analysis type on old row — required');
        }

        // ── Samples analysed through (REQUIRED string, fixed list) ─────────
        let samplesAnalysedThrough = canonicalMode(row.testing_through);
        if (!samplesAnalysedThrough) {
            samplesAnalysedThrough = 'Other';
            warn('samplesAnalysedThrough', `No/unknown testing_through "${row.testing_through}" — defaulted to "Other"`);
        }

        // ── Counts / amount (REQUIRED ints) ────────────────────────────────
        const samplesAnalysed = intOrZero(row.no_of_sample);
        const villagesNumber = intOrZero(row.no_of_village);
        const amountRealized = intOrZero(row.amount);

        // ── Reporting year (nullable) — old bare year int → Jan 1 (UTC) ────
        const reportingYear = row.reporting_year != null
            ? (() => { const iso = parseDate(String(row.reporting_year)); return iso ? new Date(iso) : null; })()
            : null;

        const data = {
            kvkId,
            startDate,
            endDate,
            analysisId,
            samplesAnalysedThrough,
            samplesAnalysed,
            villagesNumber,
            amountRealized,
            reportingYear,
            // Demographics ← flat list columns (*_t totals dropped, UI recomputes).
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        // Always insert — the old site holds genuine duplicate analysis rows
        // (same kvk, dates, type, counts) that are distinct records. No dedupe.
        await prisma.kkvSoilWaterAnalysis.create({ data });
        return 'created';
    },
};
