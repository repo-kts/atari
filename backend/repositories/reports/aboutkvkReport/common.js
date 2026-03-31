function applyCreatedAtFilters(where, filters = {}) {
    if (filters.startDate || filters.endDate) {
        const dateFilter = {};

        if (filters.startDate) {
            dateFilter.gte = new Date(filters.startDate);
        }

        if (filters.endDate) {
            dateFilter.lte = new Date(filters.endDate);
        }

        if (Object.keys(dateFilter).length > 0) {
            where.createdAt = dateFilter;
        }
    }

    if (filters.year) {
        const yearStart = new Date(filters.year, 0, 1);
        const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
        where.createdAt = {
            gte: yearStart,
            lte: yearEnd,
        };
    }
}

module.exports = {
    applyCreatedAtFilters,
};
