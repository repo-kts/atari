const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Natural Farming — Geographical Information. Source: atariams.org
 * `project/natural-farming/geopgraphical-information` (`geographical_info` table).
 * Writes geographical_info. Flat table, KVK is the only FK.
 *
 * Old → new:
 *   start_date/end_date (yyyy-mm-dd) → startDate / endDate (both NOT NULL)
 *   agro_climatic_zone               → agroClimaticZone
 *   farming_situation                → farmingSituation
 *   latitude / longitude             → latitude / longitude
 *   reporting_year ("2025")          → reportingYear (Jan 1 UTC, nullable)
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

module.exports = {
    key: 'nf-geographical-info',
    label: 'Natural Farming — Geographical Info',
    model: 'geographicalInfo',
    idField: 'geographicalInfoId',
    naturalKey: ['kvkId', 'startDate', 'agroClimaticZone'],

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

        // 2. Dates (both REQUIRED).
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start_date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end_date "${row.end_date}"`);

        // 3. reporting year ← old "reporting_year" → Jan 1 (UTC), nullable.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        const data = {
            kvkId,
            startDate,
            endDate,
            agroClimaticZone: decodeEntities(cleanText(row.agro_climatic_zone)) || '',
            farmingSituation: decodeEntities(cleanText(row.farming_situation)) || '',
            latitude: floatOrZero(row.latitude),
            longitude: floatOrZero(row.longitude),
            reportingYear,
        };

        return { data, issues };
    },
};
