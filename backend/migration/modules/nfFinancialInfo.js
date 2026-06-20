const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Natural Farming — Budget & Expenditure. Source: atariams.org
 * `project/natural-farming/budget-expenditure` (`financial_information` table).
 * Writes financial_information. KVK + (nullable) activity FK.
 *
 * Old → new:
 *   reporting_year ("2026")  → year (Int) + reportingYearDate (Jan 1 UTC, nullable)
 *   activity.name            → activityId (resolve on activity master; nullable)
 *   no_of_activity           → numberOfActivities
 *   sanction                 → budgetSanction
 *   expenditure              → budgetExpenditure
 *   total_expenditure        → totalBudgetExpenditure
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
    key: 'nf-financial-info',
    label: 'Natural Farming — Budget & Expenditure',
    model: 'financialInformation',
    idField: 'financialInformationId',
    naturalKey: ['kvkId', 'year', 'activityId'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        activityId: { master: 'naturalFarmingActivity' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
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

        // 2. year (REQUIRED Int) + reportingYearDate (nullable).
        const year = parseInt(String(row.reporting_year ?? '').trim(), 10);
        if (!Number.isInteger(year)) err('year', `Missing/invalid reporting_year "${row.reporting_year}"`);
        const reportingYearDate = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. activity → activity master (nullable). Resolve by nested name.
        let activityId = null;
        const activityObj = asObject(row.activity);
        const activityName = decodeEntities(cleanText(activityObj?.name || row['activity.name']));
        if (activityName) {
            const hit = await r.resolve('naturalFarmingActivityMaster', 'activityName', 'naturalFarmingActivityId', activityName);
            if (hit.matched) activityId = hit.id;
            else warn('activityId', `Activity "${activityName}" not in our master — left null`);
        } else {
            warn('activityId', 'No activity on old row — left null');
        }

        const data = {
            kvkId,
            year: Number.isInteger(year) ? year : 0,
            reportingYearDate,
            activityId,
            numberOfActivities: intOrZero(row.no_of_activity),
            budgetSanction: floatOrZero(row.sanction),
            budgetExpenditure: floatOrZero(row.expenditure),
            totalBudgetExpenditure: floatOrZero(row.total_expenditure),
        };

        return { data, issues };
    },
};
