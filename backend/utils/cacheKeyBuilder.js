const crypto = require('crypto');

/**
 * Cache Key Builder
 * Utility functions for generating consistent cache keys
 */
class CacheKeyBuilder {
    /**
     * Build cache key for KVK info
     */
    static kvkInfo(kvkId) {
        return `report:kvk:info:${kvkId}`;
    }

    /**
     * Build cache key for section data
     */
    static sectionData(kvkId, sectionId, filters = {}) {
        const filterHash = this._hashFilters(filters);
        // v3: bust stale entries after payload shape changes (OFT summary now
        // carries farmer counts; older cached entries lacked them -> rendered 0s).
        return `report:kvk:section:v3:${kvkId}:${sectionId}${filterHash ? `:${filterHash}` : ''}`;
    }

    /**
     * Build cache key for master data
     */
    static masterData(type) {
        return `report:master:${type}`;
    }

    /**
     * Build cache key for aggregated report
     */
    static aggregatedReport(role, scopeId, sectionId, filters = {}) {
        const filterHash = this._hashFilters(filters);
        return `report:${role}:aggregated:${scopeId}:${sectionId}${filterHash ? `:${filterHash}` : ''}`;
    }

    /**
     * Build pattern for invalidating all sections of a KVK
     */
    static kvkSectionsPattern(kvkId) {
        return `report:kvk:section:v3:${kvkId}:*`;
    }

    /**
     * Build pattern for invalidating all sections of a KVK for a specific section
     */
    static kvkSectionPattern(kvkId, sectionId) {
        return `report:kvk:section:v3:${kvkId}:${sectionId}*`;
    }

    /**
     * Hash filters to create a consistent cache key
     */
    static _hashFilters(filters) {
        if (!filters || Object.keys(filters).length === 0) {
            return '';
        }
        // Sort keys to ensure consistent hashing
        const sortedFilters = Object.keys(filters)
            .sort()
            .reduce((acc, key) => {
                acc[key] = filters[key];
                return acc;
            }, {});
        const filterString = JSON.stringify(sortedFilters);
        return crypto.createHash('md5').update(filterString).digest('hex').substring(0, 8);
    }
}

module.exports = CacheKeyBuilder;
