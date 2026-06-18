const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: DRMR Details — Achievements / Projects. Source: atariams.org
 * `project/view-drmr` (`drmrs` table). Writes drmr_details.
 *
 * Every field lives on the DataTables list row (nested kvk + flat
 * variety/yield/cost/return columns) — no per-row edit-page fetch. KVK is the
 * only FK; no masters to resolve. The old `anmr` (additional net monetary
 * return) column has no new-model column → dropped.
 *
 * Old → new field map:
 *   situations    → situation
 *   varieties_ip  → varietyImprovedPractice    varieties_fp → varietyFarmerPractice
 *   yield_ip/fp   → yieldImproved/FarmerKgPerHa  yiofp_fp   → yieldIncreasePercent
 *   coc_ip/fp     → costImproved/FarmerPerHa
 *   gmr_ip/fp     → grossReturnImproved/FarmerPerHa
 *   net_return_ip/fp → netReturnImproved/FarmerPerHa
 *   ratio_gmr_ip/fp  → bcRatioImproved/Farmer
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
    key: 'drmr-details',
    label: 'DRMR Details',
    model: 'drmrDetails',
    idField: 'drmrDetailsId',
    naturalKey: ['kvkId', 'reportingYear', 'situation', 'varietyImprovedPractice'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });

        // 1. KVK match — same guard as the other modules.
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

        // 2. Reporting year ← old fiscal int (e.g. 2024) → Jan 1 of that year (UTC).
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Required strings — keep raw text, default '' when absent.
        const situation = decodeEntities(cleanText(row.situations)) || '';
        const varietyImprovedPractice = decodeEntities(cleanText(row.varieties_ip)) || '';
        const varietyFarmerPractice = decodeEntities(cleanText(row.varieties_fp)) || '';
        if (!varietyImprovedPractice) warn('varietyImprovedPractice', 'No varieties_ip on old row');

        const data = {
            kvkId,
            reportingYear,
            situation,
            varietyImprovedPractice,
            varietyFarmerPractice,
            yieldImprovedKgPerHa: floatOrZero(row.yield_ip),
            yieldFarmerKgPerHa: floatOrZero(row.yield_fp),
            yieldIncreasePercent: floatOrZero(row.yiofp_fp),
            costImprovedPerHa: floatOrZero(row.coc_ip),
            costFarmerPerHa: floatOrZero(row.coc_fp),
            grossReturnImprovedPerHa: floatOrZero(row.gmr_ip),
            grossReturnFarmerPerHa: floatOrZero(row.gmr_fp),
            netReturnImprovedPerHa: floatOrZero(row.net_return_ip),
            netReturnFarmerPerHa: floatOrZero(row.net_return_fp),
            bcRatioImproved: floatOrZero(row.ratio_gmr_ip),
            bcRatioFarmer: floatOrZero(row.ratio_gmr_fp),
        };

        return { data, issues };
    },
};
