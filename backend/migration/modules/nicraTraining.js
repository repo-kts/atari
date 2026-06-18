const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NICRA Training — Achievements / Projects. Source: atariams.org
 * `project/nicra/training` (`nicra_training` table). Writes nicra_training.
 * Single flat table, KVK is the only FK; the new model has no reporting_year.
 *
 * Old → new:
 *   title        → titleOfTraining
 *   campus_type  → campusType (CampusType enum: "Off-campus" → OFF_CAMPUS, else ON_CAMPUS)
 *   start_date/end_date → startDate / endDate
 *   remark       → remark
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
    key: 'nicra-training',
    label: 'NICRA Training',
    model: 'nicraTraining',
    idField: 'nicraTrainingId',
    naturalKey: ['kvkId', 'titleOfTraining', 'startDate'],

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

        // 3. Campus type → CampusType enum (REQUIRED).
        const campusRaw = normalize(row.campus_type || '');
        const campusType = campusRaw.includes('off') ? 'OFF_CAMPUS' : 'ON_CAMPUS';
        if (!campusRaw) warn('campusType', 'No campus_type on old row — defaulted to ON_CAMPUS');

        const titleOfTraining = decodeEntities(cleanText(row.title)) || '';
        if (!titleOfTraining) warn('titleOfTraining', 'No title on old row — set to empty string');

        const data = {
            kvkId,
            titleOfTraining,
            campusType,
            startDate,
            endDate,
            remark: decodeEntities(cleanText(row.remark)) || '',
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
