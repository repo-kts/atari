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
    CFLD_CROPS: 'cfld-crops',
    SEASONS: 'seasons',

    // Other Masters
    SEASON: 'season',
    SANCTIONED_POST: 'sanctioned-post',
    YEAR: 'year',

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
    KVKS: 'kvks'
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

    // Subcategory paths (for navigation)
    BASIC_MASTERS: '/all-master/basic',
    OFT_FLD_MASTERS: '/all-master/oft-fld',
    TRAINING_EXTENSION_MASTERS: '/all-master/training-extension',
    PRODUCTION_PROJECTS_MASTERS: '/all-master/production-projects',
    PUBLICATIONS_MASTERS: '/all-master/publications',
} as const;
