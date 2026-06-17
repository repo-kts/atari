const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: FPO Management (Achievements / Projects, FPO & CBBO).
 * Source: atariams.org `project/view-fpo` (old table `fpos`). Writes
 * fpo_management.
 *
 * Every field lives on the DataTables list row (nested kvk object) — no per-row
 * edit-page fetch. Sibling of the FPO Details module; no master FKs beyond kvk.
 *
 * Old numeric fields arrive as strings and the old site uses "-" for "no value"
 * (e.g. total_bom_members, financial_position) → 0 for the Int/Float columns.
 * Free-text fields keep their value ("-" included). registration_no is often
 * "NA"/"-"; the new registrationNumber column is no longer @unique, so the raw
 * value is stored as-is.
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').replace(/[^\d-]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
}

function floatOrZero(v) {
    const n = parseFloat(String(v ?? '').replace(/[^\d.-]/g, ''));
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
    key: 'fpo-management',
    label: 'FPO Management',
    model: 'fpoManagement',
    idField: 'fpoManagementId',
    naturalKey: ['kvkId', 'reportingYear', 'fpoName', 'registrationNumber'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });
        const error = (field, msg) => issues.push({ field, message: msg, severity: 'error' });

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

        // 3. Free-text fields — all NOT NULL; default to '' and warn. "-" kept.
        const fpoName = decodeEntities(cleanText(row.fpo_name)) || '';
        if (!fpoName) warn('fpoName', 'No FPO name on old row');
        const address = decodeEntities(cleanText(row.fpo_address)) || '';
        if (!address) warn('address', 'No address on old row');
        // registration_no is no longer unique — store the raw value ("NA"/"-").
        const registrationNumber = decodeEntities(cleanText(row.registration_no)) || '';
        if (!registrationNumber) warn('registrationNumber', 'No registration number on old row');
        const proposedActivity = decodeEntities(cleanText(row.proposed_activity)) || '';
        if (!proposedActivity) warn('proposedActivity', 'No proposed activity on old row');
        const commodityIdentified = decodeEntities(cleanText(row.commodity_identified)) || '';
        if (!commodityIdentified) warn('commodityIdentified', 'No commodity identified on old row');
        const successIndicator = decodeEntities(cleanText(row.success_indicator)) || '';
        if (!successIndicator) warn('successIndicator', 'No success indicator on old row');

        // 4. Registration date (NOT NULL DateTime). yyyy-mm-dd on the old site.
        const regIso = parseDate(row.registration_date);
        if (!regIso) error('registrationDate', 'No registration date on old row — cannot seed');
        const registrationDate = regIso ? new Date(regIso) : null;

        // 5. Numeric fields — old strings, "-" for no value → 0.
        const totalBomMembers = intOrZero(row.total_bom_members);
        const totalFarmersAttached = intOrZero(row.total_farmers_attached);
        const financialPositionLakh = floatOrZero(row.financial_position);

        const data = {
            kvkId,
            reportingYear,
            fpoName,
            address,
            registrationNumber,
            registrationDate,
            proposedActivity,
            commodityIdentified,
            totalBomMembers,
            totalFarmersAttached,
            financialPositionLakh,
            successIndicator,
        };

        return { data, issues };
    },
};
