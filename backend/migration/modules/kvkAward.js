const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Awards & Recognition (Achievements).
 * Source: atariams.org `award-and-recognition/kvk`. Writes kvk_award.
 *
 * Every field lives on the DataTables list row (nested kvk object) — no per-row
 * edit-page fetch. No master FKs beyond kvk; awardName/achievement/
 * conferringAuthority are free text on the new model too.
 *
 * Old typo `conferring_autority` → conferringAuthority. `amount` is a string on
 * the old row ("0", "5000") → Int (NOT NULL, defaults to 0).
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
    key: 'kvk-award',
    label: 'Awards & Recognition (KVK)',
    model: 'kvkAward',
    idField: 'kvkAwardId',
    naturalKey: ['kvkId', 'reportingYear', 'awardName', 'achievement', 'conferringAuthority'],

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

        // 3. Free-text fields. awardName/conferringAuthority/achievement are all
        // NOT NULL — default to '' and warn when absent.
        const awardName = decodeEntities(cleanText(row.award_name)) || '';
        if (!awardName) warn('awardName', 'No award name on old row');
        const achievement = decodeEntities(cleanText(row.achievement)) || '';
        if (!achievement) warn('achievement', 'No achievement on old row');
        // Old typo `conferring_autority` (no `h`).
        const conferringAuthority = decodeEntities(cleanText(row.conferring_autority ?? row.conferring_authority)) || '';
        if (!conferringAuthority) warn('conferringAuthority', 'No conferring authority on old row');

        // 4. Amount — old string ("0", "5000") → Int (NOT NULL).
        const amount = intOrZero(row.amount);

        const data = {
            kvkId,
            reportingYear,
            awardName,
            amount,
            achievement,
            conferringAuthority,
        };

        return { data, issues };
    },
};
