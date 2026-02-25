const prisma = require('../../config/prisma.js');
const reportDataService = require('./reportDataService.js');
const { getRoleLevel } = require('../../constants/roleHierarchy.js');
const cacheService = require('../cache/redisCacheService.js');
const CacheKeyBuilder = require('../../utils/cacheKeyBuilder.js');
const { getAggregatedReportTTL } = require('../../config/cacheConfig.js');

/**
 * Report Aggregation Service
 * Handles hierarchical reporting for different roles
 */
class ReportAggregationService {
    /**
     * Get available scope options for a user based on their role
     */
    async getScopeForRole(user) {
        const roleName = user.role?.roleName || user.roleName;
        const roleLevel = getRoleLevel(roleName);

        const scope = {
            role: roleName,
            roleLevel,
            canSelectZones: false,
            canSelectStates: false,
            canSelectDistricts: false,
            canSelectOrgs: false,
            canSelectKvks: false,
            defaultKvkId: null,
            availableZones: [],
            availableStates: [],
            availableDistricts: [],
            availableOrgs: [],
            availableKvks: [],
        };

        // KVK Admin - can only access their KVK
        if (roleLevel === 5) {
            scope.canSelectKvks = false;
            scope.defaultKvkId = user.kvkId;
            if (user.kvkId) {
                scope.availableKvks = [await this._getKvkInfo(user.kvkId)];
            }
            return scope;
        }

        // Organization Admin - can select KVKs in their org
        if (roleLevel === 4) {
            scope.canSelectKvks = true;
            if (user.orgId) {
                scope.availableKvks = await this._getKvksByOrg(user.orgId);
            }
            return scope;
        }

        // District Admin - can select orgs and KVKs in their district
        if (roleLevel === 3) {
            scope.canSelectOrgs = true;
            scope.canSelectKvks = true;
            if (user.districtId) {
                scope.availableOrgs = await this._getOrgsByDistrict(user.districtId);
                scope.availableKvks = await this._getKvksByDistrict(user.districtId);
            }
            return scope;
        }

        // State Admin - can select districts, orgs, and KVKs in their state
        if (roleLevel === 2) {
            scope.canSelectDistricts = true;
            scope.canSelectOrgs = true;
            scope.canSelectKvks = true;
            if (user.stateId) {
                scope.availableDistricts = await this._getDistrictsByState(user.stateId);
                scope.availableOrgs = await this._getOrgsByState(user.stateId);
                scope.availableKvks = await this._getKvksByState(user.stateId);
            }
            return scope;
        }

        // Zone Admin - can select states, districts, orgs, and KVKs in their zone
        if (roleLevel === 1) {
            scope.canSelectStates = true;
            scope.canSelectDistricts = true;
            scope.canSelectOrgs = true;
            scope.canSelectKvks = true;
            if (user.zoneId) {
                scope.availableStates = await this._getStatesByZone(user.zoneId);
                scope.availableDistricts = await this._getDistrictsByZone(user.zoneId);
                scope.availableOrgs = await this._getOrgsByZone(user.zoneId);
                scope.availableKvks = await this._getKvksByZone(user.zoneId);
            }
            return scope;
        }

        // Super Admin - can select everything
        if (roleLevel === 0) {
            scope.canSelectZones = true;
            scope.canSelectStates = true;
            scope.canSelectDistricts = true;
            scope.canSelectOrgs = true;
            scope.canSelectKvks = true;
            scope.availableZones = await this._getAllZones();
            scope.availableStates = await this._getAllStates();
            scope.availableDistricts = await this._getAllDistricts();
            scope.availableOrgs = await this._getAllOrgs();
            scope.availableKvks = await this._getAllKvks();
            return scope;
        }

        return scope;
    }

    /**
     * Get KVK IDs for a given scope
     */
    async getKvkIdsForScope(scope) {
        const { zoneIds, stateIds, districtIds, orgIds, kvkIds } = scope;

        if (kvkIds && kvkIds.length > 0) {
            return kvkIds;
        }

        const where = {};

        if (zoneIds && zoneIds.length > 0) {
            where.zoneId = { in: zoneIds };
        }

        if (stateIds && stateIds.length > 0) {
            where.stateId = { in: stateIds };
        }

        if (districtIds && districtIds.length > 0) {
            where.districtId = { in: districtIds };
        }

        if (orgIds && orgIds.length > 0) {
            where.orgId = { in: orgIds };
        }

        const kvks = await prisma.kvk.findMany({
            where,
            select: { kvkId: true },
        });

        return kvks.map(k => k.kvkId);
    }

    /**
     * Aggregate section data for multiple KVKs
     */
    async aggregateSectionData(sectionId, kvkIds, filters = {}) {
        if (!kvkIds || kvkIds.length === 0) {
            return {
                sectionId,
                data: null,
                metadata: {
                    recordCount: 0,
                    lastUpdated: new Date(),
                    filters,
                },
            };
        }

        // Build cache key
        const scopeId = kvkIds.sort().join(',');
        const role = 'aggregated';
        const cacheKey = CacheKeyBuilder.aggregatedReport(role, scopeId, sectionId, filters);
        const ttl = getAggregatedReportTTL();

        // Try cache first
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // Fetch data for all KVKs in parallel
        const sectionDataPromises = kvkIds.map(kvkId =>
            reportDataService.getSectionData(sectionId, kvkId, filters).catch(error => ({
                sectionId,
                error: error.message,
                data: null,
                metadata: { recordCount: 0, lastUpdated: new Date(), filters },
            }))
        );

        const allSectionData = await Promise.all(sectionDataPromises);

        // Aggregate the data
        const aggregated = this._aggregateData(allSectionData, sectionId);

        // Cache the result
        await cacheService.set(cacheKey, aggregated, ttl);

        return aggregated;
    }

    /**
     * Aggregate multiple sections for multiple KVKs
     */
    async aggregateMultipleSections(sectionIds, kvkIds, filters = {}) {
        const promises = sectionIds.map(sectionId =>
            this.aggregateSectionData(sectionId, kvkIds, filters)
        );

        const results = await Promise.all(promises);
        const dataMap = {};

        results.forEach(result => {
            dataMap[result.sectionId] = result;
        });

        return dataMap;
    }

    /**
     * Aggregate data from multiple KVKs
     */
    _aggregateData(allSectionData, sectionId) {
        // Filter out errors
        const validData = allSectionData.filter(sd => !sd.error && sd.data !== null);

        if (validData.length === 0) {
            return {
                sectionId,
                data: null,
                metadata: {
                    recordCount: 0,
                    lastUpdated: new Date(),
                    filters: {},
                },
            };
        }

        // Get section config to determine format
        const { getSectionConfig } = require('../../config/reportConfig.js');
        const sectionConfig = getSectionConfig(sectionId);

        if (!sectionConfig) {
            return {
                sectionId,
                data: null,
                metadata: {
                    recordCount: 0,
                    lastUpdated: new Date(),
                    filters: {},
                },
            };
        }

        // For formatted-text sections (like 1.1), return array of objects for multiple rows
        if (sectionConfig.format === 'formatted-text') {
            // If only one KVK, return as single object (original format)
            if (validData.length === 1) {
                return {
                    sectionId,
                    data: validData[0].data,
                    metadata: {
                        recordCount: 1,
                        lastUpdated: new Date(),
                        filters: {},
                    },
                };
            }

            // Multiple KVKs - return array of objects, each representing one row
            const aggregatedArray = validData.map(sd => sd.data);

            return {
                sectionId,
                data: aggregatedArray,
                metadata: {
                    recordCount: validData.length,
                    lastUpdated: new Date(),
                    filters: {},
                },
            };
        }

        // For table sections, combine all rows
        if (sectionConfig.format === 'table' || sectionConfig.format === 'grouped-table') {
            const allRows = [];
            validData.forEach(sd => {
                if (Array.isArray(sd.data)) {
                    allRows.push(...sd.data);
                }
            });

            return {
                sectionId,
                data: allRows,
                metadata: {
                    recordCount: allRows.length,
                    lastUpdated: new Date(),
                    filters: {},
                },
            };
        }

        // Default: return first valid data
        return validData[0];
    }

    // Helper methods to fetch geographic entities
    async _getKvkInfo(kvkId) {
        const kvk = await prisma.kvk.findUnique({
            where: { kvkId },
            select: { kvkId: true, kvkName: true },
        });
        return kvk ? { id: kvk.kvkId, name: kvk.kvkName } : null;
    }

    async _getKvksByOrg(orgId) {
        const kvks = await prisma.kvk.findMany({
            where: { orgId },
            select: { kvkId: true, kvkName: true },
            orderBy: { kvkName: 'asc' },
        });
        return kvks.map(k => ({ id: k.kvkId, name: k.kvkName }));
    }

    async _getKvksByDistrict(districtId) {
        const kvks = await prisma.kvk.findMany({
            where: { districtId },
            select: { kvkId: true, kvkName: true },
            orderBy: { kvkName: 'asc' },
        });
        return kvks.map(k => ({ id: k.kvkId, name: k.kvkName }));
    }

    async _getKvksByState(stateId) {
        const kvks = await prisma.kvk.findMany({
            where: { stateId },
            select: { kvkId: true, kvkName: true },
            orderBy: { kvkName: 'asc' },
        });
        return kvks.map(k => ({ id: k.kvkId, name: k.kvkName }));
    }

    async _getKvksByZone(zoneId) {
        const kvks = await prisma.kvk.findMany({
            where: { zoneId },
            select: { kvkId: true, kvkName: true },
            orderBy: { kvkName: 'asc' },
        });
        return kvks.map(k => ({ id: k.kvkId, name: k.kvkName }));
    }

    async _getOrgsByDistrict(districtId) {
        const orgs = await prisma.orgMaster.findMany({
            where: { districtId },
            select: { orgId: true, orgName: true },
            orderBy: { orgName: 'asc' },
        });
        return orgs.map(o => ({ id: o.orgId, name: o.orgName || 'Unknown' }));
    }

    async _getOrgsByState(stateId) {
        const districts = await prisma.districtMaster.findMany({
            where: { stateId },
            select: { districtId: true },
        });
        const districtIds = districts.map(d => d.districtId);
        const orgs = await prisma.orgMaster.findMany({
            where: { districtId: { in: districtIds } },
            select: { orgId: true, orgName: true },
            orderBy: { orgName: 'asc' },
        });
        return orgs.map(o => ({ id: o.orgId, name: o.orgName || 'Unknown' }));
    }

    async _getOrgsByZone(zoneId) {
        const states = await prisma.stateMaster.findMany({
            where: { zoneId },
            select: { stateId: true },
        });
        const stateIds = states.map(s => s.stateId);
        const districts = await prisma.districtMaster.findMany({
            where: { stateId: { in: stateIds } },
            select: { districtId: true },
        });
        const districtIds = districts.map(d => d.districtId);
        const orgs = await prisma.orgMaster.findMany({
            where: { districtId: { in: districtIds } },
            select: { orgId: true, orgName: true },
            orderBy: { orgName: 'asc' },
        });
        return orgs.map(o => ({ id: o.orgId, name: o.orgName || 'Unknown' }));
    }

    async _getDistrictsByState(stateId) {
        const districts = await prisma.districtMaster.findMany({
            where: { stateId },
            select: { districtId: true, districtName: true },
            orderBy: { districtName: 'asc' },
        });
        return districts.map(d => ({ id: d.districtId, name: d.districtName }));
    }

    async _getDistrictsByZone(zoneId) {
        const districts = await prisma.districtMaster.findMany({
            where: { zoneId },
            select: { districtId: true, districtName: true },
            orderBy: { districtName: 'asc' },
        });
        return districts.map(d => ({ id: d.districtId, name: d.districtName }));
    }

    async _getStatesByZone(zoneId) {
        const states = await prisma.stateMaster.findMany({
            where: { zoneId },
            select: { stateId: true, stateName: true },
            orderBy: { stateName: 'asc' },
        });
        return states.map(s => ({ id: s.stateId, name: s.stateName }));
    }

    async _getAllZones() {
        const zones = await prisma.zone.findMany({
            select: { zoneId: true, zoneName: true },
            orderBy: { zoneName: 'asc' },
        });
        return zones.map(z => ({ id: z.zoneId, name: z.zoneName }));
    }

    async _getAllStates() {
        const states = await prisma.stateMaster.findMany({
            select: { stateId: true, stateName: true },
            orderBy: { stateName: 'asc' },
        });
        return states.map(s => ({ id: s.stateId, name: s.stateName }));
    }

    async _getAllDistricts() {
        const districts = await prisma.districtMaster.findMany({
            select: { districtId: true, districtName: true },
            orderBy: { districtName: 'asc' },
        });
        return districts.map(d => ({ id: d.districtId, name: d.districtName }));
    }

    async _getAllOrgs() {
        const orgs = await prisma.orgMaster.findMany({
            select: { orgId: true, orgName: true },
            orderBy: { orgName: 'asc' },
        });
        return orgs.map(o => ({ id: o.orgId, name: o.orgName || 'Unknown' }));
    }

    async _getAllKvks() {
        const kvks = await prisma.kvk.findMany({
            select: { kvkId: true, kvkName: true },
            orderBy: { kvkName: 'asc' },
        });
        return kvks.map(k => ({ id: k.kvkId, name: k.kvkName }));
    }

    /**
     * Get filtered children based on selected parents
     */
    async getFilteredChildren(parentType, parentIds) {
        if (!parentIds || parentIds.length === 0) {
            return [];
        }

        switch (parentType) {
            case 'zones':
                // Get states for selected zones
                const states = await prisma.stateMaster.findMany({
                    where: { zoneId: { in: parentIds } },
                    select: { stateId: true, stateName: true },
                    orderBy: { stateName: 'asc' },
                });
                return states.map(s => ({ id: s.stateId, name: s.stateName }));

            case 'states':
                // Get districts for selected states
                const districts = await prisma.districtMaster.findMany({
                    where: { stateId: { in: parentIds } },
                    select: { districtId: true, districtName: true },
                    orderBy: { districtName: 'asc' },
                });
                return districts.map(d => ({ id: d.districtId, name: d.districtName }));

            case 'districts':
                // Get orgs for selected districts (handle null districtId)
                const orgs = await prisma.orgMaster.findMany({
                    where: { 
                        districtId: { 
                            in: parentIds,
                            not: null 
                        } 
                    },
                    select: { orgId: true, orgName: true },
                    orderBy: { orgName: 'asc' },
                });
                return orgs.map(o => ({ id: o.orgId, name: o.orgName || 'Unknown' }));

            case 'orgs':
                // Get KVKs for selected orgs
                const kvks = await prisma.kvk.findMany({
                    where: { orgId: { in: parentIds } },
                    select: { kvkId: true, kvkName: true },
                    orderBy: { kvkName: 'asc' },
                });
                return kvks.map(k => ({ id: k.kvkId, name: k.kvkName }));

            case 'states-for-districts':
                // Get states for selected districts (for orgs that need state info)
                const districtStates = await prisma.districtMaster.findMany({
                    where: { districtId: { in: parentIds } },
                    select: { stateId: true },
                });
                // Get unique state IDs
                const uniqueStateIds = [...new Set(districtStates.map(d => d.stateId))];
                const statesForDistricts = await prisma.stateMaster.findMany({
                    where: { stateId: { in: uniqueStateIds } },
                    select: { stateId: true, stateName: true },
                    orderBy: { stateName: 'asc' },
                });
                return statesForDistricts.map(s => ({ id: s.stateId, name: s.stateName }));

            case 'zones-for-states':
                // Get zones for selected states
                const stateZones = await prisma.stateMaster.findMany({
                    where: { stateId: { in: parentIds } },
                    select: { zoneId: true },
                });
                // Get unique zone IDs
                const uniqueZoneIds = [...new Set(stateZones.map(s => s.zoneId))];
                const zonesForStates = await prisma.zone.findMany({
                    where: { zoneId: { in: uniqueZoneIds } },
                    select: { zoneId: true, zoneName: true },
                    orderBy: { zoneName: 'asc' },
                });
                return zonesForStates.map(z => ({ id: z.zoneId, name: z.zoneName }));

            default:
                return [];
        }
    }

    /**
     * Get KVKs filtered by multiple parent types
     */
    async getFilteredKvks(filters) {
        const where = {};

        if (filters.zoneIds && filters.zoneIds.length > 0) {
            where.zoneId = { in: filters.zoneIds };
        }
        if (filters.stateIds && filters.stateIds.length > 0) {
            where.stateId = { in: filters.stateIds };
        }
        if (filters.districtIds && filters.districtIds.length > 0) {
            where.districtId = { in: filters.districtIds };
        }
        if (filters.orgIds && filters.orgIds.length > 0) {
            where.orgId = { in: filters.orgIds };
        }

        const kvks = await prisma.kvk.findMany({
            where,
            select: { kvkId: true, kvkName: true },
            orderBy: { kvkName: 'asc' },
        });
        return kvks.map(k => ({ id: k.kvkId, name: k.kvkName }));
    }
}

module.exports = new ReportAggregationService();
