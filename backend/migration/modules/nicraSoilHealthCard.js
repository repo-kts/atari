const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc } = require('../util.js');

/**
 * Module spec: NICRA Others — Soil Health Card. Source: atariams.org
 * `project/nicra/soil-health-card` (`nicra_soil_health_card` table). Writes
 * nicra_soil_health_card. Flat table, KVK is the only FK.
 *
 * Old → new:
 *   start_date/end_date (dd-mm-yyyy) → startDate / endDate (both NOT NULL)
 *   soil_samples                     → noOfSoilSamplesCollected
 *   soil_samples_analyzed            → noOfSamplesAnalysed
 *   shc_issued ("25")                → shcIssued
 *   general_m … st_f                 → demographics
 *   images                           → photographs (nullable)
 * Old reporting_year, *_t totals, total_m/f, sub_total are derived → dropped.
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

module.exports = {
    key: 'nicra-soil-health-card',
    label: 'NICRA Soil Health Card',
    model: 'nicraSoilHealthCard',
    idField: 'nicraSoilHealthCardId',
    naturalKey: ['kvkId', 'startDate', 'noOfSoilSamplesCollected'],

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

        const data = {
            kvkId,
            startDate,
            endDate,
            noOfSoilSamplesCollected: intOrZero(row.soil_samples),
            noOfSamplesAnalysed: intOrZero(row.soil_samples_analyzed),
            shcIssued: intOrZero(row.shc_issued),
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
            photographs: extractImgSrc(row.images),
        };

        return { data, issues };
    },
};
