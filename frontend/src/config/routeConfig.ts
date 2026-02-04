// Route configuration for all forms and pages
// This centralizes all route definitions to avoid bloating App.tsx

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
}

// Sibling groups for All Masters
const basicMastersPaths = [
    '/all-master/zones',
    '/all-master/states',
    '/all-master/organizations',
    '/all-master/districts',
]

const oftFldMastersPaths = [
    '/all-master/oft/subject',
    '/all-master/oft/thematic-area',
    '/all-master/fld/sector',
    '/all-master/fld/thematic-area',
    '/all-master/fld/category',
    '/all-master/fld/sub-category',
    '/all-master/fld/crop',
    '/all-master/cfld-crop',
    // FUTURE: Season Master
    // '/all-master/season',
]

const trainingExtensionMastersPaths = [
    '/all-master/training-type',
    '/all-master/training-area',
    '/all-master/training-thematic',
    '/all-master/extension-activity',
    '/all-master/other-extension-activity',
    '/all-master/events',
]

const productionProjectsMastersPaths = [
    '/all-master/product-category',
    '/all-master/product-type',
    '/all-master/product',
    '/all-master/cra-croping-system',
    '/all-master/cra-farming-system',
    '/all-master/arya-enterprise',
]

// All Masters Routes
export const allMastersRoutes: RouteConfig[] = [
    // Basic Masters
    {
        path: '/all-master/zones',
        title: 'Zone Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: basicMastersPaths,
        fields: ['zoneName'],
    },
    {
        path: '/all-master/states',
        title: 'State Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: basicMastersPaths,
        fields: ['zoneName', 'stateName'],
    },
    {
        path: '/all-master/organizations',
        title: 'Organization Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: basicMastersPaths,
        fields: ['zoneName', 'stateName', 'uniName'],
    },

    {
        path: '/all-master/districts',
        title: 'District Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: basicMastersPaths,
        fields: ['zoneName', 'stateName', 'districtName'],
    },

    // OFT Master
    {
        path: '/all-master/oft/subject',
        title: 'Subject Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/oft-fld',
        siblings: oftFldMastersPaths,
        fields: ['subjectName', 'thematicAreasCount'],
    },
    {
        path: '/all-master/oft/thematic-area',
        title: 'OFT Thematic Area Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/oft-fld',
        siblings: oftFldMastersPaths,
        fields: ['thematicAreaName', 'subjectName'],
    },

    // FLD Master
    {
        path: '/all-master/fld/sector',
        title: 'Sector Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/oft-fld',
        siblings: oftFldMastersPaths,
        fields: ['sectorName', 'categoriesCount'],
    },
    {
        path: '/all-master/fld/thematic-area',
        title: 'FLD Thematic Area Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/oft-fld',
        siblings: oftFldMastersPaths,
        fields: ['thematicAreaName', 'sectorName'],
    },
    {
        path: '/all-master/fld/category',
        title: 'Category Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/oft-fld',
        siblings: oftFldMastersPaths,
        fields: ['categoryName', 'sectorName', 'subCategoriesCount'],
    },
    {
        path: '/all-master/fld/sub-category',
        title: 'Sub-category Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/oft-fld',
        siblings: oftFldMastersPaths,
        fields: ['subCategoryName', 'categoryName', 'sectorName', 'cropsCount'],
    },
    {
        path: '/all-master/fld/crop',
        title: 'Crop Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/oft-fld',
        siblings: oftFldMastersPaths,
        fields: ['cropName', 'subCategoryName', 'categoryName'],
    },

    // CFLD Master
    {
        path: '/all-master/cfld-crop',
        title: 'CFLD Crop Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/oft-fld',
        siblings: oftFldMastersPaths,
        fields: ['seasonName', 'cropTypeName', 'cropName'],
    },
    // FUTURE: Season Master
    // {
    //     path: '/all-master/season',
    //     title: 'Season Master',
    //     category: 'All Masters',
    //     subcategory: 'OFT & FLD Masters',
    //     parent: '/all-master',
    //     subcategoryPath: '/all-master/oft-fld',
    //     siblings: oftFldMastersPaths,
    //     fields: ['seasonName'],
    // },


    // Training Master
    {
        path: '/all-master/training-type',
        title: 'Training Type Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/training-extension',
        siblings: trainingExtensionMastersPaths,
        fields: ['trainingType'],
    },
    {
        path: '/all-master/training-area',
        title: 'Training Area Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/training-extension',
        siblings: trainingExtensionMastersPaths,
        fields: ['trainingType', 'trainingAreaName'],
    },
    {
        path: '/all-master/training-thematic',
        title: 'Training Thematic Area Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/training-extension',
        siblings: trainingExtensionMastersPaths,
        fields: ['trainingAreaName', 'trainingThematicArea'],
    },

    // Extension & Events
    {
        path: '/all-master/extension-activity',
        title: 'Extension Activity Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/training-extension',
        siblings: trainingExtensionMastersPaths,
        fields: ['name'],
    },
    {
        path: '/all-master/other-extension-activity',
        title: 'Other Extension Activity Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/training-extension',
        siblings: trainingExtensionMastersPaths,
        fields: ['name'],
    },
    {
        path: '/all-master/events',
        title: 'Events Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/training-extension',
        siblings: trainingExtensionMastersPaths,
        fields: ['eventName'],
    },

    // Production
    {
        path: '/all-master/product-category',
        title: 'Product Category Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/production-projects',
        siblings: productionProjectsMastersPaths,
        fields: ['productCategoryName'],
    },
    {
        path: '/all-master/product-type',
        title: 'Product Type Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/production-projects',
        siblings: productionProjectsMastersPaths,
        fields: ['productCategoryName', 'productCategoryType'],
    },
    {
        path: '/all-master/product',
        title: 'Products Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/production-projects',
        siblings: productionProjectsMastersPaths,
        fields: ['productCategoryName', 'productCategoryType', 'productName'],
    },

    // CRA
    {
        path: '/all-master/cra-croping-system',
        title: 'Cropping System Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/production-projects',
        siblings: productionProjectsMastersPaths,
        fields: ['seasonName', 'cropName'],
    },
    {
        path: '/all-master/cra-farming-system',
        title: 'Farming System Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/production-projects',
        siblings: productionProjectsMastersPaths,
        fields: ['seasonName', 'farmingSystemName'],
    },

    // ARYA
    {
        path: '/all-master/arya-enterprise',
        title: 'ARYA Enterprise Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/production-projects',
        siblings: productionProjectsMastersPaths,
        fields: ['enterpriseName'],
    },

    // Publications
    {
        path: '/all-master/publication-item',
        title: 'Publication Items Master',
        category: 'All Masters',
        subcategory: 'Publications Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/publications',
        siblings: ['/all-master/publication-item'],
        fields: ['publicationItem'],
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
        path: '/forms/achievements/projects/other-program',
        title: 'Other Programmes',
        description: 'Other programmes organized by KVK',
        category: 'Projects',
        subcategory: 'Other',
        parent: '/forms/achievements/projects'
    },
]

// About KVK Routes
export const aboutKvkRoutes: RouteConfig[] = [
    // View KVKs
    {
        path: '/forms/about-kvk/view-kvks',
        title: 'View KVKs',
        description: 'View and manage all KVKs',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
    },
    {
        path: '/forms/about-kvk/view-kvks/:id',
        title: 'KVK Details',
        description: 'View KVK details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk/view-kvks',
    },
    // Basic Information - siblings
    {
        path: '/forms/about-kvk/bank-account',
        title: 'Bank Account Details',
        description: 'Manage bank account information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/bank-account',
            '/forms/about-kvk/employee-details',
            '/forms/about-kvk/staff-transferred',
            '/forms/about-kvk/infrastructure',
        ],
    },
    {
        path: '/forms/about-kvk/employee-details',
        title: 'Employee Details',
        description: 'Manage employee and staff information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/bank-account',
            '/forms/about-kvk/employee-details',
            '/forms/about-kvk/staff-transferred',
            '/forms/about-kvk/infrastructure',
        ],
    },
    {
        path: '/forms/about-kvk/details',
        title: 'KVK Details',
        description: 'View and edit KVK basic details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/bank-account',
            '/forms/about-kvk/employee-details',
            '/forms/about-kvk/staff-transferred',
            '/forms/about-kvk/infrastructure',
        ],
    },
    {
        path: '/forms/about-kvk/staff-transferred',
        title: 'Staff Transferred',
        description: 'Manage transferred staff records',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/bank-account',
            '/forms/about-kvk/employee-details',
            '/forms/about-kvk/staff-transferred',
            '/forms/about-kvk/infrastructure',
        ],
    },
    {
        path: '/forms/about-kvk/infrastructure',
        title: 'Infrastructure Details',
        description: 'Manage infrastructure information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/bank-account',
            '/forms/about-kvk/employee-details',
            '/forms/about-kvk/staff-transferred',
            '/forms/about-kvk/infrastructure',
        ],
    },
    // Vehicles - siblings
    {
        path: '/forms/about-kvk/vehicles',
        title: 'View Vehicles',
        description: 'View all vehicles',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/vehicles',
            '/forms/about-kvk/vehicle-details',
        ],
    },
    {
        path: '/forms/about-kvk/vehicle-details',
        title: 'Vehicle Details',
        description: 'Manage vehicle details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/vehicles',
            '/forms/about-kvk/vehicle-details',
        ],
    },
    // Equipments - siblings
    {
        path: '/forms/about-kvk/equipments',
        title: 'View Equipments',
        description: 'View all equipments',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/equipments',
            '/forms/about-kvk/equipment-details',
        ],
    },
    {
        path: '/forms/about-kvk/equipment-details',
        title: 'Equipment Details',
        description: 'Manage equipment details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            '/forms/about-kvk/equipments',
            '/forms/about-kvk/equipment-details',
        ],
    },
    // Farm Implements
    {
        path: '/forms/about-kvk/farm-implements',
        title: 'Farm Implement Details',
        description: 'Manage farm implement details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
    },
    // Add Staff (sub-route)
    {
        path: '/forms/about-kvk/employee-details/add',
        title: 'Add Staff',
        description: 'Add new staff member',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk/employee-details',
    },
]

// View KVK Routes (Admin)
export const viewKvkRoutes: RouteConfig[] = [
    {
        path: '/forms/about-kvk/view-kvks',
        title: 'View KVKs',
        description: 'View and manage all KVKs',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
    },
    {
        path: '/forms/about-kvk/view-kvks/:id',
        title: 'KVK Information',
        description: 'View detailed KVK information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk/view-kvks',
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
        parent: '/forms/about-kvk/view-kvks/:id',
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
        parent: '/forms/about-kvk/view-kvks/:id',
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
        parent: '/forms/about-kvk/view-kvks/:id',
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
        parent: '/forms/about-kvk/view-kvks/:id',
        siblings: [
            '/forms/about-kvk/view-kvks/:id',
            '/forms/about-kvk/view-kvks/:id/bank',
            '/forms/about-kvk/view-kvks/:id/employees',
            '/forms/about-kvk/view-kvks/:id/vehicles',
            '/forms/about-kvk/view-kvks/:id/equipments',
        ],
    },
]

// Combine all routes
export const allRoutes: RouteConfig[] = [
    ...allMastersRoutes,
    ...projectsRoutes,
    ...aboutKvkRoutes,
    ...viewKvkRoutes,
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
    }

    return breadcrumbs
}
