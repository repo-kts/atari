const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, toBool } = require('../util.js');

/**
 * Module spec: Formation & Promotion of FPOs as CBBOs under NCDC funding
 * (Achievements / Projects). Source: atariams.org `project/view-fpo-cbbo`
 * (old table `fpo_cbbos`). Writes fpo_cbbo_details.
 *
 * Every field lives on the DataTables list row (nested kvk object) — no per-row
 * edit-page fetch. One flat row per KVK per reporting year; no master FKs beyond
 * kvk. The sibling FpoManagement model has no counterpart on this old endpoint,
 * so it is not migrated here.
 *
 * The old row carries an extra `major_area` ("Agriculture and allied") with no
 * field on the new model — dropped. Numeric counts arrive as strings ("4", "6")
 * → Int (all NOT NULL, default 0). The three Yes/No flags
 * (training_recieved / business_plan / business_plan_without_cbbo) → Boolean.
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
    key: 'fpo-cbbo',
    label: 'FPOs as CBBOs (NCDC)',
    model: 'fpoCbboDetails',
    idField: 'fpoCbboDetailsId',
    naturalKey: ['kvkId', 'reportingYear'],

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

        // 3. Numeric counts — old strings → Int (all NOT NULL, default 0).
        const blocksAllocated = intOrZero(row.blocks_allocated);
        const fposRegisteredAsCbbo = intOrZero(row.registered_cbbo);
        const avgMembersPerFpo = intOrZero(row.avrg_members_fpo);
        const fposReceivedManagementCost = intOrZero(row.management_cost);
        const fposReceivedEquityGrant = intOrZero(row.equity_grant);
        const techBackstoppingProvided = intOrZero(row.tech_backstopping);
        const trainingProgrammeOrganized = intOrZero(row.training_programs);
        const assistanceInEconomicActivities = intOrZero(row.economic_activities);
        const fposDoingBusiness = intOrZero(row.bussiness_fpo);

        // 4. Yes/No flags → Boolean (NOT NULL).
        const trainingReceivedByMembers = toBool(row.training_recieved);
        const businessPlanPreparedWithCbbo = toBool(row.business_plan);
        const businessPlanPreparedWithoutCbbo = toBool(row.business_plan_without_cbbo);

        const data = {
            kvkId,
            reportingYear,
            blocksAllocated,
            fposRegisteredAsCbbo,
            avgMembersPerFpo,
            fposReceivedManagementCost,
            fposReceivedEquityGrant,
            techBackstoppingProvided,
            trainingProgrammeOrganized,
            trainingReceivedByMembers,
            assistanceInEconomicActivities,
            businessPlanPreparedWithCbbo,
            businessPlanPreparedWithoutCbbo,
            fposDoingBusiness,
        };

        return { data, issues };
    },
};
