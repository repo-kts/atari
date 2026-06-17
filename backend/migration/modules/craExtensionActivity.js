const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: CRA Extension Activity — Achievements / Projects / Climate
 * Resilient Agriculture. Source: atariams.org `project/cra-extension-activity`.
 * Writes cra_extension_activity.
 *
 * Every field lives on the DataTables list row (nested kvk + flat
 * activity/dates/demographics) — no per-row edit-page fetch.
 *
 * activityId is a REQUIRED FK to the FldActivity master (activity_name is
 * @unique) with NO *_other column, so the old `extension_activity` string is
 * find-or-created on that master and its id used. `state_type` and the old `*_t`
 * / total / sub_total columns aren't on the new model — dropped.
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
    key: 'cra-extension-activity',
    label: 'CRA Extension Activity',
    model: 'craExtensionActivity',
    idField: 'craExtensionActivityId',
    naturalKey: ['kvkId', 'activityId', 'startDate', 'endDate', 'exposureVisitNo'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        activityId: { master: 'fldActivity' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
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

        // 2. Activity ← extension_activity string → FldActivity master. REQUIRED
        // FK with no *_other column, so find-or-create on the master.
        let activityId = null;
        const activityName = decodeEntities(cleanText(asObject(row.extension_activity)?.name || row.extension_activity || ''));
        if (activityName) {
            const a = await r.findOrCreate('fldActivity', 'activityName', 'activityId', activityName);
            activityId = a.id;
            if (a.created) warn('activityId', `Activity "${activityName}" not in master — created`);
        } else {
            error('activityId', 'No extension_activity on old row — required');
        }

        // 3. Dates (both REQUIRED, NOT NULL). dd-mm-yyyy. Each falls back to the
        // other when missing; a row with neither can't be seeded → error.
        let startIso = parseDate(row.start_date);
        let endIso = parseDate(row.end_date);
        if (!startIso) startIso = endIso;
        if (!endIso) endIso = startIso;
        if (!startIso) error('startDate', 'No start/end date on old row — cannot seed');
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;

        // 4. Exposure visits (REQUIRED Int).
        const exposureVisitNo = intOrZero(row.exposure_visit_no);

        const data = {
            kvkId,
            activityId,
            startDate,
            endDate,
            // Farmer demographics — *_t / total / sub_total dropped (UI recomputes).
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
            exposureVisitNo,
        };

        return { data, issues };
    },
};
