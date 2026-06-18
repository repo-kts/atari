const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NICRA Basic Information — Achievements / Projects. Source:
 * atariams.org `project/nicra/basic-information` (`nicra_basic_info` table).
 * Writes nicra_basic_info. Single flat table, KVK is the only FK.
 *
 * The new model has no reporting_year column; it keys off reportingDate, which
 * the form builds from a month+year picker. The old row carries `reporting_year`
 * ("2025") + `month` ("12") → reportingDate = first of that month (UTC).
 *
 * Old → new field map:
 *   normal/received        → rfNormal / rfReceived
 *   max/min                → tempMax / tempMin
 *   ten_days/fifteen_days/twenty_days → drySpell10Days / 15Days / 20Days
 *   intensive_rain         → intensiveRainAbove60mm
 *   water_depth            → waterDepthCm
 *   start_date/end_date    → startDate / endDate (both NOT NULL)
 * Old `duration` is derived (end-start) and recomputed in our UI → dropped.
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

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
    key: 'nicra-basic-info',
    label: 'NICRA Basic Information',
    model: 'nicraBasicInfo',
    idField: 'nicraBasicInfoId',
    naturalKey: ['kvkId', 'reportingDate', 'startDate'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // 1. KVK match — same guard as the other project modules.
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

        // 2. Dates (both REQUIRED). yyyy-mm-dd.
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start_date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end_date "${row.end_date}"`);

        // 3. reportingDate ← reporting_year + month → first of that month (UTC).
        // Fall back to startDate when the month/year pair is unusable.
        const reportingDate = (() => {
            const year = parseInt(String(row.reporting_year ?? '').trim(), 10);
            const month = parseInt(String(row.month ?? '').trim(), 10);
            if (Number.isInteger(year) && month >= 1 && month <= 12) {
                return new Date(Date.UTC(year, month - 1, 1));
            }
            if (startDate) { warn('reportingDate', 'No usable month/year — fell back to start_date'); return startDate; }
            return null;
        })();
        if (!reportingDate) err('reportingDate', 'Cannot derive reportingDate (no month/year or start_date)');

        const data = {
            kvkId,
            reportingDate,
            rfNormal: floatOrZero(row.normal),
            rfReceived: floatOrZero(row.received),
            tempMax: floatOrZero(row.max),
            tempMin: floatOrZero(row.min),
            drySpell10Days: intOrZero(row.ten_days),
            drySpell15Days: intOrZero(row.fifteen_days),
            drySpell20Days: intOrZero(row.twenty_days),
            intensiveRainAbove60mm: intOrZero(row.intensive_rain),
            waterDepthCm: floatOrZero(row.water_depth),
            startDate,
            endDate,
        };

        return { data, issues };
    },
};
