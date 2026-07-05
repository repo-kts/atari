// Shared ordering for form list (findAll) views so every form table sorts the
// same way across the app.
//
// Superadmin / cross-KVK view:  reportingYear DESC, then KVK name A→Z.
// KVK-scoped view (kvk_admin / kvk_user):  reportingYear DESC, then whoever
//   filled data most recently first (createdAt DESC).
//
// A stable tiebreak (the primary key, DESC) is always appended so rows never
// shuffle between requests. Models that lack a given column degrade
// gracefully — pass only the keys the model actually has.
const KVK_ROLES = ['kvk_admin', 'kvk_user'];

/**
 * @param {object} user  req.user (uses roleName to pick the view)
 * @param {object} opts
 * @param {boolean} [opts.reportingYear=false]  model has a `reportingYear` column
 * @param {string|null} [opts.kvkRelation=null]  relation field exposing `{ kvkName }` (usually 'kvk')
 * @param {boolean} [opts.createdAt=false]  model has a `createdAt` column
 * @param {string} [opts.tiebreak]  primary-key field name, always ordered DESC last
 * @returns {Array<object>} Prisma orderBy array
 */
function buildFormListOrderBy(user, opts = {}) {
    const { reportingYear = false, kvkRelation = null, createdAt = false, tiebreak } = opts;
    const isKvk = !!user && KVK_ROLES.includes(user.roleName);

    const order = [];
    if (reportingYear) order.push({ reportingYear: 'desc' });

    if (isKvk) {
        // KVK side: latest entry first.
        if (createdAt) order.push({ createdAt: 'desc' });
    } else if (kvkRelation) {
        // Superadmin side: KVK name alphabetical.
        order.push({ [kvkRelation]: { kvkName: 'asc' } });
    }

    if (tiebreak && tiebreak !== 'createdAt') order.push({ [tiebreak]: 'desc' });
    return order;
}

function _yearOf(v) {
    if (!v) return -Infinity; // nulls sort last under DESC
    const d = v instanceof Date ? v : new Date(v);
    const y = d.getUTCFullYear();
    return Number.isNaN(y) ? -Infinity : y;
}

/**
 * In-place sort for form lists whose `reportingYear` is a month-level DateTime.
 * Prisma orderBy can only sort the full timestamp, which scatters a single year
 * across months; this groups by YEAR first, then applies the same secondary rule
 * as buildFormListOrderBy (KVK name A→Z for superadmin, newest createdAt for
 * KVK-scoped users), with the primary key DESC as a stable tiebreak.
 *
 * Operates on raw Prisma rows (before mapping): expects `reportingYear`,
 * `createdAt`, `[kvkRelation].kvkName`, and the `tiebreak` PK field.
 *
 * @returns {Array} the same array, sorted
 */
function sortFormListRows(rows, user, opts = {}) {
    if (!Array.isArray(rows)) return rows;
    const { tiebreak, kvkRelation = 'kvk' } = opts;
    const isKvk = !!user && KVK_ROLES.includes(user.roleName);

    return rows.sort((a, b) => {
        const ya = _yearOf(a.reportingYear);
        const yb = _yearOf(b.reportingYear);
        if (ya !== yb) return yb - ya; // year DESC

        if (isKvk) {
            const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (ca !== cb) return cb - ca; // latest first
        } else {
            const na = (a[kvkRelation] && a[kvkRelation].kvkName) || '';
            const nb = (b[kvkRelation] && b[kvkRelation].kvkName) || '';
            const c = na.localeCompare(nb);
            if (c) return c; // KVK name A→Z
        }

        if (tiebreak) {
            const ta = Number(a[tiebreak]) || 0;
            const tb = Number(b[tiebreak]) || 0;
            if (ta !== tb) return tb - ta; // PK DESC
        }
        return 0;
    });
}

module.exports = { buildFormListOrderBy, sortFormListRows, KVK_ROLES };
