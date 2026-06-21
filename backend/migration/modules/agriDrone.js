const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Agri Drone (introduction). Source: atariams.org
 * `project/agri-drone` (`kvk_agri_drone` table). Flat table, KVK only FK.
 *
 * The old list JSON only carries a subset of columns; the new model has many
 * NOT-NULL columns that the list never exposes (cost_per_drone, target_area,
 * demo amounts, operation_type, advantages, pilot_contact, project centre).
 * Mirror the natural-farming modules: default missing required text → '' and
 * required numbers → 0 so the row still seeds.
 *
 * Old → new:
 *   kvk.kvk_name             → kvkId (match against selected KVK)
 *   pic_name                 → pilotName
 *   company                  → droneCompany
 *   model                    → droneModel
 *   agri_drone_sanctioned    → dronesSanctioned
 *   agri_drone_purchased     → dronesPurchased
 *   amount_sanctioned        → amountSanctioned
 *   reporting_year ("2026")  → reportingYear (Jan 1 UTC, nullable)
 */

function floatOrZero(v) {
    if (v === null || v === undefined || String(v).trim() === '') return 0;
    const n = parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : 0;
}

function intOrZero(v) {
    if (v === null || v === undefined || String(v).trim() === '') return 0;
    const n = parseInt(String(v).trim(), 10);
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
    key: 'agri-drone',
    label: 'Agri Drone',
    model: 'kvkAgriDrone',
    idField: 'agriDroneId',
    naturalKey: ['kvkId', 'reportingYear', 'pilotName'],

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

        // 2. reporting year ← "reporting_year" → Jan 1 (UTC), nullable.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        const pilotName = decodeEntities(cleanText(row.pic_name)) || '';
        const droneCompany = decodeEntities(cleanText(row.company)) || '';
        const droneModel = decodeEntities(cleanText(row.model)) || '';

        // Columns absent from the old list — defaulted so the NOT-NULL row seeds.
        warn('*', 'Old list lacks cost_per_drone/target_area/demo amounts/operation_type/advantages/pilot_contact/project_implementing_centre — defaulted to 0/empty');

        const data = {
            kvkId: ctx.kvkId,
            projectImplementingCentre: '',
            dronesSanctioned: intOrZero(row.agri_drone_sanctioned),
            dronesPurchased: intOrZero(row.agri_drone_purchased),
            amountSanctioned: floatOrZero(row.amount_sanctioned),
            costPerDrone: 0,
            droneCompany,
            droneModel,
            pilotName,
            pilotContact: '',
            targetAreaHa: 0,
            demoAmountSanctioned: 0,
            demoAmountUtilised: 0,
            operationType: '',
            advantagesObserved: '',
            reportingYear,
        };

        return { data, issues };
    },
};
