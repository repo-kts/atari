const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc } = require('../util.js');

/**
 * Module spec: NICRA Others — Convergence Programme. Source: atariams.org
 * `project/nicra/convergence-program` (`nicra_convergence_programme` table).
 * Writes nicra_convergence_programme. Flat table, KVK is the only FK.
 *
 * Old → new:
 *   start_date/end_date (dd-mm-yyyy) → startDate / endDate (both NOT NULL)
 *   program                          → developmentSchemeProgramme
 *   work_nature                      → natureOfWork
 *   amount                           → amountRs
 *   images (JSON ["file.jpeg"])      → photographs (NOT NULL; first filename, '' when absent)
 * Old reporting_year has no new column → dropped.
 */

function floatOrZero(v) {
    if (v === null || v === undefined || String(v).trim() === '') return 0;
    const n = parseFloat(String(v).trim());
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

/**
 * Old `images` is either an <img …> blob or a JSON array of bare filenames
 * (HTML-entity-encoded), e.g. ["convergence-program-01769673075.jpeg"].
 * Return the first usable reference, or '' (column is NOT NULL).
 */
function firstPhoto(value) {
    const direct = extractImgSrc(value);
    if (direct) return direct;
    const decoded = decodeEntities(value);
    if (!decoded) return '';
    const arr = asObject(decoded);
    if (Array.isArray(arr) && arr.length) return String(arr[0]).trim();
    return '';
}

module.exports = {
    key: 'nicra-convergence-programme',
    label: 'NICRA Convergence Programme',
    model: 'nicraConvergenceProgramme',
    idField: 'nicraConvergenceProgrammeId',
    naturalKey: ['kvkId', 'startDate', 'developmentSchemeProgramme'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // 1. KVK match.
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

        // 2. Dates (both REQUIRED). Old format is dd-mm-yyyy.
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start_date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end_date "${row.end_date}"`);

        const developmentSchemeProgramme = decodeEntities(cleanText(row.program)) || '';
        if (!developmentSchemeProgramme) warn('developmentSchemeProgramme', 'No program on old row — set to empty string');

        const data = {
            kvkId,
            startDate,
            endDate,
            developmentSchemeProgramme,
            natureOfWork: decodeEntities(cleanText(row.work_nature)) || '',
            amountRs: floatOrZero(row.amount),
            photographs: firstPhoto(row.images),
        };

        return { data, issues };
    },
};
