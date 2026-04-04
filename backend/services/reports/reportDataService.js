const reportRepository = require('../../repositories/reports/reportRepository.js');
const oftReportRepository = require('../../repositories/reports/oftReport/index.js');
const cfldReportRepository = require('../../repositories/reports/cfldReport/index.js');
const craReportRepository = require('../../repositories/reports/craReport/index.js');
const fpoReportRepository = require('../../repositories/reports/fpoReport/index.js');
const { getSectionConfig } = require('../../config/reportConfig.js');
const cacheService = require('../cache/redisCacheService.js');
const CacheKeyBuilder = require('../../utils/cacheKeyBuilder.js');
const { getSectionDataTTL, getKvkInfoTTL } = require('../../config/cacheConfig.js');

/**
 * Report Data Service
 * Fetches and transforms data for report generation
 */
class ReportDataService {
    /**
     * Get data for a specific section (with caching)
     */
    async getSectionData(sectionId, kvkId, filters = {}) {
        const sectionConfig = getSectionConfig(sectionId);
        if (!sectionConfig) {
            throw new Error(`Section ${sectionId} not found`);
        }

        // Apply filters based on section configuration
        const sectionFilters = this._buildSectionFilters(sectionConfig, filters);
        const hasFilters = Object.keys(sectionFilters).length > 0;

        // Build cache key
        const cacheKey = CacheKeyBuilder.sectionData(kvkId, sectionId, sectionFilters);
        const ttl = getSectionDataTTL(hasFilters);

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // Fetch from database
        let rawData;
        const dataSource = sectionConfig.dataSource;

        switch (dataSource) {
            case 'kvk':
                rawData = await reportRepository.getKvkBasicInfo(kvkId);
                break;
            case 'kvkBankAccounts':
                rawData = await reportRepository.getKvkBankAccounts(kvkId, sectionFilters);
                break;
            case 'kvkEmployees':
                rawData = await reportRepository.getKvkEmployees(kvkId, sectionFilters);
                break;
            case 'kvkEmployeesHeads':
                rawData = await reportRepository.getKvkEmployeeHeads(kvkId, sectionFilters);
                break;
            case 'kvkStaffTransferred':
                rawData = await reportRepository.getKvkStaffTransferred(kvkId, sectionFilters);
                break;
            case 'kvkInfrastructure':
                rawData = await reportRepository.getKvkInfrastructure(kvkId, sectionFilters);
                break;
            case 'kvkVehicles':
                rawData = await reportRepository.getKvkVehicles(kvkId, sectionFilters);
                break;
            case 'kvkVehicleDetails':
                rawData = await reportRepository.getKvkVehicleDetails(kvkId, sectionFilters);
                break;
            case 'kvkEquipments':
                rawData = await reportRepository.getKvkEquipments(kvkId, sectionFilters);
                break;
            case 'kvkEquipmentRecords':
                rawData = await reportRepository.getKvkEquipmentRecords(kvkId, sectionFilters);
                break;
            case 'kvkFarmImplements':
                rawData = await reportRepository.getKvkFarmImplements(kvkId, sectionFilters);
                break;
            case 'oftSummary': {
                const [summaryRecords, subjects] = await Promise.all([
                    oftReportRepository.getOftSummaryData(kvkId, sectionFilters),
                    oftReportRepository.getOftSubjectsWithThematicAreas(),
                ]);
                rawData = { records: summaryRecords, subjects };
                break;
            }
            case 'oftDetailCards':
                rawData = await oftReportRepository.getOftDetailCards(kvkId, sectionFilters);
                break;
            case 'cfldCombined':
                rawData = await cfldReportRepository.getCfldCombinedData(kvkId, sectionFilters);
                break;
            case 'cfldExtensionActivity':
                rawData = await cfldReportRepository.getCfldExtensionActivityData(kvkId, sectionFilters);
                break;
            case 'cfldBudgetUtilization':
                rawData = await cfldReportRepository.getCfldBudgetUtilizationData(kvkId, sectionFilters);
                break;
            case 'craDetails':
                rawData = await craReportRepository.getCraDetailsData(kvkId, sectionFilters);
                break;
            case 'craExtensionActivity':
                rawData = await craReportRepository.getCraExtensionActivityData(kvkId, sectionFilters);
                break;
            case 'fpoCbboDetails':
                rawData = await fpoReportRepository.getFpoCbboDetailsData(kvkId, sectionFilters);
                break;
            case 'fpoManagement':
                rawData = await fpoReportRepository.getFpoManagementData(kvkId, sectionFilters);
                break;
            default:
                throw new Error(`Unknown data source: ${dataSource}`);
        }

        // OFT sections pass raw data to templates (complex nested structures)
        const skipTransform = dataSource === 'oftSummary'
            || dataSource === 'oftDetailCards'
            || dataSource === 'cfldCombined'
            || dataSource === 'cfldExtensionActivity'
            || dataSource === 'cfldBudgetUtilization'
            || dataSource === 'craDetails'
            || dataSource === 'craExtensionActivity'
            || dataSource === 'fpoCbboDetails'
            || dataSource === 'fpoManagement';

        // Transform data according to section configuration
        const transformedData = skipTransform ? rawData : this._transformSectionData(rawData, sectionConfig);
        
        // Build standardized structure
        const result = {
            sectionId,
            data: transformedData,
            metadata: {
                recordCount: Array.isArray(transformedData) ? transformedData.length : (transformedData ? 1 : 0),
                lastUpdated: new Date(),
                filters: sectionFilters
            }
        };

        // Cache the result
        await cacheService.set(cacheKey, result, ttl);

        return result;
    }

    /**
     * Get data for multiple sections in parallel
     */
    async getMultipleSectionData(sectionIds, kvkId, filters = {}) {
        const promises = sectionIds.map(sectionId =>
            this.getSectionData(sectionId, kvkId, filters).catch(error => ({
                sectionId,
                error: error.message,
                data: null,
                metadata: {
                    recordCount: 0,
                    lastUpdated: new Date(),
                    filters: {}
                }
            }))
        );

        const results = await Promise.all(promises);
        const dataMap = {};

        results.forEach(result => {
            if (result.error) {
                dataMap[result.sectionId] = {
                    sectionId: result.sectionId,
                    error: result.error,
                    data: null,
                    metadata: result.metadata || {
                        recordCount: 0,
                        lastUpdated: new Date(),
                        filters: {}
                    }
                };
            } else {
                // Ensure consistent structure
                dataMap[result.sectionId] = {
                    sectionId: result.sectionId,
                    data: result.data,
                    metadata: result.metadata || {
                        recordCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
                        lastUpdated: new Date(),
                        filters: result.metadata?.filters || {}
                    }
                };
            }
        });

        return dataMap;
    }

    /**
     * Build filters for a section based on its configuration
     */
    _buildSectionFilters(sectionConfig, globalFilters) {
        const sectionFilters = {};

        // Only apply filters if section has date/year fields
        if (sectionConfig.filters.dateFields.length > 0 || sectionConfig.filters.yearFields?.length > 0) {
            if (globalFilters.startDate) {
                sectionFilters.startDate = globalFilters.startDate;
            }
            if (globalFilters.endDate) {
                sectionFilters.endDate = globalFilters.endDate;
            }
            if (globalFilters.year) {
                sectionFilters.year = globalFilters.year;
            }
        }

        return sectionFilters;
    }

    /**
     * Transform raw data according to section configuration
     */
    _transformSectionData(rawData, sectionConfig) {
        if (!rawData) {
            return null;
        }

        // Handle single object (like KVK basic info)
        if (!Array.isArray(rawData)) {
            return this._transformSingleRecord(rawData, sectionConfig);
        }

        // Handle array of records
        return rawData.map(record => this._transformSingleRecord(record, sectionConfig));
    }

    /**
     * Transform a single record according to field configuration
     */
    _transformSingleRecord(record, sectionConfig) {
        const transformed = {};

        sectionConfig.fields.forEach(field => {
            const value = this._getNestedValue(record, field.dbField);
            
            // Skip optional fields that are null/undefined
            if (field.optional && (value === null || value === undefined)) {
                return;
            }

            // Transform based on field type
            transformed[field.displayName] = this._formatFieldValue(value, field);
        });

        return transformed;
    }

    /**
     * Get nested value from object using dot notation
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current && current[prop] !== undefined ? current[prop] : null;
        }, obj);
    }

    /**
     * Format field value based on type
     */
    _formatFieldValue(value, field) {
        if (value === null || value === undefined) {
            return field.optional ? null : '-';
        }

        switch (field.type) {
            case 'raw':
                return value;
            case 'date':
                if (value instanceof Date) {
                    return value.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                }
                if (typeof value === 'string') {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                    }
                }
                return String(value);

            case 'currency':
                if (typeof value === 'number') {
                    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
                return String(value);

            case 'boolean':
                return value ? 'Yes' : 'No';

            case 'image':
                // Handle JSON-encoded image and caption
                if (typeof value === 'string' && value.startsWith('{"image":')) {
                    try {
                        const parsed = JSON.parse(value);
                        return parsed.image || null;
                    } catch (e) {
                        // Not valid JSON, return as is
                    }
                }
                // Return image path or placeholder
                return value || null;

            default:
                return String(value);
        }
    }

    /**
     * Get KVK basic info for report header (with caching)
     */
    async getKvkInfoForHeader(kvkId) {
        const cacheKey = CacheKeyBuilder.kvkInfo(kvkId);
        const ttl = getKvkInfoTTL();

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // Fetch from database
        const kvk = await reportRepository.getKvkBasicInfo(kvkId);
        if (!kvk) {
            throw new Error(`KVK with ID ${kvkId} not found`);
        }

        const result = {
            kvkId: kvk.kvkId,
            kvkName: kvk.kvkName,
            address: kvk.address,
            email: kvk.email,
            mobile: kvk.mobile,
            zone: kvk.zone?.zoneName || '',
            state: kvk.state?.stateName || '',
            district: kvk.district?.districtName || '',
            organization: kvk.org?.orgName || '',
            university: kvk.university?.universityName || null,
            hostOrg: kvk.hostOrg,
            yearOfSanction: kvk.yearOfSanction,
        };

        // Cache the result
        await cacheService.set(cacheKey, result, ttl);

        return result;
    }

    /**
     * Invalidate cache for a KVK's section data
     */
    async invalidateKvkSectionCache(kvkId, sectionId = null) {
        if (sectionId) {
            const pattern = CacheKeyBuilder.kvkSectionPattern(kvkId, sectionId);
            await cacheService.invalidatePattern(pattern);
        } else {
            const pattern = CacheKeyBuilder.kvkSectionsPattern(kvkId);
            await cacheService.invalidatePattern(pattern);
        }
    }

    /**
     * Invalidate cache for KVK info
     */
    async invalidateKvkInfoCache(kvkId) {
        const key = CacheKeyBuilder.kvkInfo(kvkId);
        await cacheService.del(key);
    }
}

module.exports = new ReportDataService();
