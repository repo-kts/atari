const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Other Extension Activities (Achievements). Source:
 * atariams.org `other-extension-activities`. Writes kvk_other_extension_activity.
 *
 * Every field lives on the DataTables list row (nested kvk/staff/extension_activity
 * objects) — no per-row edit-page fetch. No farmer/official demographics here.
 *
 * The activity FK points at the OtherExtensionActivity master
 * (other_extension_activity). Unmatched names are parked in `activityTypeOther`.
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
    key: 'other-extension-activity',
    label: 'Other Extension Activities',
    model: 'kvkOtherExtensionActivity',
    idField: 'otherExtensionActivityId',
    naturalKey: ['kvkId', 'activityTypeId', 'staffId', 'startDate', 'endDate', 'numberOfActivities'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        staffId: { master: 'kvkStaff' },
        activityTypeId: { master: 'otherExtensionActivity', otherField: 'activityTypeOther' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });
        const err = (field, msg) => issues.push({ field, message: msg, severity: 'error' });

        // 1. KVK match
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

        // 2. Staff ← embedded staff.staff_name → KvkStaff (by name, within KVK). Optional.
        let staffId = null;
        const staffObj = asObject(row.staff);
        const staffName = decodeEntities(cleanText(staffObj?.staff_name || ''));
        if (staffName) {
            staffId = await r.findId('kvkStaff', { kvkId, staffName }, 'kvkStaffId');
            if (!staffId) warn('staffId', `Staff "${staffName}" not found for this KVK — migrate Employees first or pick manually`);
        } else {
            warn('staffId', 'No staff on old row — pick manually if needed');
        }

        // 3. Activity ← extension_activity.name → OtherExtensionActivity master. Park unmatched in Other.
        let activityTypeId = null;
        let activityTypeOther = null;
        const actObj = asObject(row.extension_activity);
        const activityName = decodeEntities(cleanText(actObj?.name || row['extension_activity.name'] || ''));
        if (activityName) {
            const a = await r.resolve('otherExtensionActivity', 'otherExtensionName', 'otherExtensionActivityId', activityName);
            if (a.matched) activityTypeId = a.id;
            else {
                activityTypeOther = activityName;
                warn('activityTypeId', `Activity "${activityName}" not in master — parked in Other`);
            }
        }

        // 4. Number of activities (REQUIRED)
        const numberOfActivities = intOrZero(row.no_of_activity);

        // 5. Dates (both REQUIRED) — dd-mm-yyyy; parseDate normalizes (UTC).
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end date "${row.end_date}"`);

        const data = {
            kvkId,
            fldId: null,
            staffId,
            activityTypeId,
            activityTypeOther,
            numberOfActivities,
            startDate,
            endDate,
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        // Always insert — the old site has genuine duplicate rows (same kvk, staff,
        // activity, dates, count) that are distinct records. Never update/dedupe.
        await prisma.kvkOtherExtensionActivity.create({ data });
        return 'created';
    },
};
