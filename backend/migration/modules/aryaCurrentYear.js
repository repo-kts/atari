const { parseDate, decodeEntities, cleanText, extractImgSrc } = require('../util.js');
const { normalize } = require('../masterResolver.js');

/**
 * Module spec: ARYA Current Year — Achievements / Projects. Source:
 * atariams.org `project/arya` (`arya` table). Writes arya_current_year.
 *
 * Every field lives on the DataTables list row (nested kvk + enterprise objects
 * and the full flat column set) — no per-row edit-page fetch. KVK + Enterprise
 * are the two FKs. Enterprise resolves by name against enterprise_master;
 * a miss parks the name in enterprise_other under the "Others" master row.
 *
 * Old → new field map:
 *   established_male/female  → unitsMale / unitsFemale
 *   viable_units/closed_units → viableUnits / closedUnits
 *   training_conducted        → trainingsConducted
 *   start_date/end_date       → startDate / endDate
 *   youth_trained_male/female → youthMale / youthFemale
 *   group_formed/active       → groupsFormed / groupsActive
 *   group_left                → personsLeftGroup
 *   no_of_members             → membersPerGroup
 *   avg_size                  → avgSizeOfUnit
 *   total_production          → totalProductionPerYear
 *   cost_of_production        → perUnitCostOfProduction
 *   sale_produce              → saleValueOfProduce
 *   employment_generated      → employmentGeneratedMandays
 *   images                    → imagePath
 * Old established_total, economic_gains, bc_ration have no new column → dropped.
 */

function intOrZero(v) {
    if (v === null || v === undefined || String(v).trim() === '') return 0;
    const n = parseInt(String(v).trim(), 10);
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
    key: 'arya-current-year',
    label: 'ARYA Current Year',
    model: 'aryaCurrentYear',
    idField: 'aryaCurrentYearId',
    naturalKey: ['kvkId', 'reportingYear', 'enterpriseId'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        enterpriseId: { master: 'enterprise' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });

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

        // 2. Reporting year ← old fiscal string (e.g. "2024") → Jan 1 of that year.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Enterprise — match by name; unmatched parks the text in enterpriseOther
        //    under the "Others" master row.
        const entObj = asObject(row.enterprise);
        const oldEntName = decodeEntities(cleanText(entObj?.name || row['enterprise.name'])) || '';
        let enterpriseId = null;
        let enterpriseOther = null;
        const hit = await ctx.resolver.resolve('enterprise', 'enterpriseName', 'enterpriseId', oldEntName);
        if (hit.matched) {
            enterpriseId = hit.id;
        } else {
            const others = await ctx.resolver.resolve('enterprise', 'enterpriseName', 'enterpriseId', 'Others');
            if (!others.matched) {
                return {
                    data: null,
                    issues: [{ field: 'enterpriseId', message: `Enterprise "${oldEntName}" unmatched and no "Others" master row exists — skipped`, severity: 'error' }],
                };
            }
            enterpriseId = others.id;
            enterpriseOther = oldEntName || null;
            warn('enterpriseId', `Enterprise "${oldEntName}" not in master — mapped to "Others" with enterprise_other`);
        }

        // 4. Required start/end dates — old rows can carry null; fall back to the
        //    reporting-year date (or now) so the NOT NULL column is satisfied.
        const fallbackDate = reportingYear || new Date();
        const startDate = (() => {
            const iso = parseDate(row.start_date);
            if (!iso) { warn('startDate', 'No start_date on old row — defaulted'); return fallbackDate; }
            return new Date(iso);
        })();
        const endDate = (() => {
            const iso = parseDate(row.end_date);
            if (!iso) { warn('endDate', 'No end_date on old row — defaulted'); return fallbackDate; }
            return new Date(iso);
        })();

        const data = {
            kvkId,
            reportingYear,
            enterpriseId,
            enterpriseOther,
            unitsMale: intOrZero(row.established_male),
            unitsFemale: intOrZero(row.established_female),
            viableUnits: intOrZero(row.viable_units),
            closedUnits: intOrZero(row.closed_units),
            trainingsConducted: intOrZero(row.training_conducted),
            startDate,
            endDate,
            youthMale: intOrZero(row.youth_trained_male),
            youthFemale: intOrZero(row.youth_trained_female),
            groupsFormed: intOrZero(row.group_formed),
            groupsActive: intOrZero(row.group_active),
            personsLeftGroup: intOrZero(row.group_left),
            membersPerGroup: intOrZero(row.no_of_members),
            avgSizeOfUnit: floatOrZero(row.avg_size),
            totalProductionPerYear: floatOrZero(row.total_production),
            perUnitCostOfProduction: floatOrZero(row.cost_of_production),
            saleValueOfProduce: floatOrZero(row.sale_produce),
            employmentGeneratedMandays: floatOrZero(row.employment_generated),
            imagePath: extractImgSrc(row.images),
        };

        return { data, issues };
    },
};
