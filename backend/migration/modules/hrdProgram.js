const prisma = require('../../config/prisma.js');
const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Human Resource Development (HRD) Programs (About KVK / staff).
 * Source: atariams.org `hrd-program`. Writes hrd_program.
 *
 * Every field lives on the DataTables list row (nested kvk + kvk_staff objects)
 * — no per-row edit-page fetch.
 *
 * kvkStaffId (nullable FK) is resolved from the nested kvk_staff.staff_name,
 * scoped to the TARGET KVK so identical names across KVKs don't collide. The
 * generic MasterResolver indexes staff globally by name, so we do a kvk-scoped
 * normalized match here (memoized per kvkId on ctx). Unmatched staff → null
 * (the FK picker lets the operator set it).
 *
 * `organizer` is NOT NULL on the new model but has no counterpart on the old
 * row — defaults to '' and is reported so the operator can fill it in. Dates are
 * dd-mm-yyyy on the old site; both are required, so each falls back to the other
 * when one is missing.
 */

function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return null; }
    }
    return null;
}

/** kvk-scoped, normalized staff-name → kvkStaffId. Memoized per kvkId on ctx. */
async function resolveStaffId(ctx, staffName) {
    if (!staffName) return null;
    if (!ctx._hrdStaffByKvk) ctx._hrdStaffByKvk = new Map();
    let byName = ctx._hrdStaffByKvk.get(ctx.kvkId);
    if (!byName) {
        const rows = await prisma.kvkStaff.findMany({
            where: { kvkId: ctx.kvkId },
            select: { kvkStaffId: true, staffName: true },
        });
        byName = new Map(rows.map(s => [normalize(s.staffName), s.kvkStaffId]));
        ctx._hrdStaffByKvk.set(ctx.kvkId, byName);
    }
    return byName.get(normalize(staffName)) ?? null;
}

module.exports = {
    key: 'hrd-program',
    label: 'Human Resource Development (HRD)',
    model: 'hrdProgram',
    idField: 'hrdProgramId',
    naturalKey: ['kvkId', 'kvkStaffId', 'courseName', 'startDate', 'endDate'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        kvkStaffId: { master: 'kvkStaff' },
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

        // 2. Staff ← nested kvk_staff.staff_name, resolved within the target KVK.
        const staffObj = asObject(row.kvk_staff);
        const staffName = decodeEntities(cleanText(staffObj?.staff_name || row['kvk_staff.staff_name'])) || '';
        let kvkStaffId = null;
        if (staffName) {
            kvkStaffId = await resolveStaffId(ctx, staffName);
            if (!kvkStaffId) warn('kvkStaffId', `Staff "${staffName}" not found in target KVK — pick manually`);
        } else {
            warn('kvkStaffId', 'No staff name on old row');
        }

        // 3. Course name (REQUIRED).
        const courseName = decodeEntities(cleanText(row.course_name)) || '';
        if (!courseName) warn('courseName', 'No course name on old row');

        // 4. Dates (both REQUIRED, NOT NULL). dd-mm-yyyy. Each falls back to the
        // other when missing; a row with neither can't be seeded → error.
        let startIso = parseDate(row.start_date);
        let endIso = parseDate(row.end_date);
        if (!startIso) startIso = endIso;
        if (!endIso) endIso = startIso;
        if (!startIso) error('startDate', 'No start/end date on old row — cannot seed');
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;

        // 5. Organizer — NOT NULL but absent on the old row.
        const organizer = decodeEntities(cleanText(row.organizer)) || '';
        if (!organizer) warn('organizer', 'No organizer on old row — fill in manually');

        // 6. Venue (defaults to '' on the model).
        const venue = decodeEntities(cleanText(row.venue)) || '';

        const data = {
            kvkId,
            kvkStaffId,
            courseName,
            startDate,
            endDate,
            organizer,
            venue,
        };

        return { data, issues };
    },
};
