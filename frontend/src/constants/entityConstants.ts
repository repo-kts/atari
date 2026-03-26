/**
 * Entity Constants Configuration
 *
 * Centralized constants for entity types and their corresponding paths.
 * This file serves as the single source of truth for entity identification
 * and routing throughout the application.
 *
 * For route paths, prefer using ROUTE_PATHS from './routePaths' for consistency.
 */

export const ENTITY_TYPES = {
    // Basic Masters
    ZONES: 'zones',
    STATES: 'states',
    DISTRICTS: 'districts',
    ORGANIZATIONS: 'organizations',
    UNIVERSITIES: 'universities',

    // OFT/FLD Masters
    OFT_SUBJECTS: 'oft-subjects',
    OFT_THEMATIC_AREAS: 'oft-thematic-areas',
    FLD_SECTORS: 'fld-sectors',
    FLD_THEMATIC_AREAS: 'fld-thematic-areas',
    FLD_CATEGORIES: 'fld-categories',
    FLD_SUBCATEGORIES: 'fld-subcategories',
    FLD_CROPS: 'fld-crops',
    FLD_ACTIVITIES: 'fld-activities',
    CFLD_CROPS: 'cfld-crops',
    SEASONS: 'seasons',

    // Other Masters
    SEASON: 'season',
    SANCTIONED_POST: 'sanctioned-post',
    YEAR: 'year',

    // Employee Masters
    STAFF_CATEGORY: 'staff-category',
    PAY_LEVEL: 'pay-level',
    DISCIPLINE: 'discipline',

    // Extension Masters
    EXTENSION_ACTIVITY_TYPE: 'extension-activity-type',
    OTHER_EXTENSION_ACTIVITY_TYPE: 'other-extension-activity-type',
    IMPORTANT_DAY: 'important-day',

    // Training Masters
    TRAINING_CLIENTELE: 'training-clientele',
    FUNDING_SOURCE: 'funding-source',

    // Other Masters (continued)
    CROP_TYPE: 'crop-type',
    INFRASTRUCTURE_MASTER: 'infrastructure-master',
    SOIL_WATER_ANALYSIS: 'soil-water-analysis',

    // NARI Masters
    NARI_ACTIVITY: 'nari-activity',
    NARI_CROP_CATEGORY: 'nari-crop-category',
    NARI_NUTRITION_GARDEN_TYPE: 'nari-nutrition-garden-type',
    NICRA_CATEGORY: 'nicra-category',
    NICRA_SUB_CATEGORY: 'nicra-sub-category',
    NICRA_SEED_BANK_FODDER_BANK: 'nicra-seed-bank-fodder-bank',
    NICRA_DIGNITARY_TYPE: 'nicra-dignitary-type',
    NICRA_PI_TYPE: 'nicra-pi-type',

    // Training, Extension & Events
    TRAINING_TYPES: 'training-types',
    TRAINING_AREAS: 'training-areas',
    TRAINING_THEMATIC_AREAS: 'training-thematic-areas',
    EXTENSION_ACTIVITIES: 'extension-activities',
    OTHER_EXTENSION_ACTIVITIES: 'other-extension-activities',
    EVENTS: 'events',

    // Production & Projects
    PRODUCT_CATEGORIES: 'product-categories',
    PRODUCT_TYPES: 'product-types',
    PRODUCTS: 'products',
    CRA_CROPPING_SYSTEMS: 'cra-cropping-systems',
    CRA_FARMING_SYSTEMS: 'cra-farming-systems',
    ARYA_ENTERPRISES: 'arya-enterprises',
    TSP_SCSP_TYPES: 'tsp-scsp-types',
    TSP_SCSP_ACTIVITIES: 'tsp-scsp-activities',
    NATURAL_FARMING_ACTIVITIES: 'natural-farming-activities',
    NATURAL_FARMING_SOIL_PARAMETERS: 'natural-farming-soil-parameters',
    AGRI_DRONE_DEMONSTRATIONS_ON: 'agri-drone-demonstrations-on',

    // Publications
    PUBLICATION_ITEMS: 'publication-items',

    // About KVK Entities
    KVK_BANK_ACCOUNTS: 'kvk-bank-accounts',
    KVK_EMPLOYEES: 'kvk-employees',
    KVK_STAFF_TRANSFERRED: 'kvk-staff-transferred',
    KVK_INFRASTRUCTURE: 'kvk-infrastructure',
    KVK_VEHICLES: 'kvk-vehicles',
    KVK_VEHICLE_DETAILS: 'kvk-vehicle-details',
    KVK_EQUIPMENTS: 'kvk-equipments',
    KVK_EQUIPMENT_DETAILS: 'kvk-equipment-details',
    KVK_FARM_IMPLEMENTS: 'kvk-farm-implements',
    KVKS: 'kvks',

    // Achievements (OFT & FLD)
    ACHIEVEMENT_OFT: 'achievement-oft',
    ACHIEVEMENT_FLD: 'achievement-fld',
    ACHIEVEMENT_FLD_EXTENSION_TRAINING: 'achievement-fld-extension-training',
    ACHIEVEMENT_FLD_TECHNICAL_FEEDBACK: 'achievement-fld-technical-feedback',

    ACHIEVEMENT_TRAINING: 'achievement-training',
    ACHIEVEMENT_EXTENSION: 'achievement-extension',
    ACHIEVEMENT_OTHER_EXTENSION: 'achievement-other-extension',
    ACHIEVEMENT_TECHNOLOGY_WEEK: 'achievement-technology-week',
    ACHIEVEMENT_CELEBRATION_DAYS: 'achievement-celebration-days',
    ACHIEVEMENT_PRODUCTION_SUPPLY: 'achievement-production-supply',
    ACHIEVEMENT_PUBLICATION_DETAILS: 'achievement-publication-details',
    ACHIEVEMENT_SOIL_EQUIPMENT: 'achievement-soil-equipment',
    ACHIEVEMENT_SOIL_ANALYSIS: 'achievement-soil-analysis',
    ACHIEVEMENT_WORLD_SOIL_DAY: 'achievement-world-soil-day',
    ACHIEVEMENT_HRD: 'achievement-hrd',
    ACHIEVEMENT_AWARD_KVK: 'achievement-award-kvk',
    ACHIEVEMENT_AWARD_SCIENTIST: 'achievement-award-scientist',
    ACHIEVEMENT_AWARD_FARMER: 'achievement-award-farmer',

    // Projects
    PROJECT_CFLD_TECHNICAL_PARAM: 'project-cfld-technical-param',
    PROJECT_CFLD_EXTENSION_ACTIVITY: 'project-cfld-extension-activity',
    PROJECT_CFLD_BUDGET: 'project-cfld-budget',

    PROJECT_CRA_DETAILS: 'project-cra-details',
    PROJECT_CRA_EXTENSION_ACTIVITY: 'project-cra-extension-activity',

    PROJECT_FPO_DETAILS: 'project-fpo-details',
    PROJECT_FPO_MANAGEMENT: 'project-fpo-management',

    PROJECT_DRMR_DETAILS: 'project-drmr-details',
    PROJECT_DRMR_ACTIVITY: 'project-drmr-activity',

    PROJECT_NARI_NUTRI_GARDEN: 'project-nari-nutri-garden',
    PROJECT_NARI_BIO_FORTIFIED: 'project-nari-bio-fortified',
    PROJECT_NARI_VALUE_ADDITION: 'project-nari-value-addition',
    PROJECT_NARI_TRAINING: 'project-nari-training',
    PROJECT_NARI_EXTENSION: 'project-nari-extension',

    PROJECT_ARYA_CURRENT: 'project-arya-current',
    PROJECT_ARYA_EVALUATION: 'project-arya-evaluation',

    PROJECT_CSISA: 'project-csisa',
    PROJECT_TSP_SCSP: 'project-tsp-scsp',

    PROJECT_NICRA_BASIC: 'project-nicra-basic',
    PROJECT_NICRA_DETAILS: 'project-nicra-details',
    PROJECT_NICRA_TRAINING: 'project-nicra-training',
    PROJECT_NICRA_EXTENSION: 'project-nicra-extension',
    PROJECT_NICRA_INTERVENTION: 'project-nicra-intervention',
    PROJECT_NICRA_REVENUE: 'project-nicra-revenue',
    PROJECT_NICRA_CUSTOM_HIRING: 'project-nicra-custom-hiring',
    PROJECT_NICRA_VCRMC: 'project-nicra-vcrmc',
    PROJECT_NICRA_SOIL_HEALTH: 'project-nicra-soil-health',
    PROJECT_NICRA_CONVERGENCE: 'project-nicra-convergence',
    PROJECT_NICRA_DIGNITARIES: 'project-nicra-dignitaries',
    PROJECT_NICRA_PI_COPI: 'project-nicra-pi-copi',

    PROJECT_NATURAL_FARMING_GEO: 'project-natural-farming-geo',
    PROJECT_NATURAL_FARMING_PHYSICAL: 'project-natural-farming-physical',
    PROJECT_NATURAL_FARMING_DEMO: 'project-natural-farming-demo',
    PROJECT_NATURAL_FARMING_FARMERS: 'project-natural-farming-farmers',
    PROJECT_NATURAL_FARMING_BENEFICIARIES: 'project-natural-farming-beneficiaries',
    PROJECT_NATURAL_FARMING_SOIL: 'project-natural-farming-soil',
    PROJECT_NATURAL_FARMING_BUDGET: 'project-natural-farming-budget',

    PROJECT_AGRI_DRONE: 'project-agri-drone',
    PROJECT_AGRI_DRONE_DEMO: 'project-agri-drone-demo',

    PROJECT_SEED_HUB: 'project-seed-hub',
    PROJECT_OTHER: 'project-other',

    // Miscellaneous
    MISC_PREVALENT_DISEASES_CROPS: 'misc-prevalent-diseases-crops',
    MISC_PREVALENT_DISEASES_LIVESTOCK: 'misc-prevalent-diseases-livestock',
    MISC_NYK_TRAINING: 'misc-nyk-training',
    MISC_PPV_FRA_TRAINING: 'misc-ppv-fra-training',
    MISC_PPV_FRA_PLANT_VARIETIES: 'misc-ppv-fra-plant-varieties',
    MISC_RAWE_FET: 'misc-rawe-fet',
    MISC_VIP_VISITORS: 'misc-vip-visitors',

    // Performance Indicators - Impact
    PERFORMANCE_IMPACT_KVK_ACTIVITIES: 'performance-impact-kvk-activities',
    PERFORMANCE_IMPACT_ENTREPRENEURSHIP: 'performance-impact-entrepreneurship',
    PERFORMANCE_IMPACT_SUCCESS_STORIES: 'performance-impact-success-stories',

    // Performance Indicators - District & Village
    PERFORMANCE_DISTRICT_LEVEL: 'performance-district-level',
    PERFORMANCE_OPERATIONAL_AREA: 'performance-operational-area',
    PERFORMANCE_VILLAGE_ADOPTION: 'performance-village-adoption',
    PERFORMANCE_PRIORITY_THRUST: 'performance-priority-thrust',

    // Performance Indicators - Infrastructure
    PERFORMANCE_DEMONSTRATION_UNITS: 'performance-demonstration-units',
    PERFORMANCE_INSTRUCTIONAL_FARM_CROPS: 'performance-instructional-farm-crops',
    PERFORMANCE_PRODUCTION_UNITS: 'performance-production-units',
    PERFORMANCE_INSTRUCTIONAL_FARM_LIVESTOCK: 'performance-instructional-farm-livestock',
    PERFORMANCE_HOSTEL: 'performance-hostel',
    PERFORMANCE_STAFF_QUARTERS: 'performance-staff-quarters',
    PERFORMANCE_RAINWATER_HARVESTING: 'performance-rainwater-harvesting',

    // Performance Indicators - Financial
    PERFORMANCE_BUDGET_DETAILS: 'performance-budget-details',
    PERFORMANCE_PROJECT_BUDGET: 'performance-project-budget',
    PERFORMANCE_REVOLVING_FUND: 'performance-revolving-fund',
    PERFORMANCE_REVENUE_GENERATION: 'performance-revenue-generation',
    PERFORMANCE_RESOURCE_GENERATION: 'performance-resource-generation',

    // Performance Indicators - Linkages
    PERFORMANCE_FUNCTIONAL_LINKAGE: 'performance-functional-linkage',
    PERFORMANCE_SPECIAL_PROGRAMMES: 'performance-special-programmes',

    // Digital Information
    MISC_DIGITAL_MOBILE_APP: 'misc-digital-mobile-app',
    MISC_DIGITAL_WEB_PORTAL: 'misc-digital-web-portal',
    MISC_DIGITAL_KISAN_SARATHI: 'misc-digital-kisan-sarathi',
    MISC_DIGITAL_KISAN_MOBILE_ADVISORY: 'misc-digital-kisan-mobile-advisory',
    MISC_DIGITAL_OTHER_CHANNELS: 'misc-digital-other-channels',

    // Swachhta Bharat Abhiyaan
    MISC_SWACHHTA_SEWA: 'misc-swachhta-sewa',
    MISC_SWACHHTA_PAKHWADA: 'misc-swachhta-pakhwada',
    MISC_SWACHHTA_BUDGET: 'misc-swachhta-budget',

    // Meetings
    MISC_MEETINGS_SAC: 'misc-meetings-sac',
    MISC_MEETINGS_OTHER: 'misc-meetings-other',
} as const;

export type EntityTypeConstant = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

export const ENTITY_PATHS = {
    // Basic Masters
    ZONES: '/all-master/zones',
    STATES: '/all-master/states',
    DISTRICTS: '/all-master/districts',
    ORGANIZATIONS: '/all-master/organizations',
    UNIVERSITIES: '/all-master/universities',

    // OFT/FLD Masters
    OFT_SUBJECT: '/all-master/oft/subject',
    OFT_THEMATIC_AREA: '/all-master/oft/thematic-area',
    FLD_SECTOR: '/all-master/fld/sector',
    FLD_THEMATIC_AREA: '/all-master/fld/thematic-area',
    FLD_CATEGORY: '/all-master/fld/category',
    FLD_SUBCATEGORY: '/all-master/fld/sub-category',
    FLD_CROP: '/all-master/fld/crop',
    FLD_ACTIVITY: '/all-master/fld/activity',
    CFLD_CROP: '/all-master/cfld-crop',

    // Training, Extension & Events
    TRAINING_TYPE: '/all-master/training-type',
    TRAINING_AREA: '/all-master/training-area',
    TRAINING_THEMATIC: '/all-master/training-thematic',
    EXTENSION_ACTIVITY: '/all-master/extension-activity',
    OTHER_EXTENSION_ACTIVITY: '/all-master/other-extension-activity',
    EVENTS: '/all-master/events',

    // Production & Projects
    PRODUCT_CATEGORY: '/all-master/product-category',
    PRODUCT_TYPE: '/all-master/product-type',
    PRODUCT: '/all-master/product',
    CRA_CROPPING_SYSTEM: '/all-master/cra-croping-system',
    CRA_FARMING_SYSTEM: '/all-master/cra-farming-system',
    ARYA_ENTERPRISE: '/all-master/arya-enterprise',
    TSP_SCSP_TYPE: '/all-master/tsp-scsp-type',
    TSP_SCSP_ACTIVITY: '/all-master/tsp-scsp-activity',
    NATURAL_FARMING_ACTIVITY: '/all-master/natural-farming-activity',
    NATURAL_FARMING_SOIL_PARAMETER: '/all-master/natural-farming-soil-parameter',
    AGRI_DRONE_DEMONSTRATIONS_ON: '/all-master/agri-drone-demonstrations-on',

    // Publications
    PUBLICATION_ITEM: '/all-master/publication-item',

    // About KVK
    KVK_BANK_ACCOUNT: '/forms/about-kvk/bank-account',
    KVK_EMPLOYEES: '/forms/about-kvk/employee-details',
    KVK_STAFF_TRANSFERRED: '/forms/about-kvk/staff-transferred',
    KVK_INFRASTRUCTURE: '/forms/about-kvk/infrastructure',
    KVK_VEHICLES: '/forms/about-kvk/vehicles',
    KVK_VEHICLE_DETAILS: '/forms/about-kvk/vehicle-details',
    KVK_EQUIPMENTS: '/forms/about-kvk/equipments',
    KVK_EQUIPMENT_DETAILS: '/forms/about-kvk/equipment-details',
    KVK_FARM_IMPLEMENTS: '/forms/about-kvk/farm-implements',
    KVK_DETAILS: '/forms/about-kvk/details',
    KVK_VIEW: '/forms/about-kvk/view-kvks',
    KVK_VIEW_DETAILS: '/forms/about-kvk/view-kvks/:id',
    KVK_VIEW_BANK: '/forms/about-kvk/view-kvks/:id/bank',
    KVK_VIEW_EMPLOYEES: '/forms/about-kvk/view-kvks/:id/employees',
    KVK_VIEW_VEHICLES: '/forms/about-kvk/view-kvks/:id/vehicles',
    KVK_VIEW_EQUIPMENTS: '/forms/about-kvk/view-kvks/:id/equipments',

    // Other Masters
    SEASON: '/all-master/season',
    SANCTIONED_POST: '/all-master/sanctioned-post',
    YEAR: '/all-master/year',
    OTHER_MASTERS: '/all-master/other-masters',

    // Employee Masters
    STAFF_CATEGORY: '/all-master/staff-category',
    PAY_LEVEL: '/all-master/pay-level',
    DISCIPLINE: '/all-master/discipline',

    // Extension Masters
    EXTENSION_ACTIVITY_TYPE: '/all-master/extension-activity-type',
    OTHER_EXTENSION_ACTIVITY_TYPE: '/all-master/other-extension-activity-type',
    IMPORTANT_DAY: '/all-master/important-day',

    // Training Masters
    TRAINING_CLIENTELE: '/all-master/training-clientele',
    FUNDING_SOURCE: '/all-master/funding-source',

    // Other Masters (continued)
    CROP_TYPE: '/all-master/crop-type',
    INFRASTRUCTURE_MASTER: '/all-master/infrastructure-master',
    SOIL_WATER_ANALYSIS: '/all-master/soil-water-analysis',
    NARI_ACTIVITY: '/all-master/nari-activity',
    NARI_CROP_CATEGORY: '/all-master/nari-crop-category',
    NARI_NUTRITION_GARDEN_TYPE: '/all-master/nari-nutrition-garden-type',
    NICRA_CATEGORY: '/all-master/nicra-category',
    NICRA_SUB_CATEGORY: '/all-master/nicra-sub-category',
    NICRA_SEED_BANK_FODDER_BANK: '/all-master/nicra-seed-bank-fodder-bank',
    NICRA_DIGNITARY_TYPE: '/all-master/nicra-dignitary-type',
    NICRA_PI_TYPE: '/all-master/nicra-pi-type',

    // Subcategory paths (for navigation)
    BASIC_MASTERS: '/all-master/basic',
    OFT_FLD_MASTERS: '/all-master/oft-fld',
    TRAINING_EXTENSION_MASTERS: '/all-master/training-extension',
    TRAINING_MASTERS: '/all-master/training-masters',
    EXTENSION_MASTERS: '/all-master/extension-masters',
    EMPLOYEE_MASTERS: '/all-master/employee-masters',
    PRODUCTION_PROJECTS_MASTERS: '/all-master/production-projects',
    PUBLICATIONS_MASTERS: '/all-master/publications',
} as const;
