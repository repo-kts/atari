/**
 * Feature Routes Configuration
 *
 * Contains all route configurations for the "Features" section.
 * Includes routes for success stories, module images, targets, and reports.
 */

import { RouteConfig } from './types'

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
        path: '/module-images/create',
        title: 'Add Images',
        description: 'Upload category-wise photographs',
        category: 'Features',
        parent: '/module-images',
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
        path: '/targets/create',
        title: 'Add Targets',
        description: 'Create a new target',
        category: 'Features',
        parent: '/targets',
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
