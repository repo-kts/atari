const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: DRMR Activity — Achievements / Projects. Source: atariams.org
 * `project/view-drmr-activity` (`drmr_activities` table). Writes a parent
 * drmr_activity row + one drmr_activity_component per non-zero activity type.
 *
 * The old row is one flat record holding every activity type's count/qty + unit;
 * the new model normalises those into a child table keyed by DrmrActivityType.
 * The old list carries no farmer demographics (general_m … st_f) and no
 * per-component specification, so those default to 0 / null. Each old
 * <thing>_count|qty + <thing>_count|qty_unit pair maps to one enum component:
 *
 *   training_count        → TRAINING
 *   fld_count             → FRONTLINE_DEMONSTRATION
 *   awareness_count       → AWARENESS_CAMP
 *   seeds_qty             → INPUT_SEEDS
 *   small_equip_qty       → INPUT_SMALL_EQUIPMENT
 *   large_equip_qty       → INPUT_LARGE_EQUIPMENT
 *   fertilizer_qty        → INPUT_FERTILIZER
 *   pp_chemicals_qty      → INPUT_PPC
 *   lecture_count         → LITERATURE_DISTRIBUTION
 *   kisan_mela_count      → KISAN_MELA
 *   any_other_count       → OTHER
 *
 * total_budget → totalBudgetUtilized. A component is emitted only when its
 * quantity > 0 (0 means the activity didn't happen) — seedRecord creates the
 * parent then the components.
 */

const COMPONENT_MAP = [
    ['TRAINING', 'training_count', 'training_count_unit'],
    ['FRONTLINE_DEMONSTRATION', 'fld_count', 'fld_count_unit'],
    ['AWARENESS_CAMP', 'awareness_count', 'awareness_count_unit'],
    ['INPUT_SEEDS', 'seeds_qty', 'seeds_qty_unit'],
    ['INPUT_SMALL_EQUIPMENT', 'small_equip_qty', 'small_equip_qty_unit'],
    ['INPUT_LARGE_EQUIPMENT', 'large_equip_qty', 'large_equip_qty_unit'],
    ['INPUT_FERTILIZER', 'fertilizer_qty', 'fertilizer_qty_unit'],
    ['INPUT_PPC', 'pp_chemicals_qty', 'pp_chemicals_qty_unit'],
    ['LITERATURE_DISTRIBUTION', 'lecture_count', 'lecture_count_unit'],
    ['KISAN_MELA', 'kisan_mela_count', 'kisan_mela_count_unit'],
    ['OTHER', 'any_other_count', 'any_other_count_unit'],
];

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

const ZERO_DEMOGRAPHICS = {
    generalM: 0, generalF: 0, obcM: 0, obcF: 0,
    scM: 0, scF: 0, stM: 0, stF: 0,
};

module.exports = {
    key: 'drmr-activity',
    label: 'DRMR Activity',
    model: 'drmrActivity',
    idField: 'drmrActivityId',
    naturalKey: ['kvkId', 'reportingYear', 'startDate', 'endDate'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });
        const error = (field, msg) => issues.push({ field, message: msg, severity: 'error' });

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

        // 3. Dates (both REQUIRED, NOT NULL). yyyy-mm-dd. Each falls back to the
        // other when missing; a row with neither can't be seeded → error.
        let startIso = parseDate(row.start_date);
        let endIso = parseDate(row.end_date);
        if (!startIso) startIso = endIso;
        if (!endIso) endIso = startIso;
        if (!startIso) error('startDate', 'No start/end date on old row — cannot seed');
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;

        // 4. Components — one per activity type with a non-zero quantity.
        const components = [];
        for (const [activityType, qtyField, unitField] of COMPONENT_MAP) {
            const quantity = floatOrZero(row[qtyField]);
            if (quantity <= 0) continue;
            components.push({
                activityType,
                quantity,
                unit: ['AWARENESS_CAMP', 'LITERATURE_DISTRIBUTION', 'KISAN_MELA'].includes(activityType)
                    ? 'No.'
                    : decodeEntities(cleanText(row[unitField])),
                specification: null,
                ...ZERO_DEMOGRAPHICS,
            });
        }
        if (!components.length) warn('components', 'No non-zero activity counts on old row');

        const data = {
            kvkId,
            reportingYear,
            startDate,
            endDate,
            totalBudgetUtilized: floatOrZero(row.total_budget),
            components,
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        const { components, ...activity } = data;
        const created = await prisma.drmrActivity.create({ data: activity });
        if (components && components.length) {
            await prisma.drmrActivityComponent.createMany({
                data: components.map(c => ({ drmrActivityId: created.drmrActivityId, ...c })),
            });
        }
        return 'created';
    },
};
