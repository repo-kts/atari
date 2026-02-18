// Route configuration for all forms and pages
// This centralizes all route definitions to avoid bloating App.tsx
import { ENTITY_PATHS } from '../constants/entityTypes'
import { UserRole } from '../types/auth'


export interface RouteConfig {
    path: string
    title: string
    description?: string
    category: string
    subcategory?: string
    parent?: string
    // Optional path for the subcategory breadcrumb (e.g. Basic Masters tab)
    subcategoryPath?: string
    // Paths of sibling routes for tab navigation
    siblings?: string[]
    // Optional field configuration for generic master views
    fields?: string[]
    // Authorization: which roles can create new items (undefined = all roles can create)
    canCreate?: UserRole[] | 'none'
    // Optional component to render instead of DataManagementView
    component?: React.ComponentType<any>
    // Optional mock data for prototyping
    mockData?: any[]
}

// Sibling groups for All Masters
const basicMastersPaths = [
    ENTITY_PATHS.ZONES,
    ENTITY_PATHS.STATES,
    ENTITY_PATHS.DISTRICTS,
    ENTITY_PATHS.ORGANIZATIONS,
    ENTITY_PATHS.UNIVERSITIES,
]

// OFT Masters group
const oftMastersPaths = [
    ENTITY_PATHS.OFT_SUBJECT,
    ENTITY_PATHS.OFT_THEMATIC_AREA,
]

// FLD Masters group
const fldMastersPaths = [
    ENTITY_PATHS.FLD_SECTOR,
    ENTITY_PATHS.FLD_THEMATIC_AREA,
    ENTITY_PATHS.FLD_CATEGORY,
    ENTITY_PATHS.FLD_SUBCATEGORY,
    ENTITY_PATHS.FLD_CROP,
]

// CFLD Masters group
const cfldMastersPaths = [
    ENTITY_PATHS.CFLD_CROP,
]

const trainingExtensionMastersPaths = [
    ENTITY_PATHS.TRAINING_TYPE,
    ENTITY_PATHS.TRAINING_AREA,
    ENTITY_PATHS.TRAINING_THEMATIC,
    ENTITY_PATHS.EXTENSION_ACTIVITY,
    ENTITY_PATHS.OTHER_EXTENSION_ACTIVITY,
    ENTITY_PATHS.EVENTS,
]

const productionProjectsMastersPaths = [
    ENTITY_PATHS.PRODUCT_CATEGORY,
    ENTITY_PATHS.PRODUCT_TYPE,
    ENTITY_PATHS.PRODUCT,
    ENTITY_PATHS.CRA_CROPPING_SYSTEM,
    ENTITY_PATHS.CRA_FARMING_SYSTEM,
    ENTITY_PATHS.ARYA_ENTERPRISE,
]

const otherMasterSiblings = [
    ENTITY_PATHS.SEASON,
    ENTITY_PATHS.SANCTIONED_POST,
    ENTITY_PATHS.YEAR,
]

// All Masters Routes
export const allMastersRoutes: RouteConfig[] = [
    // Basic Masters
    {
        path: ENTITY_PATHS.ZONES,
        title: 'Zone Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: basicMastersPaths,
        fields: ['zoneName'],
    },
    {
        path: ENTITY_PATHS.STATES,
        title: 'State Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: basicMastersPaths,
        fields: ['zoneName', 'stateName'],
    },
    {
        path: ENTITY_PATHS.ORGANIZATIONS,
        title: 'Organization Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: basicMastersPaths,
        fields: ['zoneName', 'stateName', 'districtName', 'orgName'],
    },
    {
        path: ENTITY_PATHS.UNIVERSITIES,
        title: 'University Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: basicMastersPaths,
        fields: ['organization.orgName', 'universityName'],
    },
    {
        path: ENTITY_PATHS.DISTRICTS,
        title: 'District Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.BASIC_MASTERS,
        siblings: basicMastersPaths,
        fields: ['zoneName', 'stateName', 'districtName'],
    },

    // OFT Masters
    {
        path: ENTITY_PATHS.OFT_SUBJECT,
        title: 'Subject Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: oftMastersPaths,
        fields: ['subjectName', 'thematicAreasCount'],
    },
    {
        path: ENTITY_PATHS.OFT_THEMATIC_AREA,
        title: 'OFT Thematic Area Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: oftMastersPaths,
        fields: ['thematicAreaName', 'subjectName'],
    },

    // FLD Masters
    {
        path: ENTITY_PATHS.FLD_SECTOR,
        title: 'Sector Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: fldMastersPaths,
        fields: ['sectorName', 'categoriesCount'],
    },
    {
        path: ENTITY_PATHS.FLD_THEMATIC_AREA,
        title: 'FLD Thematic Area Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: fldMastersPaths,
        fields: ['thematicAreaName', 'sectorName'],
    },
    {
        path: ENTITY_PATHS.FLD_CATEGORY,
        title: 'Category Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: fldMastersPaths,
        fields: ['categoryName', 'sectorName', 'subCategoriesCount'],
    },
    {
        path: ENTITY_PATHS.FLD_SUBCATEGORY,
        title: 'Sub-category Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: fldMastersPaths,
        fields: ['subCategoryName', 'categoryName', 'sectorName', 'cropsCount'],
    },
    {
        path: ENTITY_PATHS.FLD_CROP,
        title: 'Crop Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: fldMastersPaths,
        fields: ['cropName', 'subCategoryName', 'categoryName'],
    },

    // CFLD Masters
    {
        path: ENTITY_PATHS.CFLD_CROP,
        title: 'CFLD Crop Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: cfldMastersPaths,
        fields: ['seasonName', 'cropTypeName', 'cropName'],
    },


    // Training Master
    {
        path: ENTITY_PATHS.TRAINING_TYPE,
        title: 'Training Type Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: trainingExtensionMastersPaths,
        fields: ['trainingType'],
    },
    {
        path: ENTITY_PATHS.TRAINING_AREA,
        title: 'Training Area Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: trainingExtensionMastersPaths,
        fields: ['trainingType', 'trainingAreaName'],
    },
    {
        path: ENTITY_PATHS.TRAINING_THEMATIC,
        title: 'Training Thematic Area Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: trainingExtensionMastersPaths,
        fields: ['trainingAreaName', 'trainingThematicArea'],
    },

    // Extension & Events
    {
        path: ENTITY_PATHS.EXTENSION_ACTIVITY,
        title: 'Extension Activity Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: trainingExtensionMastersPaths,
        fields: ['name'],
    },
    {
        path: ENTITY_PATHS.OTHER_EXTENSION_ACTIVITY,
        title: 'Other Extension Activity Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: trainingExtensionMastersPaths,
        fields: ['name'],
    },
    {
        path: ENTITY_PATHS.EVENTS,
        title: 'Events Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: trainingExtensionMastersPaths,
        fields: ['eventName'],
    },

    // Production
    {
        path: ENTITY_PATHS.PRODUCT_CATEGORY,
        title: 'Product Category Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: productionProjectsMastersPaths,
        fields: ['productCategoryName'],
    },
    {
        path: ENTITY_PATHS.PRODUCT_TYPE,
        title: 'Product Type Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: productionProjectsMastersPaths,
        fields: ['productCategoryName', 'productCategoryType'],
    },
    {
        path: ENTITY_PATHS.PRODUCT,
        title: 'Products Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: productionProjectsMastersPaths,
        fields: ['productCategoryName', 'productCategoryType', 'productName'],
    },

    // CRA
    {
        path: ENTITY_PATHS.CRA_CROPPING_SYSTEM,
        title: 'Cropping System Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: productionProjectsMastersPaths,
        fields: ['seasonName', 'cropName'],
    },
    {
        path: ENTITY_PATHS.CRA_FARMING_SYSTEM,
        title: 'Farming System Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: productionProjectsMastersPaths,
        fields: ['seasonName', 'farmingSystemName'],
    },

    // ARYA
    {
        path: ENTITY_PATHS.ARYA_ENTERPRISE,
        title: 'ARYA Enterprise Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: productionProjectsMastersPaths,
        fields: ['enterpriseName'],
    },

    // Publications
    {
        path: ENTITY_PATHS.PUBLICATION_ITEM,
        title: 'Publication Items Master',
        category: 'All Masters',
        subcategory: 'Publications Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PUBLICATIONS_MASTERS,
        siblings: [ENTITY_PATHS.PUBLICATION_ITEM],
        fields: ['publicationItem'],
    },

    // Other Masters
    {
        path: ENTITY_PATHS.SEASON,
        title: 'Season Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: otherMasterSiblings,
        fields: ['seasonName'],
    },
    {
        path: ENTITY_PATHS.SANCTIONED_POST,
        title: 'Sanctioned Post Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: otherMasterSiblings,
        fields: ['sanctionedPostName'],
    },
    {
        path: ENTITY_PATHS.YEAR,
        title: 'Year Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: otherMasterSiblings,
        fields: ['yearName'],
    },
]

// FORMS
// About KVK Routes
export const aboutKvkRoutes: RouteConfig[] = [
    // View KVKs
    {
        path: ENTITY_PATHS.KVK_VIEW,
        title: 'View KVKs',
        description: 'View and manage all KVKs',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        fields: ['zoneName', 'stateName', 'organizationName', 'districtName', 'kvkName', 'mobile', 'email', 'address', 'yearOfSanction'],
        canCreate: ['super_admin'], // Only super_admin can create KVKs
    },
    {
        path: ENTITY_PATHS.KVK_BANK_ACCOUNT,
        title: 'Bank Account Details',
        description: 'Manage bank account information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_BANK_ACCOUNT,
            ENTITY_PATHS.KVK_EMPLOYEES,
            ENTITY_PATHS.KVK_STAFF_TRANSFERRED,
            ENTITY_PATHS.KVK_INFRASTRUCTURE,
        ],
        fields: ['kvk', 'accountType', 'accountName', 'bankName', 'location', 'accountNumber'],
        canCreate: ['kvk'],
    },
    {
        path: ENTITY_PATHS.KVK_EMPLOYEES,
        title: 'Employee Details',
        description: 'Manage employee and staff information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_BANK_ACCOUNT,
            ENTITY_PATHS.KVK_EMPLOYEES,
            ENTITY_PATHS.KVK_STAFF_TRANSFERRED,
            ENTITY_PATHS.KVK_INFRASTRUCTURE,
        ],
        fields: ['kvkName', 'photo', 'resume', 'staffName', 'position', 'mobile', 'email', 'sanctionedPost', 'payScale', 'dateOfJoining', 'jobType', 'detailsOfAllowences', 'category', 'transferStatus'],
        canCreate: ['kvk'],
    },
    {
        path: ENTITY_PATHS.KVK_STAFF_TRANSFERRED,
        title: 'Staff Transferred',
        description: 'Manage transferred staff records',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_BANK_ACCOUNT,
            ENTITY_PATHS.KVK_EMPLOYEES,
            ENTITY_PATHS.KVK_STAFF_TRANSFERRED,
            ENTITY_PATHS.KVK_INFRASTRUCTURE,
        ],
        fields: ['staffName', 'kvkNameBeforeTransfer', 'latestKvkName'],
        canCreate: 'none',
    },
    {
        path: ENTITY_PATHS.KVK_INFRASTRUCTURE,
        title: 'Infrastructure Details',
        description: 'Manage infrastructure information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_BANK_ACCOUNT,
            ENTITY_PATHS.KVK_EMPLOYEES,
            ENTITY_PATHS.KVK_STAFF_TRANSFERRED,
            ENTITY_PATHS.KVK_INFRASTRUCTURE,
        ],
        fields: ['kvk', 'infraMasterName', 'notYetStarted', 'completedPlinthLevel', 'completedLintelLevel', 'completedRoofLevel', 'totallyCompleted', 'plinthAreaSqM', 'underUse', 'sourceOfFunding'],
        canCreate: ['kvk'],
    },

    // Vehicles - siblings
    {
        path: ENTITY_PATHS.KVK_VEHICLES,
        title: 'View Vehicles',
        description: 'View all vehicles',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_VEHICLES,
            ENTITY_PATHS.KVK_VEHICLE_DETAILS,
        ],
        fields: ['vehicleName', 'registrationNo', 'yearOfPurchase', 'totalCost', 'totalRun', 'presentStatus'],
        canCreate: ['kvk'],
    },
    {
        path: ENTITY_PATHS.KVK_VEHICLE_DETAILS,
        title: 'Vehicle Details',
        description: 'View vehicle maintenance details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_VEHICLES,
            ENTITY_PATHS.KVK_VEHICLE_DETAILS,
        ],
        fields: ['kvkName', 'vehicleName', 'registrationNumber', 'yearOfPurchase', 'totalCost (Rs.)', 'totalRun (Kms)', 'reportingYear', 'presentStatus'],
        canCreate: ['kvk'],
    },
    // Equipments - siblings
    {
        path: ENTITY_PATHS.KVK_EQUIPMENTS,
        title: 'View Equipments',
        description: 'View all equipments',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_EQUIPMENTS,
            ENTITY_PATHS.KVK_EQUIPMENT_DETAILS,
        ],
        fields: ['kvkName', 'equipmentName', 'yearOfPurchase', 'totalCost (Rs)', 'presentStatus', 'sourceOfFund'],
        canCreate: ['kvk'],
    },
    {
        path: ENTITY_PATHS.KVK_EQUIPMENT_DETAILS,
        title: 'Equipment Details',
        description: 'Manage equipment details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_EQUIPMENTS,
            ENTITY_PATHS.KVK_EQUIPMENT_DETAILS,
        ],
        fields: ['kvkName', 'equipmentName', 'yearOfPurchase', 'totalCost (Rs)', 'reportingYear', 'presentStatus', 'sourceOfFund'],
        canCreate: ['kvk'],
    },
    // Farm Implements
    {
        path: ENTITY_PATHS.KVK_FARM_IMPLEMENTS,
        title: 'Farm Implement Details',
        description: 'Manage farm implement details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        fields: ['kvkName', 'implementName', 'yearOfPurchase', 'totalCost (Rs)', 'presentStatus', 'sourceOfFund'],
        canCreate: ['kvk'],
    },
    // Add Staff (sub-route) - REMOVED placeholder

]

// View KVK Routes (Admin)
export const viewKvkRoutes: RouteConfig[] = [
    {
        path: ENTITY_PATHS.KVK_VIEW,
        title: 'View KVKs',
        description: 'View and manage all KVKs',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
    },
    {
        path: ENTITY_PATHS.KVK_VIEW_DETAILS,
        title: 'KVK Information',
        description: 'View detailed KVK information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ENTITY_PATHS.KVK_VIEW,
        siblings: [
            '/forms/about-kvk/view-kvks/:id',
            '/forms/about-kvk/view-kvks/:id/bank',
            '/forms/about-kvk/view-kvks/:id/employees',
            '/forms/about-kvk/view-kvks/:id/vehicles',
            '/forms/about-kvk/view-kvks/:id/equipments',
        ],
    },
    {
        path: '/forms/about-kvk/view-kvks/:id/bank',
        title: 'Bank Accounts',
        description: 'View bank account details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ENTITY_PATHS.KVK_VIEW_DETAILS,
        siblings: [
            '/forms/about-kvk/view-kvks/:id',
            '/forms/about-kvk/view-kvks/:id/bank',
            '/forms/about-kvk/view-kvks/:id/employees',
            '/forms/about-kvk/view-kvks/:id/vehicles',
            '/forms/about-kvk/view-kvks/:id/equipments',
        ],
    },
    {
        path: '/forms/about-kvk/view-kvks/:id/employees',
        title: 'Employees',
        description: 'View employee details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ENTITY_PATHS.KVK_VIEW_DETAILS,
        siblings: [
            '/forms/about-kvk/view-kvks/:id',
            '/forms/about-kvk/view-kvks/:id/bank',
            '/forms/about-kvk/view-kvks/:id/employees',
            '/forms/about-kvk/view-kvks/:id/vehicles',
            '/forms/about-kvk/view-kvks/:id/equipments',
        ],
    },
    {
        path: '/forms/about-kvk/view-kvks/:id/vehicles',
        title: 'Vehicles',
        description: 'Vehicle details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ENTITY_PATHS.KVK_VIEW_DETAILS,
        siblings: [
            '/forms/about-kvk/view-kvks/:id',
            '/forms/about-kvk/view-kvks/:id/bank',
            '/forms/about-kvk/view-kvks/:id/employees',
            '/forms/about-kvk/view-kvks/:id/vehicles',
            '/forms/about-kvk/view-kvks/:id/equipments',
        ],
    },
    {
        path: '/forms/about-kvk/view-kvks/:id/equipments',
        title: 'Equipments',
        description: 'Equipment details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ENTITY_PATHS.KVK_VIEW_DETAILS,
        siblings: [
            '/forms/about-kvk/view-kvks/:id',
            '/forms/about-kvk/view-kvks/:id/bank',
            '/forms/about-kvk/view-kvks/:id/employees',
            '/forms/about-kvk/view-kvks/:id/vehicles',
            '/forms/about-kvk/view-kvks/:id/equipments',
        ],
    },
]

// Projects Routes - under Achievements
export const projectsRoutes: RouteConfig[] = [
    // CFLD
    {
        path: '/forms/achievements/projects/cfld/technical-parameter',
        title: 'Technical Parameter',
        description: 'CFLD Technical Parameters',
        category: 'Projects',
        subcategory: 'CFLD',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/cfld/technical-parameter',
            '/forms/achievements/projects/cfld/extension-activity',
            '/forms/achievements/projects/cfld/budget-utilization'
        ]
    },
    {
        path: '/forms/achievements/projects/cfld/extension-activity',
        title: 'Extension Activity',
        description: 'CFLD Extension Activities',
        category: 'Projects',
        subcategory: 'CFLD',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/cfld/technical-parameter',
            '/forms/achievements/projects/cfld/extension-activity',
            '/forms/achievements/projects/cfld/budget-utilization'
        ]
    },
    {
        path: '/forms/achievements/projects/cfld/budget-utilization',
        title: 'Budget Utilization',
        description: 'CFLD Budget Utilization',
        category: 'Projects',
        subcategory: 'CFLD',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/cfld/technical-parameter',
            '/forms/achievements/projects/cfld/extension-activity',
            '/forms/achievements/projects/cfld/budget-utilization'
        ]
    },

    // CRA
    {
        path: '/forms/achievements/projects/cra/details',
        title: 'CRA Details',
        description: 'Climate Resilient Agriculture Details',
        category: 'Projects',
        subcategory: 'CRA',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/cra/details',
            '/forms/achievements/projects/cra/extension-activity'
        ]
    },
    {
        path: '/forms/achievements/projects/cra/extension-activity',
        title: 'Extension Activity',
        description: 'CRA Extension Activities',
        category: 'Projects',
        subcategory: 'CRA',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/cra/details',
            '/forms/achievements/projects/cra/extension-activity'
        ]
    },

    // FPO
    {
        path: '/forms/achievements/projects/fpo/details',
        title: 'FPO Details',
        description: 'FPO and CBBO Details',
        category: 'Projects',
        subcategory: 'FPO',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/fpo/details',
            '/forms/achievements/projects/fpo/management'
        ]
    },
    {
        path: '/forms/achievements/projects/fpo/management',
        title: 'FPO Management',
        description: 'FPO Management',
        category: 'Projects',
        subcategory: 'FPO',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/fpo/details',
            '/forms/achievements/projects/fpo/management'
        ]
    },

    // DRMR
    {
        path: '/forms/achievements/projects/drmr/details',
        title: 'DRMR Details',
        description: 'DRMR Program Details',
        category: 'Projects',
        subcategory: 'DRMR',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/drmr/details',
            '/forms/achievements/projects/drmr/activity'
        ]
    },
    {
        path: '/forms/achievements/projects/drmr/activity',
        title: 'DRMR Activity',
        description: 'DRMR Activities',
        category: 'Projects',
        subcategory: 'DRMR',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/drmr/details',
            '/forms/achievements/projects/drmr/activity'
        ]
    },

    // NARI
    {
        path: '/forms/achievements/projects/nari/nutri-smart',
        title: 'Nutrition Garden',
        description: 'Details of Nutrition Garden in Nutri-Smart village',
        category: 'Projects',
        subcategory: 'NARI',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nari/nutri-smart',
            '/forms/achievements/projects/nari/bio-fortified',
            '/forms/achievements/projects/nari/value-addition',
            '/forms/achievements/projects/nari/training-programm',
            '/forms/achievements/projects/nari/extension-activities'
        ]
    },
    {
        path: '/forms/achievements/projects/nari/bio-fortified',
        title: 'Bio-fortified Crops',
        description: 'Details of Bio-fortified crops',
        category: 'Projects',
        subcategory: 'NARI',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nari/nutri-smart',
            '/forms/achievements/projects/nari/bio-fortified',
            '/forms/achievements/projects/nari/value-addition',
            '/forms/achievements/projects/nari/training-programm',
            '/forms/achievements/projects/nari/extension-activities'
        ]
    },
    {
        path: '/forms/achievements/projects/nari/value-addition',
        title: 'Value Addition',
        description: 'Details of Value addition',
        category: 'Projects',
        subcategory: 'NARI',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nari/nutri-smart',
            '/forms/achievements/projects/nari/bio-fortified',
            '/forms/achievements/projects/nari/value-addition',
            '/forms/achievements/projects/nari/training-programm',
            '/forms/achievements/projects/nari/extension-activities'
        ]
    },
    {
        path: '/forms/achievements/projects/nari/training-programm',
        title: 'Training Programmes',
        description: 'Training programmes in Nutri-Smart village',
        category: 'Projects',
        subcategory: 'NARI',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nari/nutri-smart',
            '/forms/achievements/projects/nari/bio-fortified',
            '/forms/achievements/projects/nari/value-addition',
            '/forms/achievements/projects/nari/training-programm',
            '/forms/achievements/projects/nari/extension-activities'
        ]
    },
    {
        path: '/forms/achievements/projects/nari/extension-activities',
        title: 'Extension Activities',
        description: 'Extension activities under NARI',
        category: 'Projects',
        subcategory: 'NARI',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nari/nutri-smart',
            '/forms/achievements/projects/nari/bio-fortified',
            '/forms/achievements/projects/nari/value-addition',
            '/forms/achievements/projects/nari/training-programm',
            '/forms/achievements/projects/nari/extension-activities'
        ]
    },

    // ARYA
    {
        path: '/forms/achievements/projects/arya',
        title: 'Current Year',
        description: 'ARYA Current Year Details',
        category: 'Projects',
        subcategory: 'ARYA',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/arya',
            '/forms/achievements/projects/arya-evaluation'
        ]
    },
    {
        path: '/forms/achievements/projects/arya-evaluation',
        title: 'Previous Year',
        description: 'ARYA Previous Year Evaluation',
        category: 'Projects',
        subcategory: 'ARYA',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/arya',
            '/forms/achievements/projects/arya-evaluation'
        ]
    },

    // Direct links (no siblings)
    {
        path: '/forms/achievements/projects/csisa',
        title: 'CSISA Details',
        description: 'Cereal Systems Initiative for South Asia',
        category: 'Projects',
        subcategory: 'CSISA',
        parent: '/forms/achievements/projects'
    },
    {
        path: '/forms/achievements/projects/sub-plan-activity',
        title: 'TSP/SCSP',
        description: 'Tribal Sub Plan / Scheduled Caste Sub Plan',
        category: 'Projects',
        subcategory: 'TSP/SCSP',
        parent: '/forms/achievements/projects'
    },

    // NICRA
    {
        path: '/forms/achievements/projects/nicra/basic-information',
        title: 'Basic Information',
        description: 'NICRA Basic Information',
        category: 'Projects',
        subcategory: 'NICRA',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nicra/basic-information',
            '/forms/achievements/projects/nicra/details',
            '/forms/achievements/projects/nicra/training',
            '/forms/achievements/projects/nicra/extension-activity'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/details',
        title: 'Details',
        description: 'NICRA Details',
        category: 'Projects',
        subcategory: 'NICRA',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nicra/basic-information',
            '/forms/achievements/projects/nicra/details',
            '/forms/achievements/projects/nicra/training',
            '/forms/achievements/projects/nicra/extension-activity'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/training',
        title: 'Training',
        description: 'NICRA Training',
        category: 'Projects',
        subcategory: 'NICRA',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nicra/basic-information',
            '/forms/achievements/projects/nicra/details',
            '/forms/achievements/projects/nicra/training',
            '/forms/achievements/projects/nicra/extension-activity'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/extension-activity',
        title: 'Extension Activity',
        description: 'NICRA Extension Activity',
        category: 'Projects',
        subcategory: 'NICRA',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/nicra/basic-information',
            '/forms/achievements/projects/nicra/details',
            '/forms/achievements/projects/nicra/training',
            '/forms/achievements/projects/nicra/extension-activity'
        ]
    },

    // NICRA Others
    {
        path: '/forms/achievements/projects/nicra/others/intervention',
        title: 'Intervention',
        description: 'NICRA Others - Intervention',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: '/forms/achievements/projects/nicra',
        siblings: [
            '/forms/achievements/projects/nicra/others/intervention',
            '/forms/achievements/projects/nicra/others/revenue-generated',
            '/forms/achievements/projects/nicra/others/custom-hiring',
            '/forms/achievements/projects/nicra/others/vcrmc',
            '/forms/achievements/projects/nicra/others/soil-health-card',
            '/forms/achievements/projects/nicra/others/convergence-programme',
            '/forms/achievements/projects/nicra/others/dignitaries-visited',
            '/forms/achievements/projects/nicra/others/pi-copi-list'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/others/revenue-generated',
        title: 'Revenue Generated',
        description: 'NICRA Others - Revenue Generated',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: '/forms/achievements/projects/nicra',
        siblings: [
            '/forms/achievements/projects/nicra/others/intervention',
            '/forms/achievements/projects/nicra/others/revenue-generated',
            '/forms/achievements/projects/nicra/others/custom-hiring',
            '/forms/achievements/projects/nicra/others/vcrmc',
            '/forms/achievements/projects/nicra/others/soil-health-card',
            '/forms/achievements/projects/nicra/others/convergence-programme',
            '/forms/achievements/projects/nicra/others/dignitaries-visited',
            '/forms/achievements/projects/nicra/others/pi-copi-list'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/others/custom-hiring',
        title: 'Custom Hiring',
        description: 'NICRA Others - Custom Hiring of Farm-Implement',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: '/forms/achievements/projects/nicra',
        siblings: [
            '/forms/achievements/projects/nicra/others/intervention',
            '/forms/achievements/projects/nicra/others/revenue-generated',
            '/forms/achievements/projects/nicra/others/custom-hiring',
            '/forms/achievements/projects/nicra/others/vcrmc',
            '/forms/achievements/projects/nicra/others/soil-health-card',
            '/forms/achievements/projects/nicra/others/convergence-programme',
            '/forms/achievements/projects/nicra/others/dignitaries-visited',
            '/forms/achievements/projects/nicra/others/pi-copi-list'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/others/vcrmc',
        title: 'Village VCRMC',
        description: 'NICRA Others - Village wise VCRMC',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: '/forms/achievements/projects/nicra',
        siblings: [
            '/forms/achievements/projects/nicra/others/intervention',
            '/forms/achievements/projects/nicra/others/revenue-generated',
            '/forms/achievements/projects/nicra/others/custom-hiring',
            '/forms/achievements/projects/nicra/others/vcrmc',
            '/forms/achievements/projects/nicra/others/soil-health-card',
            '/forms/achievements/projects/nicra/others/convergence-programme',
            '/forms/achievements/projects/nicra/others/dignitaries-visited',
            '/forms/achievements/projects/nicra/others/pi-copi-list'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/others/soil-health-card',
        title: 'Soil Health Card',
        description: 'NICRA Others - Soil Health Card',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: '/forms/achievements/projects/nicra',
        siblings: [
            '/forms/achievements/projects/nicra/others/intervention',
            '/forms/achievements/projects/nicra/others/revenue-generated',
            '/forms/achievements/projects/nicra/others/custom-hiring',
            '/forms/achievements/projects/nicra/others/vcrmc',
            '/forms/achievements/projects/nicra/others/soil-health-card',
            '/forms/achievements/projects/nicra/others/convergence-programme',
            '/forms/achievements/projects/nicra/others/dignitaries-visited',
            '/forms/achievements/projects/nicra/others/pi-copi-list'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/others/convergence-programme',
        title: 'Convergence',
        description: 'NICRA Others - Convergence Programme',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: '/forms/achievements/projects/nicra',
        siblings: [
            '/forms/achievements/projects/nicra/others/intervention',
            '/forms/achievements/projects/nicra/others/revenue-generated',
            '/forms/achievements/projects/nicra/others/custom-hiring',
            '/forms/achievements/projects/nicra/others/vcrmc',
            '/forms/achievements/projects/nicra/others/soil-health-card',
            '/forms/achievements/projects/nicra/others/convergence-programme',
            '/forms/achievements/projects/nicra/others/dignitaries-visited',
            '/forms/achievements/projects/nicra/others/pi-copi-list'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/others/dignitaries-visited',
        title: 'Dignitaries',
        description: 'NICRA Others - Dignitaries Visited',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: '/forms/achievements/projects/nicra',
        siblings: [
            '/forms/achievements/projects/nicra/others/intervention',
            '/forms/achievements/projects/nicra/others/revenue-generated',
            '/forms/achievements/projects/nicra/others/custom-hiring',
            '/forms/achievements/projects/nicra/others/vcrmc',
            '/forms/achievements/projects/nicra/others/soil-health-card',
            '/forms/achievements/projects/nicra/others/convergence-programme',
            '/forms/achievements/projects/nicra/others/dignitaries-visited',
            '/forms/achievements/projects/nicra/others/pi-copi-list'
        ]
    },
    {
        path: '/forms/achievements/projects/nicra/others/pi-copi-list',
        title: 'PI & Co-PI',
        description: 'NICRA Others - PI & Co-PI List',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: '/forms/achievements/projects/nicra',
        siblings: [
            '/forms/achievements/projects/nicra/others/intervention',
            '/forms/achievements/projects/nicra/others/revenue-generated',
            '/forms/achievements/projects/nicra/others/custom-hiring',
            '/forms/achievements/projects/nicra/others/vcrmc',
            '/forms/achievements/projects/nicra/others/soil-health-card',
            '/forms/achievements/projects/nicra/others/convergence-programme',
            '/forms/achievements/projects/nicra/others/dignitaries-visited',
            '/forms/achievements/projects/nicra/others/pi-copi-list'
        ]
    },

    // Natural Farming
    {
        path: '/forms/achievements/projects/natural-farming/geographical-information',
        title: 'Geographical',
        description: 'Geographical Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/natural-farming/geographical-information',
            '/forms/achievements/projects/natural-farming/physical-information',
            '/forms/achievements/projects/natural-farming/demonstration-information',
            '/forms/achievements/projects/natural-farming/farmers-practicing',
            '/forms/achievements/projects/natural-farming/beneficiaries',
            '/forms/achievements/projects/natural-farming/soil-data',
            '/forms/achievements/projects/natural-farming/budget-expenditure'
        ]
    },
    {
        path: '/forms/achievements/projects/natural-farming/physical-information',
        title: 'Physical',
        description: 'Physical Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/natural-farming/geographical-information',
            '/forms/achievements/projects/natural-farming/physical-information',
            '/forms/achievements/projects/natural-farming/demonstration-information',
            '/forms/achievements/projects/natural-farming/farmers-practicing',
            '/forms/achievements/projects/natural-farming/beneficiaries',
            '/forms/achievements/projects/natural-farming/soil-data',
            '/forms/achievements/projects/natural-farming/budget-expenditure'
        ]
    },
    {
        path: '/forms/achievements/projects/natural-farming/demonstration-information',
        title: 'Demonstration',
        description: 'Demonstration Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/natural-farming/geographical-information',
            '/forms/achievements/projects/natural-farming/physical-information',
            '/forms/achievements/projects/natural-farming/demonstration-information',
            '/forms/achievements/projects/natural-farming/farmers-practicing',
            '/forms/achievements/projects/natural-farming/beneficiaries',
            '/forms/achievements/projects/natural-farming/soil-data',
            '/forms/achievements/projects/natural-farming/budget-expenditure'
        ]
    },
    {
        path: '/forms/achievements/projects/natural-farming/farmers-practicing',
        title: 'Farmers Practicing',
        description: 'Farmers Already Practicing Natural Farming',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/natural-farming/geographical-information',
            '/forms/achievements/projects/natural-farming/physical-information',
            '/forms/achievements/projects/natural-farming/demonstration-information',
            '/forms/achievements/projects/natural-farming/farmers-practicing',
            '/forms/achievements/projects/natural-farming/beneficiaries',
            '/forms/achievements/projects/natural-farming/soil-data',
            '/forms/achievements/projects/natural-farming/budget-expenditure'
        ]
    },
    {
        path: '/forms/achievements/projects/natural-farming/beneficiaries',
        title: 'Beneficiaries',
        description: 'Details of Beneficiaries',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/natural-farming/geographical-information',
            '/forms/achievements/projects/natural-farming/physical-information',
            '/forms/achievements/projects/natural-farming/demonstration-information',
            '/forms/achievements/projects/natural-farming/farmers-practicing',
            '/forms/achievements/projects/natural-farming/beneficiaries',
            '/forms/achievements/projects/natural-farming/soil-data',
            '/forms/achievements/projects/natural-farming/budget-expenditure'
        ]
    },
    {
        path: '/forms/achievements/projects/natural-farming/soil-data',
        title: 'Soil Data',
        description: 'Soil Data Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/natural-farming/geographical-information',
            '/forms/achievements/projects/natural-farming/physical-information',
            '/forms/achievements/projects/natural-farming/demonstration-information',
            '/forms/achievements/projects/natural-farming/farmers-practicing',
            '/forms/achievements/projects/natural-farming/beneficiaries',
            '/forms/achievements/projects/natural-farming/soil-data',
            '/forms/achievements/projects/natural-farming/budget-expenditure'
        ]
    },
    {
        path: '/forms/achievements/projects/natural-farming/budget-expenditure',
        title: 'Budget',
        description: 'Budget Expenditure',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/natural-farming/geographical-information',
            '/forms/achievements/projects/natural-farming/physical-information',
            '/forms/achievements/projects/natural-farming/demonstration-information',
            '/forms/achievements/projects/natural-farming/farmers-practicing',
            '/forms/achievements/projects/natural-farming/beneficiaries',
            '/forms/achievements/projects/natural-farming/soil-data',
            '/forms/achievements/projects/natural-farming/budget-expenditure'
        ]
    },

    // Agri-Drone
    {
        path: '/forms/achievements/projects/agri-drone',
        title: 'Introduction',
        description: 'Agri-Drone Introduction',
        category: 'Projects',
        subcategory: 'Agri-Drone',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/agri-drone',
            '/forms/achievements/projects/demonstration-details'
        ]
    },
    {
        path: '/forms/achievements/projects/demonstration-details',
        title: 'Demonstration',
        description: 'Agri-Drone Demonstration Details',
        category: 'Projects',
        subcategory: 'Agri-Drone',
        parent: '/forms/achievements/projects',
        siblings: [
            '/forms/achievements/projects/agri-drone',
            '/forms/achievements/projects/demonstration-details'
        ]
    },

    // Other direct links
    {
        path: '/forms/achievements/projects/seed-hub-program',
        title: 'Seed Hub Program',
        description: 'Seed Hub Program details',
        category: 'Projects',
        subcategory: 'Seed Hub',
        parent: '/forms/achievements/projects'
    },
    {
        path: '/forms/achievements/other-program',
        title: 'Other Programmes',
        description: 'Other programmes organized by KVK',
        category: 'Projects',
        subcategory: 'Other',
        parent: '/forms/achievements/projects'
    },
]

// Admin Management Routes
export const adminManagementRoutes: RouteConfig[] = [
    {
        path: '/role-view',
        title: 'Role Management',
        description: 'Manage system roles and permissions',
        category: 'Admin',
    },
    {
        path: '/view-users',
        title: 'User Management',
        description: 'Manage system users',
        category: 'Admin',
    },
    {
        path: '/role-view/:roleId/permissions',
        title: 'Role Permissions',
        description: 'Edit role permissions',
        category: 'Admin',
        parent: '/role-view',
    },
    {
        path: '/view-log-history',
        title: 'Log History',
        description: 'View system activity logs',
        category: 'Admin',
    },
    {
        path: '/view-email-notifications',
        title: 'Notifications',
        description: 'Manage email notifications',
        category: 'Admin',
    },
]

// Feature Routes
export const featureRoutes: RouteConfig[] = [
    {
        path: '/module-images',
        title: 'Module Images',
        description: 'Manage module images and media assets',
        category: 'Features',
    },
    {
        path: '/targets',
        title: 'Targets',
        description: 'View and manage system targets',
        category: 'Features',
    },
    {
        path: '/all-reports',
        title: 'Reports',
        description: 'View and generate system reports',
        category: 'Features',
    },
]

// Achievements Routes
export const achievementsRoutes: RouteConfig[] = [
    {
        path: '/forms/achievements/oft',
        title: 'On Farm Trials (OFT)',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['Reporting Year', 'KVK Name', 'Staff', 'Trail on form', 'Problem Diagnoised', 'Ongoing/Completed'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/fld',
        title: 'Front Line Demonstrations (FLD)',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['Reporting Year', 'Start Date', 'End Date', 'KVK Name', 'Category', 'Sub-Category', 'Name of Technnology Demonstrated', 'Ongoing/Completed'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/trainings',
        title: 'Trainings',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['Reporting Year', 'KVK Name', 'Start Date', 'End Date', 'Training Program', 'Training Title', 'Venue', 'Training Discipline', 'Thematic Area'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2026', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/extension-activities',
        title: 'Extension Activities',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['Reporting Year', 'KVK Name', 'Start Date', 'End Date', 'Name of Extension activities', 'No. of Activities', 'No. of Participants'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/other-extension',
        title: 'Extension Activities',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['s.no', 'Reporting Year', 'KVK Name', 'Nature of Extension Activies', 'No. of activities'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/technology-week',
        title: 'Technology Week Celebration',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['Start Date', 'End Date', 'KVK', 'Type Of Activities', 'No. of activities', 'Related Crop/Live Stock Technology', 'No. of Participants'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/celebration-days',
        title: 'Celebration Days',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Important Dates', 'Event Date', 'No. of Activities'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/production-supply',
        title: 'Production and supply of Technological products',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Category', 'Variety', 'Quantity'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/publications',
        title: 'KVKs Publication Details',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Item Name', 'Title', 'Author Name', 'Journal Name'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        // ],
    },
    {
        path: '/forms/achievements/soil-equipment',
        title: 'Soil Equipment',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Analysis', 'Equipment Name', 'Quantity'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/soil-analysis',
        title: 'Soil Analysis',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK NAME', 'Start Date', 'End Date', 'Analysis', 'No. of samples Analyzed', 'No. of Villages Covered', 'Amount Released'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/world-soil-day',
        title: 'World Soil Day',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK NAME', 'No. Of Activities Conducted', 'Soil Health Cards Distributed', 'No. of VIP(s)', 'Name(s) of VIP(s) Involved', 'Total No. of Participants attended the program'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/publications',
        title: 'Publications',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Item Name', 'Title', 'Author Name', 'Journal name'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/awards/kvk',
        title: 'Awards (KVK)',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Award', 'Amount', 'Achievement', 'Conferring Authority'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/awards/scientist',
        title: 'Scientist',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Head Scientist', 'Award', 'Amount', 'Achievement', 'Conferring Authority'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/awards/farmer',
        title: 'Farmer',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Farmer Name', 'Address', 'Contact Number', 'Award', 'Amount', 'Achievement', 'Conferring Authority'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
    {
        path: '/forms/achievements/hrd',
        title: 'Human-Resource Development',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: '/forms/achievements',
        fields: ['KVK Name', 'Staff', 'Course', 'Start Date', 'End Date', 'Organizer'],
        // mockData: [
        //     { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
        //     { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
        // ],
    },
]
// export const achievementsRoutes2: RouteConfig[] = [
//     {
//         path: '/forms/achievements/fld',
//         title: 'On Farm Trials (OFT)',
//         category: 'Form Management',
//         subcategory: 'Achievements',
//         parent: '/forms/achievements',
//         fields: ['s.no', 'Reporting Year', 'KVK', 'Staff', 'Trail on form', 'Problem Diagnoised', 'Ongoing/Completed'],
//         mockData: [
//             { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
//             { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
//         ],
//     },
// ]
// export const trainings: RouteConfig[] = [
//     {
//         path: '/forms/achievements/trainings',
//         title: 'On Farm Trials (OFT)',
//         category: 'Form Management',
//         subcategory: 'Achievements',
//         parent: '/forms/achievements',
//         fields: ['s.no', 'Reporting Year', 'KVK', 'Staff', 'Trail on form', 'Problem Diagnoised', 'Ongoing/Completed'],
//         mockData: [
//             { 's.no': 1, 'Reporting Year': '2023-24', 'KVK': 'KVK Bangalore', 'Staff': 'Dr. Sharma', 'Trail on form': 'Completed' },
//             { 's.no': 2, 'Reporting Year': '2023-24', 'KVK': 'KVK Mysore', 'Staff': 'Dr. Patel', 'Trail on form': 'Ongoing' },
//         ],
//     },
// ]


// Combine all routes
export const allRoutes: RouteConfig[] = [
    ...allMastersRoutes,
    ...projectsRoutes,
    ...aboutKvkRoutes,
    ...viewKvkRoutes,
    ...adminManagementRoutes,
    ...featureRoutes,
    ...achievementsRoutes,
    // ...achievementsRoutes2,
    // ...trainings,
]

// Helper functions
export const getRouteConfig = (path: string): RouteConfig | undefined => {
    // First try exact match
    let config = allRoutes.find(r => r.path === path)
    if (config) return config

    // Handle dynamic routes (with :id or other params)
    // Try to match by replacing dynamic segments
    for (const route of allRoutes) {
        if (route.path.includes(':')) {
            // Convert route path to regex pattern
            const pattern = route.path
                .replace(/:[^/]+/g, '[^/]+')
                .replace(/\//g, '\\/')
            const regex = new RegExp(`^${pattern}$`)
            if (regex.test(path)) {
                return route
            }
        }
    }

    // Try prefix matching for nested routes
    config = allRoutes.find(r => path.startsWith(r.path + '/'))
    return config
}

export const getRoutesByCategory = (category: string): RouteConfig[] => {
    return allRoutes.filter(r => r.category === category)
}

export const getRoutesBySubcategory = (subcategory: string): RouteConfig[] => {
    return allRoutes.filter(r => r.subcategory === subcategory)
}

export const getSiblingRoutes = (path: string): RouteConfig[] => {
    const config = getRouteConfig(path)
    if (!config?.siblings) return []
    return config.siblings.map(p => getRouteConfig(p)).filter(Boolean) as RouteConfig[]
}

export const getBreadcrumbsForPath = (path: string): { label: string; path: string }[] => {
    const breadcrumbs: { label: string; path: string }[] = []
    const config = getRouteConfig(path)

    if (!config) return breadcrumbs

    // Build breadcrumb trail based on category
    if (config.category === 'All Masters') {
        breadcrumbs.push({ label: 'All Masters', path: '/all-master' })
        if (config.subcategory) {
            breadcrumbs.push({
                label: config.subcategory,
                path: config.subcategoryPath || '',
            })
        }
        breadcrumbs.push({ label: config.title, path: config.path })
    } else if (config.category === 'Projects') {
        breadcrumbs.push({ label: 'Form Management', path: '/forms' })
        breadcrumbs.push({ label: 'Achievements', path: '/forms/achievements' })
        breadcrumbs.push({ label: 'Projects', path: '/forms/achievements/projects' })
        if (config.subcategory) {
            breadcrumbs.push({ label: config.subcategory, path: '' })
        }
        breadcrumbs.push({ label: config.title, path: config.path })
    } else if (config.category === 'Form Management' && config.subcategory === 'About KVK') {
        breadcrumbs.push({ label: 'Form Management', path: '/forms' })
        breadcrumbs.push({ label: 'About KVK', path: '/forms/about-kvk' })
        // If parent is not the base about-kvk path, add intermediate breadcrumbs
        if (config.parent && config.parent !== '/forms/about-kvk') {
            const parentConfig = getRouteConfig(config.parent)
            if (parentConfig && parentConfig.path !== '/forms/about-kvk') {
                breadcrumbs.push({ label: parentConfig.title, path: parentConfig.path })
            }
        }
        breadcrumbs.push({ label: config.title, path: config.path })
    } else if (config.category === 'Form Management') {
        breadcrumbs.push({ label: 'Form Management', path: '/forms' })
        if (config.subcategory) {
            breadcrumbs.push({ label: config.subcategory, path: config.parent || '/forms' })
        }
        breadcrumbs.push({ label: config.title, path: config.path })
    } else if (config.category === 'Admin') {
        breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' })
        breadcrumbs.push({ label: config.title, path: config.path })
    } else if (config.category === 'Features') {
        breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' })
        breadcrumbs.push({ label: config.title, path: config.path })
    }

    return breadcrumbs
}



