/**
 * Miscellaneous Routes Configuration
 *
 * Contains all route configurations for the "Miscellaneous" section.
 * Includes routes for Prevalent Diseases, Nehru Yuva Kendra, PPV & FRA Sensitization,
 * RAWE/FET Programme, VIP Visitors, Digital Information, Swachhta Bharat Abhiyaan, and Meetings.
 */

import { ROUTE_PATHS } from '../../constants/routePaths'
import { FIELD_GROUPS } from '../../constants/fieldNames'
import { ROUTE_SIBLING_GROUPS } from '../routeSiblingGroups'
import { RouteConfig } from './types'

export const miscellaneousRoutes: RouteConfig[] = [
    // Prevalent Diseases
    {
        path: ROUTE_PATHS.MISCELLANEOUS.DISEASES.CROPS,
        title: 'Prevalent diseases (Crops)',
        description: 'Prevalent diseases in crops',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'misc_prevalent_diseases_crops',
        fields: FIELD_GROUPS.MISC_DISEASES_CROPS,
        siblings: ROUTE_SIBLING_GROUPS.MISC_DISEASES,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.DISEASES.LIVESTOCK,
        title: 'Prevalent diseases (Livestock/Fishery)',
        description: 'Prevalent diseases in livestock and fishery',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'misc_prevalent_diseases_livestock',
        fields: FIELD_GROUPS.MISC_DISEASES_LIVESTOCK,
        siblings: ROUTE_SIBLING_GROUPS.MISC_DISEASES,
    },

    // Nehru Yuva Kendra
    {
        path: ROUTE_PATHS.MISCELLANEOUS.NEHRU_YUVA_KENDRA,
        title: 'Nehru Yuva Kendra',
        description: 'Nehru Yuva Kendra details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'misc_nyk_training',
        fields: FIELD_GROUPS.MISC_NEHRU_YUVA_KENDRA,
    },

    // PPV & FRA Sensitization
    {
        path: ROUTE_PATHS.MISCELLANEOUS.PPV_FRA.TRAINING,
        title: 'Training & Awareness Program',
        description: 'PPV & FRA training and awareness program',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'misc_ppv_fra_training',
        fields: FIELD_GROUPS.MISC_PPV_FRA_TRAINING,
        siblings: ROUTE_SIBLING_GROUPS.MISC_PPV_FRA,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.PPV_FRA.PLANT_VARIETIES,
        title: 'Details of Plant Varieties',
        description: 'Details of plant varieties',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'misc_ppv_fra_training',
        fields: FIELD_GROUPS.MISC_PPV_FRA_PLANT_VARIETIES,
        siblings: ROUTE_SIBLING_GROUPS.MISC_PPV_FRA,
    },

    // RAWE/FET Programme
    {
        path: ROUTE_PATHS.MISCELLANEOUS.RAWE_FET,
        title: 'RAWE/FET programme',
        description: 'RAWE/FET programme details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'misc_rawe_fet',
        fields: FIELD_GROUPS.MISC_RAWE_FET,
    },

    // VIP Visitors
    {
        path: ROUTE_PATHS.MISCELLANEOUS.VIP_VISITORS,
        title: 'VIP visitors',
        description: 'VIP visitors details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'misc_vip_visitors',
        fields: FIELD_GROUPS.MISC_VIP_VISITORS,
    },

    // Digital Information
    {
        path: ROUTE_PATHS.MISCELLANEOUS.DIGITAL.MOBILE_APP,
        title: 'Mobile App',
        description: 'Mobile app details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'digital_mobile_app',
        fields: FIELD_GROUPS.MISC_DIGITAL_MOBILE_APP,
        siblings: ROUTE_SIBLING_GROUPS.MISC_DIGITAL,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.DIGITAL.WEB_PORTAL,
        title: 'Web Portal',
        description: 'Web portal details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'digital_web_portal',
        fields: FIELD_GROUPS.MISC_DIGITAL_WEB_PORTAL,
        siblings: ROUTE_SIBLING_GROUPS.MISC_DIGITAL,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.DIGITAL.KISAN_SARATHI,
        title: 'Kisan Sarathi',
        description: 'Kisan Sarathi details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'digital_kisan_sarthi',
        fields: FIELD_GROUPS.MISC_DIGITAL_KISAN_SARATHI,
        siblings: ROUTE_SIBLING_GROUPS.MISC_DIGITAL,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.DIGITAL.KISAN_MOBILE_ADVISORY,
        title: 'Kisan Mobile Advisory',
        description: 'Kisan mobile advisory details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'digital_kisan_advisory',
        fields: FIELD_GROUPS.MISC_DIGITAL_KISAN_MOBILE_ADVISORY,
        siblings: ROUTE_SIBLING_GROUPS.MISC_DIGITAL,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.DIGITAL.OTHER_CHANNELS,
        title: 'Other channels',
        description: 'Other channels details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'digital_messages_other_channels',
        fields: FIELD_GROUPS.MISC_DIGITAL_OTHER_CHANNELS,
        siblings: ROUTE_SIBLING_GROUPS.MISC_DIGITAL,
    },

    // Swachhta Bharat Abhiyaan
    {
        path: ROUTE_PATHS.MISCELLANEOUS.SWACHHTA.SEWA,
        title: 'Swachhta hi Sewa',
        description: 'Swachhta hi Sewa details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'swachh_observation_sewa',
        fields: FIELD_GROUPS.MISC_SWACHHTA_SEWA,
        siblings: ROUTE_SIBLING_GROUPS.MISC_SWACHHTA,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.SWACHHTA.PAKHWADA,
        title: 'Swachta Pakhwada',
        description: 'Swachta Pakhwada details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'swachh_pakhwada',
        fields: FIELD_GROUPS.MISC_SWACHHTA_PAKHWADA,
        siblings: ROUTE_SIBLING_GROUPS.MISC_SWACHHTA,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.SWACHHTA.BUDGET,
        title: 'Budget expenditure',
        description: 'Swachhta budget expenditure details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'swachh_budget_expenditure',
        fields: FIELD_GROUPS.MISC_SWACHHTA_BUDGET,
        siblings: ROUTE_SIBLING_GROUPS.MISC_SWACHHTA,
    },

    // Meetings
    {
        path: ROUTE_PATHS.MISCELLANEOUS.MEETINGS.SAC,
        title: 'SAC Meetings',
        description: 'SAC meetings details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'meetings_sac',
        fields: FIELD_GROUPS.MISC_MEETINGS_SAC,
        siblings: ROUTE_SIBLING_GROUPS.MISC_MEETINGS,
    },
    {
        path: ROUTE_PATHS.MISCELLANEOUS.MEETINGS.OTHER,
        title: 'Other meetings',
        description: 'Other meetings details',
        category: 'Form Management',
        subcategory: 'Miscellaneous',
        parent: ROUTE_PATHS.MISCELLANEOUS.BASE,
        moduleCode: 'meetings_other_atari',
        fields: FIELD_GROUPS.MISC_MEETINGS_OTHER,
        siblings: ROUTE_SIBLING_GROUPS.MISC_MEETINGS,
    },
]
