const reportRepository = require('../../repositories/reports/reportRepository.js');
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
            case 'kvkStaffTransferred':
                rawData = await reportRepository.getKvkStaffTransferred(kvkId, sectionFilters);
                break;
            case 'kvkInfrastructure':
                rawData = await reportRepository.getKvkInfrastructure(kvkId, sectionFilters);
                break;
            case 'kvkVehicles':
                rawData = await reportRepository.getKvkVehicles(kvkId, sectionFilters);
                break;
            case 'kvkEquipments':
                rawData = await reportRepository.getKvkEquipments(kvkId, sectionFilters);
                break;
            case 'kvkFarmImplements':
                rawData = await reportRepository.getKvkFarmImplements(kvkId, sectionFilters);
                break;
            // Achievements
            case 'achievementsOft':
                rawData = await reportRepository.getAchievementsOft(kvkId, sectionFilters);
                break;
            case 'achievementsFld':
                rawData = await reportRepository.getAchievementsFld(kvkId, sectionFilters);
                break;
            case 'achievementsFldExtension':
                rawData = await reportRepository.getAchievementsFldExtension(kvkId, sectionFilters);
                break;
            case 'achievementsFldTechnical':
                rawData = await reportRepository.getAchievementsFldTechnical(kvkId, sectionFilters);
                break;
            case 'achievementsTrainings':
                rawData = await reportRepository.getAchievementsTrainings(kvkId, sectionFilters);
                break;
            case 'achievementsExtension':
                rawData = await reportRepository.getAchievementsExtension(kvkId, sectionFilters);
                break;
            case 'achievementsOtherExtension':
                rawData = await reportRepository.getAchievementsOtherExtension(kvkId, sectionFilters);
                break;
            case 'achievementsTechWeek':
                rawData = await reportRepository.getAchievementsTechWeek(kvkId, sectionFilters);
                break;
            case 'achievementsCelebrationDays':
                rawData = await reportRepository.getAchievementsCelebrationDays(kvkId, sectionFilters);
                break;
            case 'achievementsProductionSupply':
                rawData = await reportRepository.getAchievementsProductionSupply(kvkId, sectionFilters);
                break;
            case 'achievementsPublications':
                rawData = await reportRepository.getAchievementsPublications(kvkId, sectionFilters);
                break;
            case 'achievementsSoilWater':
                rawData = await reportRepository.getAchievementsSoilWater(kvkId, sectionFilters);
                break;
            case 'achievementsSoilAnalysis':
                rawData = await reportRepository.getAchievementsSoilAnalysis(kvkId, sectionFilters);
                break;
            case 'achievementsWorldSoilDay':
                rawData = await reportRepository.getAchievementsWorldSoilDay(kvkId, sectionFilters);
                break;
            case 'achievementsKvkAward':
                rawData = await reportRepository.getAchievementsKvkAward(kvkId, sectionFilters);
                break;
            case 'achievementsScientistAward':
                rawData = await reportRepository.getAchievementsScientistAward(kvkId, sectionFilters);
                break;
            case 'achievementsFarmerAward':
                rawData = await reportRepository.getAchievementsFarmerAward(kvkId, sectionFilters);
                break;
            case 'achievementsHrd':
                rawData = await reportRepository.getAchievementsHrd(kvkId, sectionFilters);
                break;
            // Projects
            case 'projectNari':
                rawData = await reportRepository.getProjectNari(kvkId, sectionFilters);
                break;
            case 'projectNariNutriGarden':
                rawData = await reportRepository.getFormData('nariNutritionGarden', kvkId, sectionFilters);
                break;
            case 'projectNariBioFortified':
                rawData = await reportRepository.getFormData('nariBioFortifiedCrop', kvkId, sectionFilters);
                break;
            case 'projectNariValueAddition':
                rawData = await reportRepository.getFormData('nariValueAddition', kvkId, sectionFilters);
                break;
            case 'projectNariTraining':
                rawData = await reportRepository.getFormData('nariTrainingProgramme', kvkId, sectionFilters);
                break;
            case 'projectNariExtension':
                rawData = await reportRepository.getFormData('nariExtensionActivity', kvkId, sectionFilters);
                break;
            case 'projectAryaCurrent':
                rawData = await reportRepository.getFormData('aryaCurrentYearDetails', kvkId, sectionFilters);
                break;
            case 'projectAryaEvaluation':
                rawData = await reportRepository.getFormData('aryaEvaluationPreviousYear', kvkId, sectionFilters);
                break;
            case 'projectNicraBasic':
                rawData = await reportRepository.getFormData('nicraBasicInfo', kvkId, sectionFilters);
                break;
            case 'projectNicraDetails':
                rawData = await reportRepository.getFormData('nicraDetails', kvkId, sectionFilters);
                break;
            case 'projectNicraTraining':
                rawData = await reportRepository.getFormData('nicraTraining', kvkId, sectionFilters);
                break;
            case 'projectNicraExtension':
                rawData = await reportRepository.getFormData('nicraExtensionActivity', kvkId, sectionFilters);
                break;
            case 'projectFpoDetails':
                rawData = await reportRepository.getFormData('fpoCbbo', kvkId, sectionFilters);
                break;
            case 'projectFpoManagement':
                rawData = await reportRepository.getFormData('fpoManagement', kvkId, sectionFilters);
                break;
            case 'projectArya':
                rawData = await reportRepository.getProjectArya(kvkId, sectionFilters);
                break;
            case 'projectNicra':
                rawData = await reportRepository.getProjectNicra(kvkId, sectionFilters);
                break;
            case 'projectCfld':
                rawData = await reportRepository.getProjectCfld(kvkId, sectionFilters);
                break;
            case 'projectCra':
                rawData = await reportRepository.getProjectCra(kvkId, sectionFilters);
                break;
            case 'projectFpo':
                rawData = await reportRepository.getProjectFpo(kvkId, sectionFilters);
                break;
            case 'projectCsisa':
                rawData = await reportRepository.getProjectCsisa(kvkId, sectionFilters);
                break;
            case 'projectTspScsp':
                rawData = await reportRepository.getProjectTspScsp(kvkId, sectionFilters);
                break;
            case 'projectNaturalFarming':
                rawData = await reportRepository.getProjectNaturalFarming(kvkId, sectionFilters);
                break;
            case 'projectAgriDrone':
                rawData = await reportRepository.getProjectAgriDrone(kvkId, sectionFilters);
                break;
            case 'projectSeedHub':
                rawData = await reportRepository.getProjectSeedHub(kvkId, sectionFilters);
                break;
            case 'projectDrmr':
                rawData = await reportRepository.getProjectDrmr(kvkId, sectionFilters);
                break;
            case 'projectOtherProgram':
                rawData = await reportRepository.getProjectOtherProgram(kvkId, sectionFilters);
                break;
            // Performance Indicators
            case 'performanceScientific':
                rawData = await reportRepository.getPerformanceScientific(kvkId, sectionFilters);
                break;
            case 'performanceTechnical':
                rawData = await reportRepository.getPerformanceTechnical(kvkId, sectionFilters);
                break;
            case 'performanceImpactKvk':
                rawData = await reportRepository.getPerformanceImpactKvk(kvkId, sectionFilters);
                break;
            case 'performanceImpactEnt':
                rawData = await reportRepository.getPerformanceImpactEnt(kvkId, sectionFilters);
                break;
            case 'performanceImpactSuccess':
                rawData = await reportRepository.getPerformanceImpactSuccess(kvkId, sectionFilters);
                break;
            case 'performanceDistrictLevel':
                rawData = await reportRepository.getPerformanceDistrictLevel(kvkId, sectionFilters);
                break;
            case 'performanceOperationalArea':
                rawData = await reportRepository.getPerformanceOperationalArea(kvkId, sectionFilters);
                break;
            case 'performanceVillageAdoption':
                rawData = await reportRepository.getPerformanceVillageAdoption(kvkId, sectionFilters);
                break;
            case 'performancePriorityThrust':
                rawData = await reportRepository.getPerformancePriorityThrust(kvkId, sectionFilters);
                break;
            case 'performanceDemoUnits':
                rawData = await reportRepository.getPerformanceDemoUnits(kvkId, sectionFilters);
                break;
            case 'performanceFarmCrops':
                rawData = await reportRepository.getPerformanceFarmCrops(kvkId, sectionFilters);
                break;
            case 'performanceProductionUnits':
                rawData = await reportRepository.getPerformanceProductionUnits(kvkId, sectionFilters);
                break;
            case 'performanceFarmLivestock':
                rawData = await reportRepository.getPerformanceFarmLivestock(kvkId, sectionFilters);
                break;
            case 'performanceHostel':
                rawData = await reportRepository.getPerformanceHostel(kvkId, sectionFilters);
                break;
            case 'performanceStaffQuarters':
                rawData = await reportRepository.getPerformanceStaffQuarters(kvkId, sectionFilters);
                break;
            case 'performanceRainwater':
                rawData = await reportRepository.getPerformanceRainwater(kvkId, sectionFilters);
                break;
            case 'performanceBudget':
                rawData = await reportRepository.getPerformanceBudget(kvkId, sectionFilters);
                break;
            case 'performanceProjectBudget':
                rawData = await reportRepository.getPerformanceProjectBudget(kvkId, sectionFilters);
                break;
            case 'performanceRevolvingFund':
                rawData = await reportRepository.getPerformanceRevolvingFund(kvkId, sectionFilters);
                break;
            case 'performanceRevenue':
                rawData = await reportRepository.getPerformanceRevenue(kvkId, sectionFilters);
                break;
            case 'performanceResource':
                rawData = await reportRepository.getPerformanceResource(kvkId, sectionFilters);
                break;
            case 'performanceLinkage':
                rawData = await reportRepository.getPerformanceLinkage(kvkId, sectionFilters);
                break;
            case 'performanceSpecial':
                rawData = await reportRepository.getPerformanceSpecial(kvkId, sectionFilters);
                break;
            // Miscellaneous
            case 'miscDiseasesCrops':
                rawData = await reportRepository.getMiscDiseasesCrops(kvkId, sectionFilters);
                break;
            case 'miscDiseasesLivestock':
                rawData = await reportRepository.getMiscDiseasesLivestock(kvkId, sectionFilters);
                break;
            case 'miscNyk':
                rawData = await reportRepository.getMiscNyk(kvkId, sectionFilters);
                break;
            case 'miscPpvFraTraining':
                rawData = await reportRepository.getMiscPpvFraTraining(kvkId, sectionFilters);
                break;
            case 'miscPlantVarieties':
                rawData = await reportRepository.getMiscPlantVarieties(kvkId, sectionFilters);
                break;
            case 'miscRaweFet':
                rawData = await reportRepository.getMiscRaweFet(kvkId, sectionFilters);
                break;
            case 'miscVipVisitors':
                rawData = await reportRepository.getMiscVipVisitors(kvkId, sectionFilters);
                break;
            // Digital Information
            case 'digitalMobileApp':
                rawData = await reportRepository.getDigitalMobileApp(kvkId, sectionFilters);
                break;
            case 'digitalWebPortal':
                rawData = await reportRepository.getDigitalWebPortal(kvkId, sectionFilters);
                break;
            case 'digitalKisanSarathi':
                rawData = await reportRepository.getDigitalKisanSarathi(kvkId, sectionFilters);
                break;
            case 'digitalKisanMobile':
                rawData = await reportRepository.getDigitalKisanMobile(kvkId, sectionFilters);
                break;
            case 'digitalOtherChannels':
                rawData = await reportRepository.getDigitalOtherChannels(kvkId, sectionFilters);
                break;
            // Swachhta Bharat Abhiyaan
            case 'swachhtaSewa':
                rawData = await reportRepository.getSwachhtaSewa(kvkId, sectionFilters);
                break;
            case 'swachhtaPakhwada':
                rawData = await reportRepository.getSwachhtaPakhwada(kvkId, sectionFilters);
                break;
            case 'swachhtaBudget':
                rawData = await reportRepository.getSwachhtaBudget(kvkId, sectionFilters);
                break;
            // Meetings
            case 'meetingsSac':
                rawData = await reportRepository.getMeetingsSac(kvkId, sectionFilters);
                break;
            case 'meetingsOther':
                rawData = await reportRepository.getMeetingsOther(kvkId, sectionFilters);
                break;
            default:
                throw new Error(`Unknown data source: \${dataSource}`);
        }

        // Transform data according to section configuration
        const transformedData = this._transformSectionData(rawData, sectionConfig);
        
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
            organization: kvk.org?.uniName || '',
            university: kvk.university?.uniName || null,
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
