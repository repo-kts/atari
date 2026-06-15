const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Extension Activities (Achievements). Source: atariams.org
 * `extension-programmes`. Writes kvk_extension_activity.
 *
 * Every field lives on the DataTables list row (nested kvk/staff/extension_activity
 * objects + flat farmer/official counts), so no per-row edit-page fetch is needed.
 *
 * Note: the activity FK on our schema points at the FldActivity master
 * (fld_activity), which is what the live form resolves against — NOT the global
 * ExtensionActivity master. Unmatched names are parked in `activityOther`.
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
    key: 'extension-activity',
    label: 'Extension Activities',
    model: 'kvkExtensionActivity',
    idField: 'extensionActivityId',
    naturalKey: ['kvkId', 'activityId', 'startDate'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        staffId: { master: 'kvkStaff' },
        activityId: { master: 'fldActivity', otherField: 'activityOther' },
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

        // 3. Activity ← extension_activity.name → FldActivity master. Park unmatched in Other.
        let activityId = null;
        let activityOther = null;
        const actObj = asObject(row.extension_activity);
        const activityName = decodeEntities(cleanText(actObj?.name || row['extension_activity.name'] || ''));
        if (activityName) {
            const a = await r.resolve('fldActivity', 'activityName', 'activityId', activityName);
            if (a.matched) activityId = a.id;
            else {
                activityOther = activityName;
                warn('activityId', `Activity "${activityName}" not in master — parked in Other`);
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

        // 6. Farmer counts ← farmer_* ; Official counts ← extension_* (flat on row).
        const data = {
            kvkId,
            fldId: null,
            staffId,
            activityId,
            activityOther,
            numberOfActivities,
            startDate,
            endDate,
            farmersGeneralM: intOrZero(row.farmer_general_m),
            farmersGeneralF: intOrZero(row.farmer_general_f),
            farmersObcM: intOrZero(row.farmer_obc_m),
            farmersObcF: intOrZero(row.farmer_obc_f),
            farmersScM: intOrZero(row.farmer_sc_m),
            farmersScF: intOrZero(row.farmer_sc_f),
            farmersStM: intOrZero(row.farmer_st_m),
            farmersStF: intOrZero(row.farmer_st_f),
            officialsGeneralM: intOrZero(row.extension_general_m),
            officialsGeneralF: intOrZero(row.extension_general_f),
            officialsObcM: intOrZero(row.extension_obc_m),
            officialsObcF: intOrZero(row.extension_obc_f),
            officialsScM: intOrZero(row.extension_sc_m),
            officialsScF: intOrZero(row.extension_sc_f),
            officialsStM: intOrZero(row.extension_st_m),
            officialsStF: intOrZero(row.extension_st_f),
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        // Match on kvk + activity (or its Other text) + start date to avoid dupes on re-run.
        const where = {
            kvkId: data.kvkId,
            ...(data.startDate ? { startDate: data.startDate } : {}),
        };
        if (data.activityId != null) where.activityId = data.activityId;
        else if (data.activityOther) where.activityOther = data.activityOther;

        const existing = await prisma.kvkExtensionActivity.findFirst({ where });

        if (existing) {
            await prisma.kvkExtensionActivity.update({
                where: { extensionActivityId: existing.extensionActivityId },
                data,
            });
            return 'updated';
        }
        await prisma.kvkExtensionActivity.create({ data });
        return 'created';
    },
};
