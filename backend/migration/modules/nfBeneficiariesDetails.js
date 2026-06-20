const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Natural Farming — Beneficiaries Details. Source: atariams.org
 * `project/natural-farming/beneficiaries-details` (`beneficiaries_details` table).
 * Writes beneficiaries_details. Flat table, KVK is the only FK.
 *
 * Old → new:
 *   reporting_year ("2026")       → year (Int) + reportingYearDate (Jan 1 UTC, nullable)
 *   no_of_block                   → blocksCovered
 *   no_of_village                 → villagesCovered
 *   no_of_training                → totalTrainedFarmers
 *   no_of_influenced_farmer       → farmersInfluenced
 *   no_of_farmer_all_Season       → farmersEngagedAllSeason
 *   no_of_farmer_one_Season       → farmersEngagedOneSeason
 *   feedback                      → remarks (NOT NULL; '' when absent)
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
    key: 'nf-beneficiaries-details',
    label: 'Natural Farming — Beneficiaries Details',
    model: 'beneficiariesDetails',
    idField: 'beneficiariesDetailsId',
    naturalKey: ['kvkId', 'year', 'blocksCovered'],

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

        // 2. year (REQUIRED Int) + reportingYearDate (nullable) from reporting_year.
        const year = parseInt(String(row.reporting_year ?? '').trim(), 10);
        if (!Number.isInteger(year)) err('year', `Missing/invalid reporting_year "${row.reporting_year}"`);
        const reportingYearDate = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        const data = {
            kvkId,
            year: Number.isInteger(year) ? year : 0,
            reportingYearDate,
            blocksCovered: intOrZero(row.no_of_block),
            villagesCovered: intOrZero(row.no_of_village),
            totalTrainedFarmers: intOrZero(row.no_of_training),
            farmersInfluenced: intOrZero(row.no_of_influenced_farmer),
            farmersEngagedAllSeason: intOrZero(row.no_of_farmer_all_Season),
            farmersEngagedOneSeason: intOrZero(row.no_of_farmer_one_Season),
            remarks: decodeEntities(cleanText(row.feedback)) || '',
        };

        return { data, issues };
    },
};
