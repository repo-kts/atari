const { parseDate, decodeEntities, cleanText } = require('../util.js');
const { normalize } = require('../masterResolver.js');

/**
 * Module spec: ARYA Previous Year (evaluation) — Achievements / Projects.
 * Source: atariams.org `project/arya-evaluation` (`arya_evaluation` table).
 * Writes arya_prev_year.
 *
 * Every field lives on the DataTables list row (nested kvk + enterprise objects
 * and the full flat column set) — no per-row edit-page fetch. KVK + Enterprise
 * are the two FKs (same enterprise-by-name resolution as arya-current-year).
 *
 * Old → new field map:
 *   established_male/female → unitsMale / unitsFemale
 *   total_closed            → nonFunctionalUnitsClosed
 *   closing_date            → dateOfClosing       (nullable)
 *   total_restarted         → nonFunctionalUnitsRestarted
 *   restarted_date          → dateOfRestart       (nullable)
 *   no_of_unit              → numberOfUnits
 *   unit_capacity           → unitCapacity
 *   fixed_cost/variable_cost → fixedCost / variableCost
 *   total_production        → totalProductionPerUnitYear
 *   gross_cost              → grossCostPerUnitYear
 *   gross_return            → grossReturnPerUnitYear
 *   net_benefit             → netBenefitPerUnitYear
 *   family                  → employmentFamilyMandays
 *   other_than_family       → employmentOtherMandays
 *   person_visited          → personsVisitedUnit
 * Old financial_year, established_total, viable_units, training_*, group_*,
 * no_of_members, cost_of_production, economic_gains, avg_size, sale_produce,
 * bc_ration, total_employment_generated, images have no new column → dropped.
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
    key: 'arya-prev-year',
    label: 'ARYA Previous Year',
    model: 'aryaPrevYear',
    idField: 'aryaPrevYearId',
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

        // 2. Reporting year ← old fiscal string (e.g. "2025") → Jan 1 of that year.
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

        // 4. Closing / restart dates are nullable on the new model — keep null.
        const dateOfClosing = (() => {
            const iso = parseDate(row.closing_date);
            return iso ? new Date(iso) : null;
        })();
        const dateOfRestart = (() => {
            const iso = parseDate(row.restarted_date);
            return iso ? new Date(iso) : null;
        })();

        const data = {
            kvkId,
            reportingYear,
            enterpriseId,
            enterpriseOther,
            unitsMale: intOrZero(row.established_male),
            unitsFemale: intOrZero(row.established_female),
            nonFunctionalUnitsClosed: intOrZero(row.total_closed),
            dateOfClosing,
            nonFunctionalUnitsRestarted: intOrZero(row.total_restarted),
            dateOfRestart,
            numberOfUnits: intOrZero(row.no_of_unit),
            unitCapacity: floatOrZero(row.unit_capacity),
            fixedCost: floatOrZero(row.fixed_cost),
            variableCost: floatOrZero(row.variable_cost),
            totalProductionPerUnitYear: floatOrZero(row.total_production),
            grossCostPerUnitYear: floatOrZero(row.gross_cost),
            grossReturnPerUnitYear: floatOrZero(row.gross_return),
            netBenefitPerUnitYear: floatOrZero(row.net_benefit),
            employmentFamilyMandays: floatOrZero(row.family),
            employmentOtherMandays: floatOrZero(row.other_than_family),
            personsVisitedUnit: intOrZero(row.person_visited),
        };

        return { data, issues };
    },
};
