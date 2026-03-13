/**
 * Swachhta Bharat Abhiyaan Routes Configuration
 *
 * Contains all route configurations for the "Swachhta Bharat Abhiyaan" section.
 */

import { ROUTE_PATHS } from '../../constants/routePaths'
import { FIELD_GROUPS } from '../../constants/fieldNames'
import { ROUTE_SIBLING_GROUPS } from '../routeSiblingGroups'
import { RouteConfig } from './types'

export const swachhtaBharatAbhiyaanRoutes: RouteConfig[] = [
    {
        path: ROUTE_PATHS.SWACHHTA_BHARAT_ABHIYAAN.SEWA,
        title: 'Swachhta hi Sewa',
        description: 'Swachhta hi Sewa details',
        category: 'Form Management',
        subcategory: 'Swachhta Bharat Abhiyaan',
        parent: ROUTE_PATHS.SWACHHTA_BHARAT_ABHIYAAN.BASE,
        // moduleCode: 'swachh_observation_sewa',
        fields: FIELD_GROUPS.MISC_SWACHHTA_SEWA,
        siblings: ROUTE_SIBLING_GROUPS.SWACHHTA_BHARAT_ABHIYAAN,
    },
    {
        path: ROUTE_PATHS.SWACHHTA_BHARAT_ABHIYAAN.PAKHWADA,
        title: 'Swachta Pakhwada',
        description: 'Swachta Pakhwada details',
        category: 'Form Management',
        subcategory: 'Swachhta Bharat Abhiyaan',
        parent: ROUTE_PATHS.SWACHHTA_BHARAT_ABHIYAAN.BASE,
        // moduleCode: 'swachh_pakhwada',
        fields: FIELD_GROUPS.MISC_SWACHHTA_PAKHWADA,
        siblings: ROUTE_SIBLING_GROUPS.SWACHHTA_BHARAT_ABHIYAAN,
    },
    {
        path: ROUTE_PATHS.SWACHHTA_BHARAT_ABHIYAAN.BUDGET,
        title: 'Budget expenditure',
        description: 'Swachhta budget expenditure details',
        category: 'Form Management',
        subcategory: 'Swachhta Bharat Abhiyaan',
        parent: ROUTE_PATHS.SWACHHTA_BHARAT_ABHIYAAN.BASE,
        // moduleCode: 'swachh_budget_expenditure',
        fields: FIELD_GROUPS.MISC_SWACHHTA_BUDGET,
        siblings: ROUTE_SIBLING_GROUPS.SWACHHTA_BHARAT_ABHIYAAN,
    },
]
