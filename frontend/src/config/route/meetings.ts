/**
 * Meetings Routes Configuration
 *
 * Contains all route configurations for the "Meetings" section.
 */

import { ROUTE_PATHS } from '../../constants/routePaths'
import { FIELD_GROUPS } from '../../constants/fieldNames'
import { ROUTE_SIBLING_GROUPS } from '../routeSiblingGroups'
import { RouteConfig } from './types'

export const meetingsRoutes: RouteConfig[] = [
    {
        path: ROUTE_PATHS.MEETINGS.SAC,
        title: 'SAC Meetings',
        description: 'SAC meetings details',
        category: 'Form Management',
        subcategory: 'Meetings',
        parent: ROUTE_PATHS.MEETINGS.BASE,
        moduleCode: 'meetings_sac',
        fields: FIELD_GROUPS.MISC_MEETINGS_SAC,
        siblings: ROUTE_SIBLING_GROUPS.MEETINGS,
    },
    {
        path: ROUTE_PATHS.MEETINGS.OTHER,
        title: 'Other meetings',
        description: 'Other meetings details',
        category: 'Form Management',
        subcategory: 'Meetings',
        parent: ROUTE_PATHS.MEETINGS.BASE,
        moduleCode: 'meetings_other_atari',
        fields: FIELD_GROUPS.MISC_MEETINGS_OTHER,
        siblings: ROUTE_SIBLING_GROUPS.MEETINGS,
    },
]
