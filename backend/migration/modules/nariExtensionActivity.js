const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NARI — Extension Activities under NARI Project.
 * Source: atariams.org `project/nari/extension-activities/view`
 * (`nari_extension_activities` table). Writes nari_extension_activity.
 *
 * Every field lives on the DataTables list row (nested kvk + flat
 * activity/name/count/demographics) — no per-row edit-page fetch.
 *
 * activity → NariActivity.activityName (find-or-create, @unique). status falls
 * back to the model default (ONGOING). Old `*_t` / total columns are dropped.
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
    key: 'nari-extension-activity',
    label: 'NARI Extension Activity',
    model: 'nariExtensionActivity',
    idField: 'nariExtensionActivityId',
    naturalKey: ['kvkId', 'reportingYear', 'nameOfNutriSmartVillage', 'nameOfActivity'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        activityId: { master: 'nariActivity', otherField: 'activityOther' },
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

        // 2. Reporting year ← old fiscal int → Jan 1 of that year (UTC).
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Activity ← activity string → NariActivity master (find-or-create).
        let activityId = null;
        const activityName = decodeEntities(cleanText(asObject(row.activity)?.activity_name || row.activity)) || '';
        if (activityName) {
            const a = await r.findOrCreate('nariActivity', 'activityName', 'nariActivityId', activityName);
            activityId = a.id;
            if (a.created) warn('activityId', `Activity "${activityName}" not in master — created`);
        } else {
            error('activityId', 'No activity on old row — required');
        }

        // 4. Required strings.
        const nameOfNutriSmartVillage = decodeEntities(cleanText(row.village_name)) || '';
        if (!nameOfNutriSmartVillage) warn('nameOfNutriSmartVillage', 'No village_name on old row');
        const nameOfActivity = decodeEntities(cleanText(row.activity_name)) || '';
        if (!nameOfActivity) warn('nameOfActivity', 'No activity_name on old row');

        const data = {
            kvkId,
            reportingYear,
            activityId,
            nameOfNutriSmartVillage,
            nameOfActivity,
            noOfActivities: intOrZero(row.no_of_activities),
            // Demographics — *_t / total dropped (UI recomputes).
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
        };

        return { data, issues };
    },
};
