/**
 * Route Configuration Index
 *
 * Central export point for all route configurations and helper functions.
 * This file aggregates all route modules and provides utility functions for route management.
 */

import { allMastersRoutes } from './allMasters'
import { aboutKvkRoutes, viewKvkRoutes } from './aboutKvk'
import { projectsRoutes } from './projects'
import { achievementsRoutes } from './achievements'
import { performanceIndicatorRoutes } from './performanceIndicator'
import { miscellaneousRoutes } from './miscellaneous'
import { adminManagementRoutes } from './adminManagement'
import { featureRoutes } from './features'
import { RouteConfig } from './types'

// Re-export types
export type { RouteConfig } from './types'

// Re-export individual route arrays for direct imports
export {
    allMastersRoutes,
    aboutKvkRoutes,
    viewKvkRoutes,
    projectsRoutes,
    achievementsRoutes,
    performanceIndicatorRoutes,
    miscellaneousRoutes,
    adminManagementRoutes,
    featureRoutes,
}

// Combine all routes into a single array
export const allRoutes: RouteConfig[] = [
    ...allMastersRoutes,
    ...projectsRoutes,
    ...aboutKvkRoutes,
    ...viewKvkRoutes,
    ...adminManagementRoutes,
    ...featureRoutes,
    ...achievementsRoutes,
    ...performanceIndicatorRoutes,
    ...miscellaneousRoutes,
]

/**
 * Get route configuration for a given path
 * Handles exact matches, dynamic routes (with :id), and prefix matching
 */
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

/**
 * Get module code for a path (for permission-based visibility).
 * Returns undefined if no moduleCode.
 */
export const getModuleCodeForPath = (path: string): string | undefined => {
    const config = getRouteConfig(path)
    return config?.moduleCode
}

/**
 * Get all routes filtered by category
 */
export const getRoutesByCategory = (category: string): RouteConfig[] => {
    return allRoutes.filter(r => r.category === category)
}

/**
 * Get all routes filtered by subcategory
 */
export const getRoutesBySubcategory = (subcategory: string): RouteConfig[] => {
    return allRoutes.filter(r => r.subcategory === subcategory)
}

/**
 * Get sibling routes for a given path (for tab navigation)
 */
export const getSiblingRoutes = (path: string): RouteConfig[] => {
    const config = getRouteConfig(path)
    if (!config?.siblings) return []
    return config.siblings.map(p => getRouteConfig(p)).filter(Boolean) as RouteConfig[]
}

/**
 * Get breadcrumbs for a given path
 * Builds breadcrumb trail based on route configuration
 */
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
