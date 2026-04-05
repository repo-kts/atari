const cacheService = require('../cache/redisCacheService.js');
const CacheKeyBuilder = require('../../utils/cacheKeyBuilder.js');
const { getSectionsByDataSource } = require('../../config/reportConfig.js');

class ReportCacheInvalidationService {
    async invalidateDataSourceForKvk(dataSource, kvkId) {
        if (!dataSource || !kvkId) {
            return;
        }

        const sections = getSectionsByDataSource(dataSource) || [];
        if (sections.length === 0) {
            return;
        }

        await Promise.all(
            sections.map(async section => {
                const sectionId = section.id;
                await cacheService.invalidatePattern(CacheKeyBuilder.kvkSectionPattern(kvkId, sectionId));
                // Invalidate all aggregated scopes for this section.
                await cacheService.invalidatePattern(`report:*:aggregated:*:${sectionId}*`);
            })
        );
    }
}

module.exports = new ReportCacheInvalidationService();
