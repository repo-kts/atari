import { ENTITY_TYPES, type EntityTypeConstant } from '@/constants/entityConstants'

/**
 * Maps data-management entity types to backend report template keys for export.
 */
export const ENTITY_TYPE_EXPORT_TEMPLATE_MAP: Partial<
    Record<EntityTypeConstant, string>
> = {
    [ENTITY_TYPES.KVKS]: 'about-kvk-view',
    [ENTITY_TYPES.KVK_BANK_ACCOUNTS]: 'about-kvk-bank-accounts',
    [ENTITY_TYPES.KVK_EMPLOYEES]: 'about-kvk-employees-full',
    [ENTITY_TYPES.KVK_VEHICLES]: 'about-kvk-vehicles',
    [ENTITY_TYPES.KVK_VEHICLE_DETAILS]: 'about-kvk-vehicle-details',
    [ENTITY_TYPES.KVK_EQUIPMENT_DETAILS]: 'about-kvk-equipment-records',
    [ENTITY_TYPES.ACHIEVEMENT_OFT]: 'oft-combined',
    [ENTITY_TYPES.ACHIEVEMENT_FLD]: 'fld-page-report',
    [ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM]: 'cfld-combined',
    [ENTITY_TYPES.PROJECT_CRA_DETAILS]: 'cra-details-state-wise',
    [ENTITY_TYPES.PROJECT_CRA_EXTENSION_ACTIVITY]: 'cra-extension-activity',
    [ENTITY_TYPES.PROJECT_FPO_DETAILS]: 'fpo-cbbo-details',
    [ENTITY_TYPES.PROJECT_FPO_MANAGEMENT]: 'fpo-management-details',
    [ENTITY_TYPES.PROJECT_DRMR_DETAILS]: 'drmr-details',
    [ENTITY_TYPES.PROJECT_DRMR_ACTIVITY]: 'drmr-activity',
    [ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN]: 'nari-nutrition-garden',
    [ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED]: 'nari-bio-fortified',
    [ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION]: 'nari-value-addition',
    [ENTITY_TYPES.PROJECT_NARI_TRAINING]: 'nari-training',
    [ENTITY_TYPES.PROJECT_NARI_EXTENSION]: 'nari-extension',
    [ENTITY_TYPES.PROJECT_ARYA_CURRENT]: 'arya-current',
    [ENTITY_TYPES.PROJECT_ARYA_EVALUATION]: 'arya-prev-year',
    [ENTITY_TYPES.PROJECT_NICRA_BASIC]: 'nicra-basic',
    [ENTITY_TYPES.PROJECT_SEED_HUB]: 'seed-hub',
    [ENTITY_TYPES.PROJECT_OTHER]: 'other-programmes',
    [ENTITY_TYPES.PROJECT_NICRA_TRAINING]: 'nicra-training',
    [ENTITY_TYPES.PROJECT_NICRA_INTERVENTION]: 'nicra-intervention',
    [ENTITY_TYPES.PROJECT_NICRA_EXTENSION]: 'nicra-extension',
    [ENTITY_TYPES.PROJECT_NICRA_CUSTOM_HIRING]: 'nicra-farm-implement',
    [ENTITY_TYPES.PROJECT_NICRA_VCRMC]: 'nicra-vcrmc',
    [ENTITY_TYPES.PROJECT_NICRA_SOIL_HEALTH]: 'nicra-soil-health',
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL]: 'natural-farming-physical',
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO]: 'nf-demonstration-information',
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS]:
        'nf-farmers-practicing-information',
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL]: 'nf-soil-data-information',
    [ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET]:
        'nf-budget-expenditure-information',
    [ENTITY_TYPES.PROJECT_AGRI_DRONE]: 'agri-drone-introduction',
    [ENTITY_TYPES.PROJECT_AGRI_DRONE_DEMO]: 'agri-drone-demonstration-details',
    [ENTITY_TYPES.PROJECT_CSISA]: 'csisa',
    [ENTITY_TYPES.PROJECT_TSP_SCSP]: 'tsp-scsp',
    [ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY]: 'cfld-extension-activity',
    [ENTITY_TYPES.PROJECT_CFLD_BUDGET]: 'cfld-budget-utilization',
    [ENTITY_TYPES.PERFORMANCE_SPECIAL_PROGRAMMES]: 'special-programme',
    [ENTITY_TYPES.PERFORMANCE_FUNCTIONAL_LINKAGE]: 'functional-linkage',
    [ENTITY_TYPES.PERFORMANCE_IMPACT_SUCCESS_STORIES]: 'success-story',
    [ENTITY_TYPES.PERFORMANCE_IMPACT_ENTREPRENEURSHIP]: 'entrepreneurship',
    [ENTITY_TYPES.PERFORMANCE_IMPACT_KVK_ACTIVITIES]: 'kvk-impact-activity',
    [ENTITY_TYPES.PERFORMANCE_DEMONSTRATION_UNITS]: 'demonstration-unit',
    [ENTITY_TYPES.PERFORMANCE_INSTRUCTIONAL_FARM_CROPS]:
        'instructional-farm-crop',
    [ENTITY_TYPES.PERFORMANCE_PRODUCTION_UNITS]: 'production-unit',
    [ENTITY_TYPES.PERFORMANCE_INSTRUCTIONAL_FARM_LIVESTOCK]:
        'instructional-farm-livestock',
    [ENTITY_TYPES.PERFORMANCE_HOSTEL]: 'hostel-utilization',
    [ENTITY_TYPES.PERFORMANCE_STAFF_QUARTERS]: 'staff-quarters',
    [ENTITY_TYPES.PERFORMANCE_RAINWATER_HARVESTING]: 'rainwater-harvesting',
    [ENTITY_TYPES.ACHIEVEMENT_TRAINING]: 'trainings-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_EXTENSION]: 'extension-activities-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION]:
        'other-extension-content-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK]:
        'technology-week-celebration-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS]: 'celebration-days-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY]:
        'production-supply-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS]: 'soil-water-samples-b-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT]:
        'soil-water-equipment-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY]: 'world-soil-day-page-report',
    [ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS]: 'publication-details-detailed',
}

export function getExportTemplateKey(
    entityType: string | null | undefined,
): string | undefined {
    if (entityType == null || entityType === '') return undefined
    return ENTITY_TYPE_EXPORT_TEMPLATE_MAP[entityType as EntityTypeConstant]
}
