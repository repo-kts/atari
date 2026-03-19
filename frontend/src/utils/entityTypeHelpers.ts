import { ENTITY_TYPES } from '../constants/entityConstants';
import type { ExtendedEntityType } from './masterUtils';

/**
 * Entity category mapping for organization
 */
export const ENTITY_CATEGORIES = {
    BASIC: [
        ENTITY_TYPES.ZONES,
        ENTITY_TYPES.STATES,
        ENTITY_TYPES.DISTRICTS,
        ENTITY_TYPES.ORGANIZATIONS,
        ENTITY_TYPES.UNIVERSITIES,
    ] as ExtendedEntityType[],
    OFT_FLD: [
        ENTITY_TYPES.OFT_SUBJECTS,
        ENTITY_TYPES.OFT_THEMATIC_AREAS,
        ENTITY_TYPES.FLD_SECTORS,
        ENTITY_TYPES.FLD_THEMATIC_AREAS,
        ENTITY_TYPES.FLD_CATEGORIES,
        ENTITY_TYPES.FLD_SUBCATEGORIES,
        ENTITY_TYPES.FLD_CROPS,
        ENTITY_TYPES.FLD_ACTIVITIES,
        ENTITY_TYPES.CFLD_CROPS,
        ENTITY_TYPES.SEASONS,
    ] as ExtendedEntityType[],
    TRAINING_EXTENSION: [
        ENTITY_TYPES.TRAINING_TYPES,
        ENTITY_TYPES.TRAINING_AREAS,
        ENTITY_TYPES.TRAINING_THEMATIC_AREAS,
        ENTITY_TYPES.TRAINING_CLIENTELE,
        ENTITY_TYPES.FUNDING_SOURCE,
        ENTITY_TYPES.EXTENSION_ACTIVITIES,
        ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES,
        ENTITY_TYPES.EVENTS,
        // Achievement types that use TrainingExtensionForms
        ENTITY_TYPES.ACHIEVEMENT_TRAINING,
        ENTITY_TYPES.ACHIEVEMENT_EXTENSION,
        ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION,
        ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK,
        ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS,
    ] as ExtendedEntityType[],
    PRODUCTION_PROJECTS: [
        ENTITY_TYPES.PRODUCT_CATEGORIES,
        ENTITY_TYPES.PRODUCT_TYPES,
        ENTITY_TYPES.PRODUCTS,
        ENTITY_TYPES.CRA_CROPPING_SYSTEMS,
        ENTITY_TYPES.CRA_FARMING_SYSTEMS,
        ENTITY_TYPES.ARYA_ENTERPRISES,
    ] as ExtendedEntityType[],
    PUBLICATIONS: [
        ENTITY_TYPES.PUBLICATION_ITEMS,
    ] as ExtendedEntityType[],
    OTHER_MASTERS: [
        ENTITY_TYPES.STAFF_CATEGORY,
        ENTITY_TYPES.PAY_LEVEL,
        ENTITY_TYPES.DISCIPLINE,
        ENTITY_TYPES.SANCTIONED_POST,
        ENTITY_TYPES.SEASON,
        ENTITY_TYPES.YEAR,
        ENTITY_TYPES.CROP_TYPE,
        ENTITY_TYPES.INFRASTRUCTURE_MASTER,
        ENTITY_TYPES.IMPORTANT_DAY,
        ENTITY_TYPES.SOIL_WATER_ANALYSIS,
        ENTITY_TYPES.TRAINING_CLIENTELE,
        ENTITY_TYPES.FUNDING_SOURCE,
        ENTITY_TYPES.EXTENSION_ACTIVITY_TYPE,
        ENTITY_TYPES.OTHER_EXTENSION_ACTIVITY_TYPE,
    ] as ExtendedEntityType[],
    ABOUT_KVK: [
        ENTITY_TYPES.KVKS,
        ENTITY_TYPES.KVK_BANK_ACCOUNTS,
        ENTITY_TYPES.KVK_EMPLOYEES,
        ENTITY_TYPES.KVK_STAFF_TRANSFERRED,
        ENTITY_TYPES.KVK_INFRASTRUCTURE,
        ENTITY_TYPES.KVK_VEHICLES,
        ENTITY_TYPES.KVK_VEHICLE_DETAILS,
        ENTITY_TYPES.KVK_EQUIPMENTS,
        ENTITY_TYPES.KVK_EQUIPMENT_DETAILS,
        ENTITY_TYPES.KVK_FARM_IMPLEMENTS,
    ] as ExtendedEntityType[],
    ACHIEVEMENTS: [
        ENTITY_TYPES.ACHIEVEMENT_OFT,
        ENTITY_TYPES.ACHIEVEMENT_FLD,
        ENTITY_TYPES.ACHIEVEMENT_FLD_EXTENSION_TRAINING,
        ENTITY_TYPES.ACHIEVEMENT_FLD_TECHNICAL_FEEDBACK,
        ENTITY_TYPES.ACHIEVEMENT_TRAINING,
        ENTITY_TYPES.ACHIEVEMENT_EXTENSION,
        ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION,
        ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK,
        ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS,
        ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY,
        ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS,
        ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT,
        ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS,
        ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY,
        ENTITY_TYPES.ACHIEVEMENT_HRD,
        ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK,
        ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST,
        ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER,
    ] as ExtendedEntityType[],
    PROJECTS: [
        ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM,
        ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY,
        ENTITY_TYPES.PROJECT_CFLD_BUDGET,
        ENTITY_TYPES.PROJECT_CRA_DETAILS,
        ENTITY_TYPES.PROJECT_CRA_EXTENSION_ACTIVITY,
        ENTITY_TYPES.PROJECT_FPO_DETAILS,
        ENTITY_TYPES.PROJECT_FPO_MANAGEMENT,
        ENTITY_TYPES.PROJECT_DRMR_DETAILS,
        ENTITY_TYPES.PROJECT_DRMR_ACTIVITY,
        ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN,
        ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED,
        ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION,
        ENTITY_TYPES.PROJECT_NARI_TRAINING,
        ENTITY_TYPES.PROJECT_NARI_EXTENSION,
        ENTITY_TYPES.PROJECT_ARYA_CURRENT,
        ENTITY_TYPES.PROJECT_ARYA_EVALUATION,
        ENTITY_TYPES.PROJECT_CSISA,
        ENTITY_TYPES.PROJECT_TSP_SCSP,
        ENTITY_TYPES.PROJECT_NICRA_BASIC,
        ENTITY_TYPES.PROJECT_NICRA_DETAILS,
        ENTITY_TYPES.PROJECT_NICRA_TRAINING,
        ENTITY_TYPES.PROJECT_NICRA_EXTENSION,
        ENTITY_TYPES.PROJECT_NICRA_INTERVENTION,
        ENTITY_TYPES.PROJECT_NICRA_REVENUE,
        ENTITY_TYPES.PROJECT_NICRA_CUSTOM_HIRING,
        ENTITY_TYPES.PROJECT_NICRA_VCRMC,
        ENTITY_TYPES.PROJECT_NICRA_SOIL_HEALTH,
        ENTITY_TYPES.PROJECT_NICRA_CONVERGENCE,
        ENTITY_TYPES.PROJECT_NICRA_DIGNITARIES,
        ENTITY_TYPES.PROJECT_NICRA_PI_COPI,
        ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO,
        ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL,
        ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO,
        ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS,
        ENTITY_TYPES.PROJECT_NATURAL_FARMING_BENEFICIARIES,
        ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL,
        ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET,
        ENTITY_TYPES.PROJECT_AGRI_DRONE,
        ENTITY_TYPES.PROJECT_AGRI_DRONE_DEMO,
        ENTITY_TYPES.PROJECT_SEED_HUB,
        ENTITY_TYPES.PROJECT_OTHER,
    ] as ExtendedEntityType[],
    MISCELLANEOUS: [
        ENTITY_TYPES.MISC_PREVALENT_DISEASES_CROPS,
        ENTITY_TYPES.MISC_PREVALENT_DISEASES_LIVESTOCK,
        ENTITY_TYPES.MISC_NYK_TRAINING,
        ENTITY_TYPES.MISC_PPV_FRA_TRAINING,
        ENTITY_TYPES.MISC_PPV_FRA_PLANT_VARIETIES,
        ENTITY_TYPES.MISC_RAWE_FET,
        ENTITY_TYPES.MISC_VIP_VISITORS,
        ENTITY_TYPES.PERFORMANCE_IMPACT_KVK_ACTIVITIES,
        ENTITY_TYPES.PERFORMANCE_IMPACT_ENTREPRENEURSHIP,
        ENTITY_TYPES.PERFORMANCE_IMPACT_SUCCESS_STORIES,
        ENTITY_TYPES.PERFORMANCE_DISTRICT_LEVEL,
        ENTITY_TYPES.PERFORMANCE_OPERATIONAL_AREA,
        ENTITY_TYPES.PERFORMANCE_VILLAGE_ADOPTION,
        ENTITY_TYPES.PERFORMANCE_PRIORITY_THRUST,
        ENTITY_TYPES.PERFORMANCE_DEMONSTRATION_UNITS,
        ENTITY_TYPES.PERFORMANCE_INSTRUCTIONAL_FARM_CROPS,
        ENTITY_TYPES.PERFORMANCE_PRODUCTION_UNITS,
        ENTITY_TYPES.PERFORMANCE_INSTRUCTIONAL_FARM_LIVESTOCK,
        ENTITY_TYPES.PERFORMANCE_HOSTEL,
        ENTITY_TYPES.PERFORMANCE_STAFF_QUARTERS,
        ENTITY_TYPES.PERFORMANCE_RAINWATER_HARVESTING,
        ENTITY_TYPES.PERFORMANCE_BUDGET_DETAILS,
        ENTITY_TYPES.PERFORMANCE_PROJECT_BUDGET,
        ENTITY_TYPES.PERFORMANCE_REVOLVING_FUND,
        ENTITY_TYPES.PERFORMANCE_REVENUE_GENERATION,
        ENTITY_TYPES.PERFORMANCE_RESOURCE_GENERATION,
        ENTITY_TYPES.PERFORMANCE_FUNCTIONAL_LINKAGE,
        ENTITY_TYPES.PERFORMANCE_SPECIAL_PROGRAMMES,
        ENTITY_TYPES.MISC_DIGITAL_MOBILE_APP,
        ENTITY_TYPES.MISC_DIGITAL_WEB_PORTAL,
        ENTITY_TYPES.MISC_DIGITAL_KISAN_SARATHI,
        ENTITY_TYPES.MISC_DIGITAL_KISAN_MOBILE_ADVISORY,
        ENTITY_TYPES.MISC_DIGITAL_OTHER_CHANNELS,
        ENTITY_TYPES.MISC_SWACHHTA_SEWA,
        ENTITY_TYPES.MISC_SWACHHTA_PAKHWADA,
        ENTITY_TYPES.MISC_SWACHHTA_BUDGET,
        ENTITY_TYPES.MISC_MEETINGS_SAC,
        ENTITY_TYPES.MISC_MEETINGS_OTHER,
    ] as ExtendedEntityType[],
};

/**
 * Get entity type from URL path using direct mapping
 */
export const getEntityTypeFromPathMap = (path: string): ExtendedEntityType | null => {
    const pathMap: Record<string, ExtendedEntityType> = {
        // Basic Masters
        '/all-master/zones': ENTITY_TYPES.ZONES,
        '/all-master/states': ENTITY_TYPES.STATES,
        '/all-master/districts': ENTITY_TYPES.DISTRICTS,
        '/all-master/organizations': ENTITY_TYPES.ORGANIZATIONS,
        '/all-master/universities': ENTITY_TYPES.UNIVERSITIES,

        // OFT/FLD Masters
        '/all-master/oft/subject': ENTITY_TYPES.OFT_SUBJECTS,
        '/all-master/oft/thematic-area': ENTITY_TYPES.OFT_THEMATIC_AREAS,
        '/all-master/fld/sector': ENTITY_TYPES.FLD_SECTORS,
        '/all-master/fld/thematic-area': ENTITY_TYPES.FLD_THEMATIC_AREAS,
        '/all-master/fld/category': ENTITY_TYPES.FLD_CATEGORIES,
        '/all-master/fld/sub-category': ENTITY_TYPES.FLD_SUBCATEGORIES,
        '/all-master/fld/crop': ENTITY_TYPES.FLD_CROPS,
        '/all-master/fld/activity': ENTITY_TYPES.FLD_ACTIVITIES,
        '/all-master/cfld-crop': ENTITY_TYPES.CFLD_CROPS,
        '/all-master/seasons': ENTITY_TYPES.SEASONS,

        // Training, Extension & Events
        '/all-master/training-type': ENTITY_TYPES.TRAINING_TYPES,
        '/all-master/training-area': ENTITY_TYPES.TRAINING_AREAS,
        '/all-master/training-thematic': ENTITY_TYPES.TRAINING_THEMATIC_AREAS,
        '/all-master/extension-activity': ENTITY_TYPES.EXTENSION_ACTIVITIES,
        '/all-master/other-extension-activity': ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES,
        '/all-master/events': ENTITY_TYPES.EVENTS,

        // Production & Projects
        '/all-master/product-category': ENTITY_TYPES.PRODUCT_CATEGORIES,
        '/all-master/product-type': ENTITY_TYPES.PRODUCT_TYPES,
        '/all-master/product': ENTITY_TYPES.PRODUCTS,
        '/all-master/cra-croping-system': ENTITY_TYPES.CRA_CROPPING_SYSTEMS,
        '/all-master/cra-farming-system': ENTITY_TYPES.CRA_FARMING_SYSTEMS,
        '/all-master/arya-enterprise': ENTITY_TYPES.ARYA_ENTERPRISES,

        // Publications
        '/all-master/publication-item': ENTITY_TYPES.PUBLICATION_ITEMS,

        // Other Masters
        '/all-master/staff-category': ENTITY_TYPES.STAFF_CATEGORY,
        '/all-master/pay-level': ENTITY_TYPES.PAY_LEVEL,
        '/all-master/discipline': ENTITY_TYPES.DISCIPLINE,
        '/all-master/sanctioned-post': ENTITY_TYPES.SANCTIONED_POST,
        '/all-master/season': ENTITY_TYPES.SEASON,
        '/all-master/year': ENTITY_TYPES.YEAR,
        '/all-master/crop-type': ENTITY_TYPES.CROP_TYPE,
        '/all-master/infrastructure-master': ENTITY_TYPES.INFRASTRUCTURE_MASTER,
        '/all-master/important-day': ENTITY_TYPES.IMPORTANT_DAY,
        '/all-master/soil-water-analysis': ENTITY_TYPES.SOIL_WATER_ANALYSIS,
        '/all-master/training-clientele': ENTITY_TYPES.TRAINING_CLIENTELE,
        '/all-master/funding-source': ENTITY_TYPES.FUNDING_SOURCE,
        '/all-master/extension-activity-type': ENTITY_TYPES.EXTENSION_ACTIVITY_TYPE,
        '/all-master/other-extension-activity-type': ENTITY_TYPES.OTHER_EXTENSION_ACTIVITY_TYPE,

        // About KVK
        '/forms/about-kvk/bank-account': ENTITY_TYPES.KVK_BANK_ACCOUNTS,
        '/forms/about-kvk/employee-details': ENTITY_TYPES.KVK_EMPLOYEES,
        '/forms/about-kvk/staff-transferred': ENTITY_TYPES.KVK_STAFF_TRANSFERRED,
        '/forms/about-kvk/infrastructure': ENTITY_TYPES.KVK_INFRASTRUCTURE,
        '/forms/about-kvk/vehicles': ENTITY_TYPES.KVK_VEHICLES,
        '/forms/about-kvk/vehicle-details': ENTITY_TYPES.KVK_VEHICLE_DETAILS,
        '/forms/about-kvk/equipments': ENTITY_TYPES.KVK_EQUIPMENTS,
        '/forms/about-kvk/equipment-details': ENTITY_TYPES.KVK_EQUIPMENT_DETAILS,
        '/forms/about-kvk/farm-implements': ENTITY_TYPES.KVK_FARM_IMPLEMENTS,
        '/forms/about-kvk/details': ENTITY_TYPES.KVKS,
        '/forms/about-kvk/view-kvks': ENTITY_TYPES.KVKS,

        // Achievements
        '/forms/achievements/oft': ENTITY_TYPES.ACHIEVEMENT_OFT,
        '/forms/achievements/fld': ENTITY_TYPES.ACHIEVEMENT_FLD,
        '/forms/achievements/fld/extension-training': ENTITY_TYPES.ACHIEVEMENT_FLD_EXTENSION_TRAINING,
        '/forms/achievements/fld/technical-feedback': ENTITY_TYPES.ACHIEVEMENT_FLD_TECHNICAL_FEEDBACK,
        '/forms/achievements/trainings': ENTITY_TYPES.ACHIEVEMENT_TRAINING,
        '/forms/achievements/extension-activities': ENTITY_TYPES.ACHIEVEMENT_EXTENSION,
        '/forms/achievements/other-extension': ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION,
        '/forms/achievements/technology-week': ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK,
        '/forms/achievements/celebration-days': ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS,
        '/forms/achievements/production-supply': ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY,
        '/forms/achievements/publication-details': ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS,
        '/forms/achievements/publications': ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS,
        '/forms/achievements/soil-equipment': ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT,
        '/forms/achievements/soil-analysis': ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS,
        '/forms/achievements/world-soil-day': ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY,
        '/forms/achievements/hrd': ENTITY_TYPES.ACHIEVEMENT_HRD,
        '/forms/achievements/awards/kvk': ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK,
        '/forms/achievements/awards/scientist': ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST,
        '/forms/achievements/awards/farmer': ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER,

        // Projects
        '/forms/achievements/projects/cfld/technical-parameter': ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM,
        '/forms/achievements/projects/cfld/extension-activity': ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY,
        '/forms/achievements/projects/cfld/budget-utilization': ENTITY_TYPES.PROJECT_CFLD_BUDGET,
        '/forms/achievements/projects/cra/details': ENTITY_TYPES.PROJECT_CRA_DETAILS,
        '/forms/achievements/projects/cra/extension': ENTITY_TYPES.PROJECT_CRA_EXTENSION_ACTIVITY,
        '/forms/achievements/projects/fpo/details': ENTITY_TYPES.PROJECT_FPO_DETAILS,
        '/forms/achievements/projects/fpo/management': ENTITY_TYPES.PROJECT_FPO_MANAGEMENT,
        '/forms/achievements/projects/seed-hub-program': ENTITY_TYPES.PROJECT_SEED_HUB,
        '/forms/achievements/projects/arya': ENTITY_TYPES.PROJECT_ARYA_CURRENT,
        '/forms/achievements/projects/arya-evaluation': ENTITY_TYPES.PROJECT_ARYA_EVALUATION,
        '/forms/achievements/projects/csisa': ENTITY_TYPES.PROJECT_CSISA,
        '/forms/achievements/projects/sub-plan-activity': ENTITY_TYPES.PROJECT_TSP_SCSP,
        '/forms/achievements/projects/agri-drone': ENTITY_TYPES.PROJECT_AGRI_DRONE,
        '/forms/achievements/projects/demonstration-details': ENTITY_TYPES.PROJECT_AGRI_DRONE_DEMO,
        '/forms/achievements/projects/drmr/details': ENTITY_TYPES.PROJECT_DRMR_DETAILS,
        '/forms/achievements/projects/drmr/activity': ENTITY_TYPES.PROJECT_DRMR_ACTIVITY,
        '/forms/achievements/projects/nari/nutri-smart': ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN,
        '/forms/achievements/projects/nari/bio-fortified': ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED,
        '/forms/achievements/projects/nari/value-addition': ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION,
        '/forms/achievements/projects/nari/training-programm': ENTITY_TYPES.PROJECT_NARI_TRAINING,
        '/forms/achievements/projects/nari/extension-activities': ENTITY_TYPES.PROJECT_NARI_EXTENSION,
        // NICRA
        '/forms/achievements/projects/nicra/basic': ENTITY_TYPES.PROJECT_NICRA_BASIC,
        '/forms/achievements/projects/nicra/details': ENTITY_TYPES.PROJECT_NICRA_DETAILS,
        '/forms/achievements/projects/nicra/training': ENTITY_TYPES.PROJECT_NICRA_TRAINING,
        '/forms/achievements/projects/nicra/extension': ENTITY_TYPES.PROJECT_NICRA_EXTENSION,
        '/forms/achievements/projects/nicra/others/intervention': ENTITY_TYPES.PROJECT_NICRA_INTERVENTION,
        '/forms/achievements/projects/nicra/others/revenue-generated': ENTITY_TYPES.PROJECT_NICRA_REVENUE,
        '/forms/achievements/projects/nicra/others/custom-hiring': ENTITY_TYPES.PROJECT_NICRA_CUSTOM_HIRING,
        '/forms/achievements/projects/nicra/others/vcrmc': ENTITY_TYPES.PROJECT_NICRA_VCRMC,
        '/forms/achievements/projects/nicra/others/soil-health-card': ENTITY_TYPES.PROJECT_NICRA_SOIL_HEALTH,
        '/forms/achievements/projects/nicra/others/convergence-programme': ENTITY_TYPES.PROJECT_NICRA_CONVERGENCE,
        '/forms/achievements/projects/nicra/others/dignitaries-visited': ENTITY_TYPES.PROJECT_NICRA_DIGNITARIES,
        '/forms/achievements/projects/nicra/others/pi-copi-list': ENTITY_TYPES.PROJECT_NICRA_PI_COPI,
        '/forms/achievements/projects/natural-farming/geographical-information': ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO,
        '/forms/achievements/projects/natural-farming/physical-information': ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL,
        '/forms/achievements/projects/natural-farming/demonstration-information': ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO,
        '/forms/achievements/projects/natural-farming/farmers-practicing': ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS,
        '/forms/achievements/projects/natural-farming/beneficiaries': ENTITY_TYPES.PROJECT_NATURAL_FARMING_BENEFICIARIES,
        '/forms/achievements/projects/natural-farming/soil-data': ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL,
        '/forms/achievements/projects/natural-farming/budget-expenditure': ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET,
        '/forms/achievements/other-program': ENTITY_TYPES.PROJECT_OTHER,

        // Miscellaneous
        '/forms/miscellaneous/diseases/crops': ENTITY_TYPES.MISC_PREVALENT_DISEASES_CROPS,
        '/forms/miscellaneous/diseases/livestock': ENTITY_TYPES.MISC_PREVALENT_DISEASES_LIVESTOCK,
        '/forms/miscellaneous/prevalent-diseases/crops': ENTITY_TYPES.MISC_PREVALENT_DISEASES_CROPS,
        '/forms/miscellaneous/prevalent-diseases/livestock': ENTITY_TYPES.MISC_PREVALENT_DISEASES_LIVESTOCK,
        '/forms/miscellaneous/nyk-training': ENTITY_TYPES.MISC_NYK_TRAINING,
        '/forms/miscellaneous/nehru-yuva-kendra': ENTITY_TYPES.MISC_NYK_TRAINING,
        '/forms/miscellaneous/ppv-fra/training': ENTITY_TYPES.MISC_PPV_FRA_TRAINING,
        '/forms/miscellaneous/ppv-fra/plant-varieties': ENTITY_TYPES.MISC_PPV_FRA_PLANT_VARIETIES,
        '/forms/miscellaneous/rawe-fet': ENTITY_TYPES.MISC_RAWE_FET,
        '/forms/miscellaneous/vip-visitors': ENTITY_TYPES.MISC_VIP_VISITORS,

        // Performance Indicators
        '/forms/performance/impact/kvk-activities': ENTITY_TYPES.PERFORMANCE_IMPACT_KVK_ACTIVITIES,
        '/forms/performance/impact/entrepreneurship': ENTITY_TYPES.PERFORMANCE_IMPACT_ENTREPRENEURSHIP,
        '/forms/performance/impact/success-stories': ENTITY_TYPES.PERFORMANCE_IMPACT_SUCCESS_STORIES,
        '/forms/performance/district-village/district-level': ENTITY_TYPES.PERFORMANCE_DISTRICT_LEVEL,
        '/forms/performance/district-village/operational-area': ENTITY_TYPES.PERFORMANCE_OPERATIONAL_AREA,
        '/forms/performance/district-village/village-adoption': ENTITY_TYPES.PERFORMANCE_VILLAGE_ADOPTION,
        '/forms/performance/district-village/priority-thrust': ENTITY_TYPES.PERFORMANCE_PRIORITY_THRUST,
        '/forms/performance/infrastructure/demonstration-units': ENTITY_TYPES.PERFORMANCE_DEMONSTRATION_UNITS,
        '/forms/performance/infrastructure/instructional-farm-crops': ENTITY_TYPES.PERFORMANCE_INSTRUCTIONAL_FARM_CROPS,
        '/forms/performance/infrastructure/production-units': ENTITY_TYPES.PERFORMANCE_PRODUCTION_UNITS,
        '/forms/performance/infrastructure/instructional-farm-livestock': ENTITY_TYPES.PERFORMANCE_INSTRUCTIONAL_FARM_LIVESTOCK,
        '/forms/performance/infrastructure/hostel': ENTITY_TYPES.PERFORMANCE_HOSTEL,
        '/forms/performance/infrastructure/staff-quarters': ENTITY_TYPES.PERFORMANCE_STAFF_QUARTERS,
        '/forms/performance/infrastructure/rainwater-harvesting': ENTITY_TYPES.PERFORMANCE_RAINWATER_HARVESTING,
        '/forms/performance/financial/budget-details': ENTITY_TYPES.PERFORMANCE_BUDGET_DETAILS,
        '/forms/performance/financial/project-budget': ENTITY_TYPES.PERFORMANCE_PROJECT_BUDGET,
        '/forms/performance/financial/revolving-fund': ENTITY_TYPES.PERFORMANCE_REVOLVING_FUND,
        '/forms/performance/financial/revenue-generation': ENTITY_TYPES.PERFORMANCE_REVENUE_GENERATION,
        '/forms/performance/financial/resource-generation': ENTITY_TYPES.PERFORMANCE_RESOURCE_GENERATION,
        '/forms/performance/linkages/functional-linkage': ENTITY_TYPES.PERFORMANCE_FUNCTIONAL_LINKAGE,
        '/forms/performance/linkages/special-programmes': ENTITY_TYPES.PERFORMANCE_SPECIAL_PROGRAMMES,

        // Digital Information
        '/forms/digital-information/mobile-app': ENTITY_TYPES.MISC_DIGITAL_MOBILE_APP,
        '/forms/digital-information/web-portal': ENTITY_TYPES.MISC_DIGITAL_WEB_PORTAL,
        '/forms/digital-information/kisan-sarathi': ENTITY_TYPES.MISC_DIGITAL_KISAN_SARATHI,
        '/forms/digital-information/kisan-mobile-advisory': ENTITY_TYPES.MISC_DIGITAL_KISAN_MOBILE_ADVISORY,
        '/forms/digital-information/other-channels': ENTITY_TYPES.MISC_DIGITAL_OTHER_CHANNELS,

        // Swachhta Bharat Abhiyaan
        '/forms/swachhta-bharat-abhiyaan/sewa': ENTITY_TYPES.MISC_SWACHHTA_SEWA,
        '/forms/swachhta-bharat-abhiyaan/pakhwada': ENTITY_TYPES.MISC_SWACHHTA_PAKHWADA,
        '/forms/swachhta-bharat-abhiyaan/budget': ENTITY_TYPES.MISC_SWACHHTA_BUDGET,

        // Meetings
        '/forms/meetings/sac': ENTITY_TYPES.MISC_MEETINGS_SAC,
        '/forms/meetings/other': ENTITY_TYPES.MISC_MEETINGS_OTHER,
    };

    // First try exact match
    if (pathMap[path]) return pathMap[path];

    // Then try with trailing slash or without
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    const otherPath = path.endsWith('/') ? path : path + '/';

    return pathMap[normalizedPath] || pathMap[otherPath] || null;
};

/**
 * Get entity type checks
 */
export const getEntityTypeChecks = (entityType: ExtendedEntityType | null) => {
    if (!entityType) {
        return {
            isBasic: false,
            isBasicMaster: false,
            isOftFld: false,
            isTrainingExtension: false,
            isProductionProjects: false,
            isProductionProject: false,
            isPublications: false,
            isOtherMasters: false,
            isOtherMaster: false,
            isAboutKvk: false,
            isAchievements: false,
            isProjects: false,
            isProject: false,
            isMiscellaneous: false,
            isSoilWaterTesting: false,
            isHrd: false,
            isAward: false,
            isPerformanceImpact: false,
            isPerformanceDistrictVillage: false,
            isPerformanceInfrastructure: false,
            isPerformanceFinancial: false,
            isPerformanceLinkages: false,
            isDigitalInformation: false,
            isSwachhtaBharatAbhiyaan: false,
            isMeetings: false,
        };
    }

    const isBasic = ENTITY_CATEGORIES.BASIC.includes(entityType);
    const isProductionProjects = ENTITY_CATEGORIES.PRODUCTION_PROJECTS.includes(entityType) ||
        entityType === ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY;
    const isOtherMasters = ENTITY_CATEGORIES.OTHER_MASTERS.includes(entityType);
    const isProjects = ENTITY_CATEGORIES.PROJECTS.includes(entityType);

    return {
        isBasic,
        isBasicMaster: isBasic, // Alias
        isOftFld: ENTITY_CATEGORIES.OFT_FLD.includes(entityType) ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_OFT ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_FLD ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_FLD_EXTENSION_TRAINING ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_FLD_TECHNICAL_FEEDBACK,
        isTrainingExtension: ENTITY_CATEGORIES.TRAINING_EXTENSION.includes(entityType),
        isProductionProjects,
        isProductionProject: isProductionProjects, // Alias
        isPublications: ENTITY_CATEGORIES.PUBLICATIONS.includes(entityType),
        isOtherMasters,
        isOtherMaster: isOtherMasters, // Alias
        isAboutKvk: ENTITY_CATEGORIES.ABOUT_KVK.includes(entityType),
        isAchievements: ENTITY_CATEGORIES.ACHIEVEMENTS.includes(entityType),
        isProjects,
        isProject: isProjects, // Alias
        isMiscellaneous: ENTITY_CATEGORIES.MISCELLANEOUS.includes(entityType),

        // Specific flags used in DataManagementFormPage
        isSoilWaterTesting: entityType === ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY,
        isHrd: entityType === ENTITY_TYPES.ACHIEVEMENT_HRD,
        isAward: entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER,
        isPerformanceImpact: entityType.startsWith('performance-impact-'),
        isPerformanceDistrictVillage: entityType.startsWith('performance-district-') ||
            entityType.startsWith('performance-operational-') ||
            entityType.startsWith('performance-village-') ||
            entityType.startsWith('performance-priority-'),
        isPerformanceInfrastructure: entityType.startsWith('performance-infrastructure-') ||
            entityType.startsWith('performance-demonstration-') ||
            entityType.startsWith('performance-instructional-') ||
            entityType.startsWith('performance-production-') ||
            entityType.startsWith('performance-hostel') ||
            entityType.startsWith('performance-staff-') ||
            entityType.startsWith('performance-rainwater-'),
        isPerformanceFinancial: entityType.startsWith('performance-financial-') ||
            entityType.startsWith('performance-budget-') ||
            entityType.startsWith('performance-project-budget') ||
            entityType.startsWith('performance-revolving-') ||
            entityType.startsWith('performance-revenue-') ||
            entityType.startsWith('performance-resource-'),
        isPerformanceLinkages: entityType.startsWith('performance-functional-') ||
            entityType.startsWith('performance-special-') ||
            entityType.startsWith('performance-linkages-'),
        isDigitalInformation: entityType.startsWith('misc-digital-'),
        isSwachhtaBharatAbhiyaan: entityType.startsWith('misc-swachhta-'),
        isMeetings: entityType.startsWith('misc-meetings-'),
    };
};
