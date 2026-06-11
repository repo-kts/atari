// Year label for report headings, derived strictly from the selected filter
// (NOT from record data, which can carry a future expectedCompletionDate).
// Returns '2023', '2021–2023', or '' when all years are selected (caller omits
// the year phrase entirely). See #231/#223.
function yearLabelFromFilters(filters = {}) {
    if (!filters) return '';
    if (filters.year) return String(filters.year);
    if (filters.startDate || filters.endDate) {
        const sy = filters.startDate ? new Date(filters.startDate).getUTCFullYear() : null;
        const ey = filters.endDate ? new Date(filters.endDate).getUTCFullYear() : null;
        if (sy && ey) return sy === ey ? String(sy) : `${sy}–${ey}`;
        return String(sy || ey || '');
    }
    return '';
}

module.exports = { yearLabelFromFilters };
