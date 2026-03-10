/**
 * Miscellaneous Routes Configuration
 *
 * Contains all route configurations for the "Miscellaneous" section.
 * Includes routes for Prevalent Diseases, Nehru Yuva Kendra, PPV & FRA Sensitization,
 * RAWE/FET Programme, and VIP Visitors.
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

]
