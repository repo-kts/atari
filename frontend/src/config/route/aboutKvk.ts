/**
 * About KVK Routes Configuration
 *
 * Contains all route configurations for the "About KVK" section.
 * Includes routes for viewing KVKs, bank accounts, employees, infrastructure, vehicles, and equipment.
 */

import { ENTITY_PATHS } from '../../constants/entityConstants'
import { ROUTE_PATHS } from '../../constants/routePaths'
import { FIELD_GROUPS } from '../../constants/fieldNames'
import { ROUTE_SIBLING_GROUPS } from '../routeSiblingGroups'
import { RouteConfig } from './types'

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
        siblings: [
            ENTITY_PATHS.KVK_VIEW,
            ENTITY_PATHS.KVK_BANK_ACCOUNT
        ]
    },
    {
        path: ENTITY_PATHS.KVK_BANK_ACCOUNT,
        title: 'Bank Account Details',
        description: 'Manage bank account information',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_VIEW,
            ENTITY_PATHS.KVK_BANK_ACCOUNT
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
            ENTITY_PATHS.KVK_EMPLOYEES,
            ENTITY_PATHS.KVK_STAFF_TRANSFERRED,
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
            ENTITY_PATHS.KVK_EMPLOYEES,
            ENTITY_PATHS.KVK_STAFF_TRANSFERRED,
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
            ENTITY_PATHS.KVK_INFRASTRUCTURE,
            ENTITY_PATHS.KVK_LAND_DETAILS,
        ],
        fields: FIELD_GROUPS.INFRASTRUCTURE_DETAILS,
        canCreate: ['kvk_admin', 'kvk_user'],
        moduleCode: 'about_kvks_infrastructure_details',
    },
    {
        path: ENTITY_PATHS.KVK_LAND_DETAILS,
        title: 'Land Details',
        description: 'Manage KVK land parcels and area',
        category: 'Form Management',
        subcategory: 'About KVK',
        parent: '/forms/about-kvk',
        siblings: [
            ENTITY_PATHS.KVK_INFRASTRUCTURE,
            ENTITY_PATHS.KVK_LAND_DETAILS,
        ],
        fields: FIELD_GROUPS.LAND_DETAILS,
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
