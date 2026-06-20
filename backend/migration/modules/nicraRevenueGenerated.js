const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NICRA Others — Revenue Generated. Source: atariams.org
 * `project/nicra/revenue-generated` (`nicra_revenue_generated` table). Writes
 * nicra_revenue_generated. Flat table, KVK is the only FK.
 *
 * Old → new:
 *   year ("2025") → reportingYear (Jan 1 UTC, nullable)
 *   revenue → revenue
 * Old `total` is a derived column (no new field) → dropped.
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
    key: 'nicra-revenue-generated',
    label: 'NICRA Revenue Generated',
    model: 'nicraRevenueGenerated',
    idField: 'nicraRevenueGeneratedId',
    naturalKey: ['kvkId', 'reportingYear', 'revenue'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });

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

        // 2. reporting year ← old "year" → Jan 1 (UTC), nullable.
        const reportingYear = (() => {
            const iso = parseDate(String(row.year ?? row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();
        if (!reportingYear) warn('reportingYear', `No usable year on old row ("${row.year}") — left null`);

        const data = {
            kvkId,
            reportingYear,
            revenue: floatOrZero(row.revenue),
        };

        return { data, issues };
    },
};
