// Route configuration for all forms and pages
// This centralizes all route definitions to avoid bloating App.tsx
import { ENTITY_PATHS } from '../constants/entityConstants'
import { ROUTE_PATHS } from '../constants/routePaths'
import { FIELD_GROUPS } from '../constants/fieldNames'
import { ROUTE_SIBLING_GROUPS } from './routeSiblingGroups'
import { MASTER_SIBLING_GROUPS } from './masterSiblingGroups'
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
    siblings?: readonly string[] | string[]
    // Optional field configuration for generic master views
    fields?: readonly string[] | string[]
    // Authorization: which roles can create new items (undefined = all roles can create)
    canCreate?: UserRole[] | 'none'
    // Optional module code for Role Permission-based access control
    // (matches backend seedModulesForRolePermissions MODULES.moduleCode)
    moduleCode?: string
    // Optional component to render instead of DataManagementView
    component?: React.ComponentType<any>
    // Optional mock data for prototyping
    mockData?: any[]
}

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
        siblings: MASTER_SIBLING_GROUPS.BASIC_MASTERS,
        fields: FIELD_GROUPS.ZONE_MASTER,
        moduleCode: 'all_masters_zone_master',
    },
    {
        path: ENTITY_PATHS.STATES,
        title: 'State Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: MASTER_SIBLING_GROUPS.BASIC_MASTERS,
        fields: FIELD_GROUPS.STATE_MASTER,
        moduleCode: 'all_masters_states_master',
    },
    {
        path: ENTITY_PATHS.ORGANIZATIONS,
        title: 'Organization Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: MASTER_SIBLING_GROUPS.BASIC_MASTERS,
        fields: FIELD_GROUPS.ORGANIZATION_MASTER,
        moduleCode: 'all_masters_organization_master',
    },
    {
        path: ENTITY_PATHS.UNIVERSITIES,
        title: 'University Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: '/all-master/basic',
        siblings: MASTER_SIBLING_GROUPS.BASIC_MASTERS,
        fields: FIELD_GROUPS.UNIVERSITY_MASTER,
        moduleCode: 'all_masters_university_master',
    },
    {
        path: ENTITY_PATHS.DISTRICTS,
        title: 'District Master',
        category: 'All Masters',
        subcategory: 'Basic Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.BASIC_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.BASIC_MASTERS,
        fields: FIELD_GROUPS.DISTRICT_MASTER,
        moduleCode: 'all_masters_districts_master',
    },

    // OFT Masters
    {
        path: ENTITY_PATHS.OFT_SUBJECT,
        title: 'Subject Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.OFT_MASTERS,
        fields: FIELD_GROUPS.OFT_SUBJECT_MASTER,
        moduleCode: 'all_masters_oft_master',
    },
    {
        path: ENTITY_PATHS.OFT_THEMATIC_AREA,
        title: 'OFT Thematic Area Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.OFT_MASTERS,
        fields: FIELD_GROUPS.OFT_THEMATIC_AREA_MASTER,
        moduleCode: 'all_masters_oft_master',
    },

    // FLD Masters
    {
        path: ENTITY_PATHS.FLD_SECTOR,
        title: 'Sector Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.FLD_MASTERS,
        fields: FIELD_GROUPS.FLD_SECTOR_MASTER,
        moduleCode: 'all_masters_fld_master',
    },
    {
        path: ENTITY_PATHS.FLD_THEMATIC_AREA,
        title: 'FLD Thematic Area Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.FLD_MASTERS,
        fields: FIELD_GROUPS.FLD_THEMATIC_AREA_MASTER,
        moduleCode: 'all_masters_fld_master',
    },
    {
        path: ENTITY_PATHS.FLD_CATEGORY,
        title: 'Category Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.FLD_MASTERS,
        fields: FIELD_GROUPS.FLD_CATEGORY_MASTER,
        moduleCode: 'all_masters_fld_master',
    },
    {
        path: ENTITY_PATHS.FLD_SUBCATEGORY,
        title: 'Sub-category Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.FLD_MASTERS,
        fields: FIELD_GROUPS.FLD_SUBCATEGORY_MASTER,
        moduleCode: 'all_masters_fld_master',
    },
    {
        path: ENTITY_PATHS.FLD_CROP,
        title: 'Crop Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.FLD_MASTERS,
        fields: FIELD_GROUPS.FLD_CROP_MASTER,
        moduleCode: 'all_masters_fld_master',
    },
    {
        path: ENTITY_PATHS.FLD_ACTIVITY,
        title: 'Activity Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.FLD_MASTERS,
        fields: FIELD_GROUPS.FLD_ACTIVITY_MASTER,
        moduleCode: 'all_masters_fld_master',
    },

    // CFLD Masters
    {
        path: ENTITY_PATHS.CFLD_CROP,
        title: 'CFLD Crop Master',
        category: 'All Masters',
        subcategory: 'OFT & FLD Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OFT_FLD_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.CFLD_MASTERS,
        fields: FIELD_GROUPS.CFLD_CROP_MASTER,
        moduleCode: 'all_masters_cfld_master',
    },


    // Training Master
    {
        path: ENTITY_PATHS.TRAINING_TYPE,
        title: 'Training Type Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.TRAINING_BASIC_MASTERS,
        fields: FIELD_GROUPS.TRAINING_TYPE_MASTER,
        moduleCode: 'all_masters_training_master',
    },
    {
        path: ENTITY_PATHS.TRAINING_AREA,
        title: 'Training Area Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.TRAINING_BASIC_MASTERS,
        fields: FIELD_GROUPS.TRAINING_AREA_MASTER,
        moduleCode: 'all_masters_training_master',
    },
    {
        path: ENTITY_PATHS.TRAINING_THEMATIC,
        title: 'Training Thematic Area Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.TRAINING_BASIC_MASTERS,
        fields: FIELD_GROUPS.TRAINING_THEMATIC_AREA_MASTER,
        moduleCode: 'all_masters_training_master',
    },

    // Training Masters (additional)
    {
        path: ENTITY_PATHS.TRAINING_CLIENTELE,
        title: 'Training Clientele Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.TRAINING_BASIC_MASTERS,
        fields: FIELD_GROUPS.TRAINING_CLIENTELE_MASTER,
        moduleCode: 'all_masters_training_master',
    },
    {
        path: ENTITY_PATHS.FUNDING_SOURCE,
        title: 'Funding Source Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.TRAINING_BASIC_MASTERS,
        fields: FIELD_GROUPS.TRAINING_CLIENTELE_MASTER,
        moduleCode: 'all_masters_training_master',
    },

    // Extension & Events
    {
        path: ENTITY_PATHS.EXTENSION_ACTIVITY,
        title: 'Extension Activity Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.TRAINING_EXTENSION_MASTERS,
        fields: FIELD_GROUPS.TRAINING_CLIENTELE_MASTER,
        moduleCode: 'all_masters_extension_activity_master',
    },
    {
        path: ENTITY_PATHS.OTHER_EXTENSION_ACTIVITY,
        title: 'Other Extension Activity Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.TRAINING_EXTENSION_MASTERS,
        fields: FIELD_GROUPS.TRAINING_CLIENTELE_MASTER,
        moduleCode: 'all_masters_other_extension_activity_master',
    },
    {
        path: ENTITY_PATHS.EVENTS,
        title: 'Events Master',
        category: 'All Masters',
        subcategory: 'Training & Extension Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.TRAINING_EXTENSION_MASTERS,
        siblings: [],
        fields: FIELD_GROUPS.EVENTS_MASTER,
        moduleCode: 'all_masters_events_master',
    },

    // Production - Product Masters
    {
        path: ENTITY_PATHS.PRODUCT_CATEGORY,
        title: 'Product Category Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.PRODUCT_MASTERS,
        fields: FIELD_GROUPS.PRODUCT_CATEGORY_MASTER,
        moduleCode: 'all_masters_products_master',
    },
    {
        path: ENTITY_PATHS.PRODUCT_TYPE,
        title: 'Product Type Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.PRODUCT_MASTERS,
        fields: FIELD_GROUPS.PRODUCT_TYPE_MASTER,
        moduleCode: 'all_masters_products_master',
    },
    {
        path: ENTITY_PATHS.PRODUCT,
        title: 'Products Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.PRODUCT_MASTERS,
        fields: FIELD_GROUPS.PRODUCT_MASTER,
        moduleCode: 'all_masters_products_master',
    },

    // CRA Masters
    {
        path: ENTITY_PATHS.CRA_CROPPING_SYSTEM,
        title: 'Cropping System Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.CRA_MASTERS,
        fields: FIELD_GROUPS.CRA_CROPPING_SYSTEM_MASTER,
        moduleCode: 'all_masters_climate_master',
    },
    {
        path: ENTITY_PATHS.CRA_FARMING_SYSTEM,
        title: 'Farming System Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.CRA_MASTERS,
        fields: FIELD_GROUPS.CRA_FARMING_SYSTEM_MASTER,
        moduleCode: 'all_masters_climate_master',
    },

    // ARYA Masters
    {
        path: ENTITY_PATHS.ARYA_ENTERPRISE,
        title: 'ARYA Enterprise Master',
        category: 'All Masters',
        subcategory: 'Production & Projects Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.PRODUCTION_PROJECTS_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.ARYA_MASTERS,
        fields: FIELD_GROUPS.ARYA_ENTERPRISE_MASTER,
        moduleCode: 'all_masters_arya_master',
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
        fields: FIELD_GROUPS.PUBLICATION_ITEM_MASTER,
        moduleCode: 'all_masters_publication_master',
    },

    // Other Masters
    {
        path: ENTITY_PATHS.STAFF_CATEGORY,
        title: 'Staff Category Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.EMPLOYEE_MASTERS,
        fields: FIELD_GROUPS.STAFF_CATEGORY_MASTER,
        moduleCode: 'all_masters_staff_category_master',
    },
    {
        path: ENTITY_PATHS.PAY_LEVEL,
        title: 'Pay Level Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.EMPLOYEE_MASTERS,
        fields: FIELD_GROUPS.PAY_LEVEL_MASTER,
        moduleCode: 'all_masters_pay_level_master',
    },
    {
        path: ENTITY_PATHS.DISCIPLINE,
        title: 'Discipline Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.EMPLOYEE_MASTERS,
        fields: FIELD_GROUPS.DISCIPLINE_MASTER,
        moduleCode: 'all_masters_discipline_master',
    },
    {
        path: ENTITY_PATHS.SANCTIONED_POST,
        title: 'Sanctioned Post Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.EMPLOYEE_MASTERS,
        fields: FIELD_GROUPS.SANCTIONED_POST_MASTER,
        moduleCode: 'all_masters_sanctioned_post_master',
    },
    {
        path: ENTITY_PATHS.SEASON,
        title: 'Season Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.OTHER_MASTERS,
        fields: FIELD_GROUPS.SEASON_MASTER,
        moduleCode: 'all_masters_season_master',
    },
    {
        path: ENTITY_PATHS.YEAR,
        title: 'Year Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.OTHER_MASTERS,
        fields: FIELD_GROUPS.YEAR_MASTER,
        moduleCode: 'all_masters_year_master',
    },
    {
        path: ENTITY_PATHS.CROP_TYPE,
        title: 'Crop Type Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.OTHER_MASTERS,
        fields: FIELD_GROUPS.CROP_TYPE_MASTER,
        moduleCode: 'all_masters_crop_type_master',
    },
    {
        path: ENTITY_PATHS.INFRASTRUCTURE_MASTER,
        title: 'Infrastructure Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.OTHER_MASTERS,
        fields: FIELD_GROUPS.TRAINING_CLIENTELE_MASTER,
        moduleCode: 'all_masters_infrastructure_master',
    },
    {
        path: ENTITY_PATHS.IMPORTANT_DAY,
        title: 'Important Day Master',
        category: 'All Masters',
        subcategory: 'Other Masters',
        parent: '/all-master',
        subcategoryPath: ENTITY_PATHS.OTHER_MASTERS,
        siblings: MASTER_SIBLING_GROUPS.OTHER_MASTERS,
        fields: FIELD_GROUPS.IMPORTANT_DAY_MASTER,
        moduleCode: 'all_masters_events_master',
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
        fields: FIELD_GROUPS.VIEW_KVKS,
        canCreate: ['super_admin'], // Only super_admin can create KVKs
        moduleCode: 'about_kvks_view_kvks',
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
        fields: FIELD_GROUPS.BANK_ACCOUNT_DETAILS,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_bank_account_details',
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
        fields: FIELD_GROUPS.EMPLOYEE_DETAILS,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_employee_details',
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
        fields: FIELD_GROUPS.STAFF_TRANSFERRED,
        canCreate: 'none',
        moduleCode: 'about_kvks_staff_details',
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
        fields: FIELD_GROUPS.INFRASTRUCTURE_DETAILS,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_infrastructure_details',
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
        fields: FIELD_GROUPS.VIEW_VEHICLES,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_vehicle_details',
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
        fields: FIELD_GROUPS.VEHICLE_DETAILS,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_vehicle_details',
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
        fields: FIELD_GROUPS.VIEW_EQUIPMENTS,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_equipment_details',
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
        fields: FIELD_GROUPS.EQUIPMENT_DETAILS,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_equipment_details',
    },
    // Farm Implements
    {
        path: ENTITY_PATHS.KVK_FARM_IMPLEMENTS,
        title: 'Farm Implement Details',
        description: 'Manage farm implement details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        fields: FIELD_GROUPS.FARM_IMPLEMENT_DETAILS,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_farm_implement_details',
    },
    // Add Staff (sub-route) - REMOVED placeholder

]

// View KVK Routes (Admin)
export const viewKvkRoutes: RouteConfig[] = [
    {
        path: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.BASE,
        title: 'View KVKs',
        description: 'View and manage all KVKs',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ROUTE_PATHS.ABOUT_KVK.BASE,
        moduleCode: 'about_kvks_view_kvks',
    },
    {
        path: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.DETAILS,
        title: 'KVK Information',
        description: 'View detailed KVK information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.BASE,
        siblings: ROUTE_SIBLING_GROUPS.KVK_VIEW,
        moduleCode: 'about_kvks_view_kvks',
    },
    {
        path: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.BANK,
        title: 'Bank Accounts',
        description: 'View bank account details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.DETAILS,
        siblings: ROUTE_SIBLING_GROUPS.KVK_VIEW,
        moduleCode: 'about_kvks_bank_account_details',
    },
    {
        path: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.EMPLOYEES,
        title: 'Employees',
        description: 'View employee details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.DETAILS,
        siblings: ROUTE_SIBLING_GROUPS.KVK_VIEW,
        moduleCode: 'about_kvks_employee_details',
    },
    {
        path: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.VEHICLES,
        title: 'Vehicles',
        description: 'Vehicle details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.DETAILS,
        siblings: ROUTE_SIBLING_GROUPS.KVK_VIEW,
        moduleCode: 'about_kvks_vehicle_details',
    },
    {
        path: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.EQUIPMENTS,
        title: 'Equipments',
        description: 'Equipment details',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: ROUTE_PATHS.ABOUT_KVK.VIEW_KVKS.DETAILS,
        siblings: ROUTE_SIBLING_GROUPS.KVK_VIEW,
        moduleCode: 'about_kvks_equipment_details',
    },
]

// Projects Routes - under Achievements
export const projectsRoutes: RouteConfig[] = [
    // CFLD
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CFLD.TECHNICAL_PARAMETER,
        title: 'Technical Parameter',
        description: 'CFLD Technical Parameters',
        category: 'Projects',
        subcategory: 'CFLD',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.CFLD_TECHNICAL_PARAMETER,
        siblings: ROUTE_SIBLING_GROUPS.CFLD,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CFLD.EXTENSION_ACTIVITY,
        title: 'Extension Activity',
        description: 'CFLD Extension Activities',
        category: 'Projects',
        subcategory: 'CFLD',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.CFLD_EXTENSION_ACTIVITY,
        siblings: ROUTE_SIBLING_GROUPS.CFLD,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CFLD.BUDGET_UTILIZATION,
        title: 'Budget Utilization',
        description: 'CFLD Budget Utilization',
        category: 'Projects',
        subcategory: 'CFLD',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.CFLD_BUDGET_UTILIZATION,
        siblings: ROUTE_SIBLING_GROUPS.CFLD,
    },

    // CRA
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CRA.DETAILS,
        title: 'Climate Resilient',
        description: 'Climate Resilient Agriculture Details',
        category: 'Projects',
        subcategory: 'CRA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.CRA_DETAILS,
        siblings: ROUTE_SIBLING_GROUPS.CRA,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CRA.EXTENSION_ACTIVITY,
        title: 'Extension Activity',
        description: 'CRA Extension Activities',
        category: 'Projects',
        subcategory: 'CRA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.CRA_EXTENSION_ACTIVITY,
        siblings: ROUTE_SIBLING_GROUPS.CRA,
    },

    // FPO
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.FPO.DETAILS,
        title: 'FPO Details',
        description: 'Formation and Promotion of FPOs as CBBOs under NCDC funding',
        category: 'Projects',
        subcategory: 'FPO',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.FPO_DETAILS,
        siblings: ROUTE_SIBLING_GROUPS.FPO,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.FPO.MANAGEMENT,
        title: 'FPO Management',
        description: 'FPO Management',
        category: 'Projects',
        subcategory: 'FPO',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.FPO_MANAGEMENT,
        siblings: ROUTE_SIBLING_GROUPS.FPO,
    },

    // DRMR
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.DRMR.DETAILS,
        title: 'DRMR Details',
        description: 'DRMR Program Details',
        category: 'Projects',
        subcategory: 'DRMR',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.DRMR_DETAILS,
        siblings: ROUTE_SIBLING_GROUPS.DRMR,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.DRMR.ACTIVITY,
        title: 'DRMR Activity',
        description: 'DRMR Activities',
        category: 'Projects',
        subcategory: 'DRMR',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.DRMR,
    },

    // NARI
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.NUTRI_SMART,
        title: 'Nutrition Garden',
        description: 'Details of Nutrition Garden in Nutri-Smart village',
        category: 'Projects',
        subcategory: 'NARI',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.NARI_NUTRI_SMART,
        siblings: ROUTE_SIBLING_GROUPS.NARI,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.BIO_FORTIFIED,
        title: 'Bio-fortified Crops',
        description: 'Details of Bio-fortified crops used in Nutri-Smart village',
        category: 'Projects',
        subcategory: 'NARI',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.NARI_BIO_FORTIFIED,
        siblings: ROUTE_SIBLING_GROUPS.NARI,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.VALUE_ADDITION,
        title: 'Value Addition',
        description: 'Details of Value addition',
        category: 'Projects',
        subcategory: 'NARI',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NARI,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.TRAINING_PROGRAMM,
        title: 'Training Programmes',
        description: 'Training programmes in Nutri-Smart village',
        category: 'Projects',
        subcategory: 'NARI',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NARI,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.EXTENSION_ACTIVITIES,
        title: 'Extension Activities',
        description: 'Extension activities under NARI',
        category: 'Projects',
        subcategory: 'NARI',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NARI,
    },

    // ARYA
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.ARYA.CURRENT,
        title: 'Current Year',
        description: 'ARYA Current Year Details',
        category: 'Projects',
        subcategory: 'ARYA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.ARYA_CURRENT,
        siblings: ROUTE_SIBLING_GROUPS.ARYA,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.ARYA.EVALUATION,
        title: 'Previous Year',
        description: 'ARYA Previous Year Evaluation',
        category: 'Projects',
        subcategory: 'ARYA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.ARYA_EVALUATION,
        siblings: ROUTE_SIBLING_GROUPS.ARYA,
    },

    // Direct links (no siblings)
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CSISA,
        title: 'CSISA',
        description: 'Cereal Systems Initiative for South Asia (CSISA)',
        category: 'Projects',
        subcategory: 'CSISA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.CSISA,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.TSP_SCSP,
        title: 'TSP/SCSP Activities',
        description: 'Tribal Sub Plan / Scheduled Caste Sub Plan (TSP/SCSP) Activities',
        category: 'Projects',
        subcategory: 'TSP/SCSP',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.TSP_SCSP,
    },

    // NICRA
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASIC_INFORMATION,
        title: 'Basic Information',
        description: 'NICRA Basic Information',
        category: 'Projects',
        subcategory: 'NICRA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.NICRA_BASIC_INFORMATION,
        siblings: ROUTE_SIBLING_GROUPS.NICRA_BASE,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.DETAILS,
        title: 'Details',
        description: 'NICRA Details',
        category: 'Projects',
        subcategory: 'NICRA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_BASE,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.TRAINING,
        title: 'Training',
        description: 'NICRA Training',
        category: 'Projects',
        subcategory: 'NICRA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_BASE,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.EXTENSION_ACTIVITY,
        title: 'Extension Activity',
        description: 'NICRA Extension Activity',
        category: 'Projects',
        subcategory: 'NICRA',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.NICRA_EXTENSION_ACTIVITY,
        siblings: ROUTE_SIBLING_GROUPS.NICRA_BASE,
    },

    // NICRA Others - using centralized paths
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.INTERVENTION,
        title: 'Intervention',
        description: 'NICRA Others - Intervention',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_OTHERS
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.REVENUE_GENERATED,
        title: 'Revenue Generated',
        description: 'NICRA Others - Revenue Generated',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_OTHERS
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.CUSTOM_HIRING,
        title: 'Custom Hiring',
        description: 'NICRA Others - Custom Hiring of Farm-Implement',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_OTHERS
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.VCRMC,
        title: 'Village VCRMC',
        description: 'NICRA Others - Village wise VCRMC',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_OTHERS
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.SOIL_HEALTH_CARD,
        title: 'Soil Health Card',
        description: 'NICRA Others - Soil Health Card',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_OTHERS
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.CONVERGENCE_PROGRAMME,
        title: 'Convergence',
        description: 'NICRA Others - Convergence Programme',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_OTHERS
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.DIGNITARIES_VISITED,
        title: 'Dignitaries',
        description: 'NICRA Others - Dignitaries Visited',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_OTHERS
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.PI_COPI_LIST,
        title: 'PI & Co-PI',
        description: 'NICRA Others - PI & Co-PI List',
        category: 'Projects',
        subcategory: 'NICRA Others',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NICRA_OTHERS
    },

    // Natural Farming
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.GEOGRAPHICAL_INFORMATION,
        title: 'Geographical',
        description: 'Geographical Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NATURAL_FARMING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.PHYSICAL_INFORMATION,
        title: 'Physical',
        description: 'Physical Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NATURAL_FARMING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.DEMONSTRATION_INFORMATION,
        title: 'Demonstration',
        description: 'Demonstration Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.NATURAL_FARMING_DEMONSTRATION,
        siblings: ROUTE_SIBLING_GROUPS.NATURAL_FARMING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.FARMERS_PRACTICING,
        title: 'Farmers Practicing',
        description: 'Farmers Already Practicing Natural Farming',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.NATURAL_FARMING_FARMERS_PRACTICING,
        siblings: ROUTE_SIBLING_GROUPS.NATURAL_FARMING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.BENEFICIARIES,
        title: 'Beneficiaries',
        description: 'Details of Beneficiaries',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.NATURAL_FARMING_BENEFICIARIES,
        siblings: ROUTE_SIBLING_GROUPS.NATURAL_FARMING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.SOIL_DATA,
        title: 'Soil Data',
        description: 'Soil Data Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.NATURAL_FARMING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.BUDGET_EXPENDITURE,
        title: 'Budget Expenditure',
        description: 'Budget Expenditure Information',
        category: 'Projects',
        subcategory: 'Natural Farming',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.NATURAL_FARMING_BUDGET_EXPENDITURE,
        siblings: ROUTE_SIBLING_GROUPS.NATURAL_FARMING,
    },

    // Agri-Drone
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.AGRI_DRONE,
        title: 'Introduction',
        description: 'Agri-Drone Introduction',
        category: 'Projects',
        subcategory: 'Agri-Drone',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.AGRI_DRONE,
        siblings: ROUTE_SIBLING_GROUPS.AGRI_DRONE,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.DEMONSTRATION_DETAILS,
        title: 'Demonstration',
        description: 'Agri-Drone Demonstration Details',
        category: 'Projects',
        subcategory: 'Agri-Drone',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        siblings: ROUTE_SIBLING_GROUPS.AGRI_DRONE,
    },

    // Other direct links
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.SEED_HUB_PROGRAM,
        title: 'Seed Hub Program',
        description: 'Seed Hub Program details',
        category: 'Projects',
        subcategory: 'Seed Hub',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
        fields: FIELD_GROUPS.SEED_HUB_PROGRAM,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.OTHER_PROGRAM,
        title: 'Other Programmes',
        description: 'Other programmes organized by KVK',
        category: 'Projects',
        subcategory: 'Other',
        parent: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE,
        moduleCode: 'achievements_projects',
    },
]

// Admin Management Routes
export const adminManagementRoutes: RouteConfig[] = [
    {
        path: '/role-view',
        title: 'Role Management',
        description: 'Manage system roles and permissions',
        category: 'Admin',
        moduleCode: 'role_management_roles',
    },
    {
        path: '/view-users',
        title: 'User Management',
        description: 'Manage system users',
        category: 'Admin',
        moduleCode: 'user_management_users',
    },
    {
        path: '/role-view/:roleId/permissions',
        title: 'Role Permissions',
        description: 'Edit role permissions',
        category: 'Admin',
        parent: '/role-view',
        moduleCode: 'role_management_roles',
    },
    {
        path: '/view-log-history',
        title: 'Log History',
        description: 'View system activity logs',
        category: 'Admin',
        moduleCode: 'log_history',
    },
    {
        path: '/view-email-notifications',
        title: 'Notifications',
        description: 'Manage email notifications',
        category: 'Admin',
        moduleCode: 'notifications',
    },
]

// Feature Routes
export const featureRoutes: RouteConfig[] = [
    {
        path: '/forms/success-stories',
        title: 'Success Stories',
        description: 'Success stories from KVKs',
        category: 'Form Management',
        moduleCode: 'form_management_success_stories',
    },
    {
        path: '/module-images',
        title: 'Module Images',
        description: 'Manage module images and media assets',
        category: 'Features',
        moduleCode: 'module_images',
    },
    {
        path: '/targets',
        title: 'Targets',
        description: 'View and manage system targets',
        category: 'Features',
        moduleCode: 'targets',
    },
    {
        path: '/all-reports',
        title: 'Reports',
        description: 'View and generate system reports',
        category: 'Features',
        moduleCode: 'reports',
    },
]

// Achievements Routes
export const achievementsRoutes: RouteConfig[] = [
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.OFT,
        title: 'On Farm Trials (OFT)',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_oft',
        fields: FIELD_GROUPS.OFT,
        siblings: ROUTE_SIBLING_GROUPS.OFT_FLD,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.FLD.BASE,
        title: 'Front Line Demonstrations (FLD)',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_fld',
        fields: FIELD_GROUPS.FLD_BASE,
        siblings: ROUTE_SIBLING_GROUPS.OFT_FLD,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.FLD.EXTENSION_TRAINING,
        title: 'Extension & Training activities under FLD',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_fld_extension_training',
        fields: FIELD_GROUPS.FLD_EXTENSION_TRAINING,
        siblings: ROUTE_SIBLING_GROUPS.OFT_FLD,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.FLD.TECHNICAL_FEEDBACK,
        title: 'Technical Feedback on FLD',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_fld_technical_feedback',
        fields: FIELD_GROUPS.FLD_TECHNICAL_FEEDBACK,
        siblings: ROUTE_SIBLING_GROUPS.OFT_FLD,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.TRAININGS,
        title: 'Trainings',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_trainings',
        fields: FIELD_GROUPS.TRAININGS,
        siblings: ROUTE_SIBLING_GROUPS.TRAINING_EXTENSION,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.EXTENSION_ACTIVITIES,
        title: 'Extension Activities',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_extension_activities',
        fields: FIELD_GROUPS.EXTENSION_ACTIVITIES,
        siblings: ROUTE_SIBLING_GROUPS.TRAINING_EXTENSION,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.OTHER_EXTENSION,
        title: 'Extension Activities',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_other_extension_activities',
        fields: FIELD_GROUPS.OTHER_EXTENSION,
        siblings: ROUTE_SIBLING_GROUPS.TRAINING_EXTENSION,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.TECHNOLOGY_WEEK,
        title: 'Technology Week Celebration',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_technology_week_celebration',
        fields: FIELD_GROUPS.TECHNOLOGY_WEEK,
        siblings: ROUTE_SIBLING_GROUPS.TRAINING_EXTENSION,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.CELEBRATION_DAYS,
        title: 'Celebration Days',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_celebration_days',
        fields: FIELD_GROUPS.CELEBRATION_DAYS,
        siblings: ROUTE_SIBLING_GROUPS.TRAINING_EXTENSION,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PRODUCTION_SUPPLY,
        title: 'Production and supply of Technological products',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_production_supply_tech_products',
        fields: FIELD_GROUPS.PRODUCTION_SUPPLY,
        siblings: [ROUTE_PATHS.ACHIEVEMENTS.PRODUCTION_SUPPLY],
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.PUBLICATIONS,
        title: 'KVKs Publication Details',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_publications',
        fields: FIELD_GROUPS.PUBLICATIONS,
        siblings: [ROUTE_PATHS.ACHIEVEMENTS.PUBLICATIONS],
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.SOIL_EQUIPMENT,
        title: 'Soil Equipment',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_soil_water_testing',
        fields: FIELD_GROUPS.SOIL_EQUIPMENT,
        siblings: ROUTE_SIBLING_GROUPS.SOIL_WATER_TESTING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.SOIL_ANALYSIS,
        title: 'Soil Analysis',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_soil_water_testing',
        fields: FIELD_GROUPS.SOIL_ANALYSIS,
        siblings: ROUTE_SIBLING_GROUPS.SOIL_WATER_TESTING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.WORLD_SOIL_DAY,
        title: 'World Soil Day',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_soil_water_testing',
        fields: FIELD_GROUPS.WORLD_SOIL_DAY,
        siblings: ROUTE_SIBLING_GROUPS.SOIL_WATER_TESTING,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.AWARDS.KVK,
        title: 'Awards (KVK)',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_award_recognition',
        fields: FIELD_GROUPS.AWARDS_KVK,
        siblings: ROUTE_SIBLING_GROUPS.AWARDS,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.AWARDS.SCIENTIST,
        title: 'Scientist',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_award_recognition',
        fields: FIELD_GROUPS.AWARDS_SCIENTIST,
        siblings: ROUTE_SIBLING_GROUPS.AWARDS,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.AWARDS.FARMER,
        title: 'Farmer',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_award_recognition',
        fields: FIELD_GROUPS.AWARDS_FARMER,
        siblings: ROUTE_SIBLING_GROUPS.AWARDS,
    },
    {
        path: ROUTE_PATHS.ACHIEVEMENTS.HRD,
        title: 'Human-Resource Development',
        category: 'Form Management',
        subcategory: 'Achievements',
        parent: ROUTE_PATHS.ACHIEVEMENTS.BASE,
        moduleCode: 'achievements_hrd',
        fields: FIELD_GROUPS.HRD,
        siblings: [ROUTE_PATHS.ACHIEVEMENTS.HRD],
    },
]


// Combine all routes
export const allRoutes: RouteConfig[] = [
    ...allMastersRoutes,
    ...projectsRoutes,
    ...aboutKvkRoutes,
    ...viewKvkRoutes,
    ...adminManagementRoutes,
    ...featureRoutes,
    ...achievementsRoutes,
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

/** Get module code for a path (for permission-based visibility). Returns undefined if no moduleCode. */
export const getModuleCodeForPath = (path: string): string | undefined => {
    const config = getRouteConfig(path)
    return config?.moduleCode
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
            breadcrumbs.push({ label: config.subcategory, path: '/forms/achievements/projects' })
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



