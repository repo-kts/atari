const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Scientist Awards & Recognition (Achievements).
 * Source: atariams.org `award-and-recognition/scientist`. Writes scientist_award.
 *
 * Every field lives on the DataTables list row (nested kvk + kvk_staff objects)
 * — no per-row edit-page fetch. No master FKs beyond kvk; scientistName/
 * awardName/achievement/conferringAuthority are free text on the new model.
 *
 * scientist_name comes from the nested kvk_staff.staff_name (free text on the
 * new model, NOT an FK). Old typo `conferring_autority` → conferringAuthority.
 * `amount` is a string on the old row ("0", "5000") → Int (NOT NULL, default 0).
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').replace(/[^\d-]/g, ''), 10);
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
    key: 'scientist-award',
    label: 'Awards & Recognition (Scientist)',
    model: 'scientistAward',
    idField: 'scientistAwardId',
    naturalKey: ['kvkId', 'reportingYear', 'scientistName', 'awardName', 'achievement'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });

        // 1. KVK match — same guard as the other achievement modules.
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

        // 2. Reporting year ← old fiscal int (e.g. 2025) → Jan 1 of that year (UTC).
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Scientist name ← nested kvk_staff.staff_name (free text, NOT an FK).
        const staffObj = asObject(row.kvk_staff);
        const scientistName = decodeEntities(cleanText(staffObj?.staff_name || row['kvk_staff.staff_name'])) || '';
        if (!scientistName) warn('scientistName', 'No staff name on old row');

        // 4. Free-text fields — all NOT NULL; default to '' and warn when absent.
        const awardName = decodeEntities(cleanText(row.award_name)) || '';
        if (!awardName) warn('awardName', 'No award name on old row');
        const achievement = decodeEntities(cleanText(row.achievement)) || '';
        if (!achievement) warn('achievement', 'No achievement on old row');
        // Old typo `conferring_autority` (no `h`).
        const conferringAuthority = decodeEntities(cleanText(row.conferring_autority ?? row.conferring_authority)) || '';
        if (!conferringAuthority) warn('conferringAuthority', 'No conferring authority on old row');

        // 5. Amount — old string ("0", "5000") → Int (NOT NULL).
        const amount = intOrZero(row.amount);

        const data = {
            kvkId,
            reportingYear,
            scientistName,
            awardName,
            amount,
            achievement,
            conferringAuthority,
        };

        return { data, issues };
    },
};
