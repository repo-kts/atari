/**
 * Cache Configuration
 * Defines TTL (Time To Live) values for different cache types
 */

const CACHE_TTL = {
    // Short TTL (5-15 minutes) - for filtered/aggregated data
    SHORT: {
        SECTION_DATA_FILTERED: 5 * 60, // 5 minutes
        AGGREGATED_REPORT: 10 * 60, // 10 minutes
    },

    // Medium TTL (30-60 minutes) - for KVK info and unfiltered section data
    MEDIUM: {
        KVK_INFO: 30 * 60, // 30 minutes
        SECTION_DATA: 60 * 60, // 60 minutes
    },

    // Long TTL (2-4 hours) - for master data
    LONG: {
        MASTER_DATA: 2 * 60 * 60, // 2 hours
        ZONES: 4 * 60 * 60, // 4 hours
        STATES: 4 * 60 * 60, // 4 hours
        DISTRICTS: 4 * 60 * 60, // 4 hours
        ORGANIZATIONS: 4 * 60 * 60, // 4 hours
    },

    // Very Long TTL (24 hours) - for static configuration
    VERY_LONG: {
        REPORT_CONFIG: 24 * 60 * 60, // 24 hours
        SECTION_DEFINITIONS: 24 * 60 * 60, // 24 hours
    },
};

/**
 * Get TTL for section data based on whether it has filters
 */
function getSectionDataTTL(hasFilters) {
    return hasFilters 
        ? CACHE_TTL.SHORT.SECTION_DATA_FILTERED 
        : CACHE_TTL.MEDIUM.SECTION_DATA;
}

/**
 * Get TTL for KVK info
 */
function getKvkInfoTTL() {
    return CACHE_TTL.MEDIUM.KVK_INFO;
}

/**
 * Get TTL for master data
 */
function getMasterDataTTL(type) {
    return CACHE_TTL.LONG[type.toUpperCase()] || CACHE_TTL.LONG.MASTER_DATA;
}

/**
 * Get TTL for aggregated reports
 */
function getAggregatedReportTTL() {
    return CACHE_TTL.SHORT.AGGREGATED_REPORT;
}

module.exports = {
    CACHE_TTL,
    getSectionDataTTL,
    getKvkInfoTTL,
    getMasterDataTTL,
    getAggregatedReportTTL,
};
