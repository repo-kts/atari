/**
 * Digital Information Routes Configuration
 *
 * Contains all route configurations for the "Digital Information" section.
 */

import { ROUTE_PATHS } from '../../constants/routePaths'
import { FIELD_GROUPS } from '../../constants/fieldNames'
import { ROUTE_SIBLING_GROUPS } from '../routeSiblingGroups'
import { RouteConfig } from './types'

export const digitalInformationRoutes: RouteConfig[] = [
    {
        path: ROUTE_PATHS.DIGITAL_INFORMATION.MOBILE_APP,
        title: 'Mobile App',
        description: 'Mobile app details',
        category: 'Form Management',
        subcategory: 'Digital Information',
        parent: ROUTE_PATHS.DIGITAL_INFORMATION.BASE,
        moduleCode: 'digital_mobile_app',
        fields: FIELD_GROUPS.MISC_DIGITAL_MOBILE_APP,
        siblings: ROUTE_SIBLING_GROUPS.DIGITAL_INFORMATION,
    },
    {
        path: ROUTE_PATHS.DIGITAL_INFORMATION.WEB_PORTAL,
        title: 'Web Portal',
        description: 'Web portal details',
        category: 'Form Management',
        subcategory: 'Digital Information',
        parent: ROUTE_PATHS.DIGITAL_INFORMATION.BASE,
        moduleCode: 'digital_web_portal',
        fields: FIELD_GROUPS.MISC_DIGITAL_WEB_PORTAL,
        siblings: ROUTE_SIBLING_GROUPS.DIGITAL_INFORMATION,
    },
    {
        path: ROUTE_PATHS.DIGITAL_INFORMATION.KISAN_SARATHI,
        title: 'Kisan Sarathi',
        description: 'Kisan Sarathi details',
        category: 'Form Management',
        subcategory: 'Digital Information',
        parent: ROUTE_PATHS.DIGITAL_INFORMATION.BASE,
        moduleCode: 'digital_kisan_sarthi',
        fields: FIELD_GROUPS.MISC_DIGITAL_KISAN_SARATHI,
        siblings: ROUTE_SIBLING_GROUPS.DIGITAL_INFORMATION,
    },
    {
        path: ROUTE_PATHS.DIGITAL_INFORMATION.KISAN_MOBILE_ADVISORY,
        title: 'Kisan Mobile Advisory',
        description: 'Kisan mobile advisory details',
        category: 'Form Management',
        subcategory: 'Digital Information',
        parent: ROUTE_PATHS.DIGITAL_INFORMATION.BASE,
        moduleCode: 'digital_kisan_advisory',
        fields: FIELD_GROUPS.MISC_DIGITAL_KISAN_MOBILE_ADVISORY,
        siblings: ROUTE_SIBLING_GROUPS.DIGITAL_INFORMATION,
    },
    {
        path: ROUTE_PATHS.DIGITAL_INFORMATION.OTHER_CHANNELS,
        title: 'Other channels',
        description: 'Other channels details',
        category: 'Form Management',
        subcategory: 'Digital Information',
        parent: ROUTE_PATHS.DIGITAL_INFORMATION.BASE,
        moduleCode: 'digital_messages_other_channels',
        fields: FIELD_GROUPS.MISC_DIGITAL_OTHER_CHANNELS,
        siblings: ROUTE_SIBLING_GROUPS.DIGITAL_INFORMATION,
    },
]
