// Report date filtering helpers.
//
// IMPORTANT (see issue #218): report year/date-range filters must NOT use the
// row's `createdAt` (when the record was entered) — they must use the entity's
// real event/reporting date (meeting date, OFT start date, observation date,
// reportingYear, …). Filtering by createdAt made e.g. "year 2023" return rows
// created in 2025. `applyCreatedAtFilters` is now a NO-OP kept only so existing
// callers on "current-state" entities (vehicles, staff, bank accounts — which
// have no meaningful reporting date) compile unchanged and simply show all rows.
function applyCreatedAtFilters(where /*, filters */) {
    // Intentionally does nothing — do not filter by createdAt.
    return where;
}

/**
 * Filter `where[field]` by a year or a start/end date range.
 * @param {object} where   Prisma where clause (mutated)
 * @param {object} filters { startDate?, endDate?, year? }
 * @param {string} field   DateTime column to filter on (e.g. 'startDate',
 *                         'oftStartDate', 'reportingYear'). Falsy → no filter.
 */
function applyDateFilters(where, filters = {}, field) {
    if (!field) return where;

    if (filters.startDate || filters.endDate) {
        const range = {};
        if (filters.startDate) {
            const from = new Date(filters.startDate);
            if (!isNaN(from)) {
                from.setHours(0, 0, 0, 0);
                range.gte = from;
            }
        }
        if (filters.endDate) {
            const to = new Date(filters.endDate);
            if (!isNaN(to)) {
                to.setHours(23, 59, 59, 999);
                range.lte = to;
            }
        }
        if (Object.keys(range).length > 0) where[field] = range;
    } else if (filters.year) {
        const y = Number(filters.year);
        if (Number.isFinite(y)) {
            where[field] = {
                gte: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
                lte: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
            };
        }
    }

    return where;
}

/**
 * Build the year label shown in report headings ("…during the year 2023").
 * Derives strictly from the selected filter — NEVER from record data (which
 * may carry a future expectedCompletionDate, hence the bogus "2027"). When no
 * year/range is selected (all years) returns '' so callers omit the year.
 * @returns {string} e.g. '2023', '2021–2023', or '' for all-years.
 */
function yearLabelFromFilters(filters = {}) {
    if (filters.year) return String(filters.year);
    if (filters.startDate || filters.endDate) {
        const sy = filters.startDate ? new Date(filters.startDate).getUTCFullYear() : null;
        const ey = filters.endDate ? new Date(filters.endDate).getUTCFullYear() : null;
        if (sy && ey) return sy === ey ? String(sy) : `${sy}–${ey}`;
        return String(sy || ey || '');
    }
    return '';
}

module.exports = {
    applyCreatedAtFilters,
    applyDateFilters,
    yearLabelFromFilters,
};
