const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NICRA Extension Activity — Achievements / Projects. Source:
 * atariams.org `project/nicra/extension-activity` (`nicra_extension_activity`
 * table). Writes nicra_extension_activity. Single flat table, KVK is the only
 * FK; the new model has no reporting_year.
 *
 * Old → new:
 *   activity_name → activityName
 *   start_date/end_date → startDate / endDate (old format is DD-MM-YYYY)
 *   no_of_program → venue  (the old column actually holds the location text,
 *                           e.g. "Village-Garhi, Block-Poreiyahat, Dist.-Godda")
 *   general_m … st_f → demographics
 * Old *_t totals + total_m/f are derived → dropped.
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
    key: 'nicra-extension-activity',
    label: 'NICRA Extension Activity',
    model: 'nicraExtensionActivity',
    idField: 'nicraExtensionActivityId',
    naturalKey: ['kvkId', 'activityName', 'startDate'],

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

        // 2. Dates (both REQUIRED). Old format is DD-MM-YYYY.
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start_date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end_date "${row.end_date}"`);

        const activityName = decodeEntities(cleanText(row.activity_name)) || '';
        if (!activityName) warn('activityName', 'No activity_name on old row — set to empty string');

        // venue (REQUIRED) ← old no_of_program location text.
        const venue = decodeEntities(cleanText(row.no_of_program)) || '';
        if (!venue) warn('venue', 'No venue/no_of_program on old row — set to empty string');

        const data = {
            kvkId,
            activityName,
            startDate,
            endDate,
            venue,
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
};
