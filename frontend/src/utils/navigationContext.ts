import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { MenuItem, BreadcrumbItem, NavigationContext, NavigationResult } from '../types/navigation'
import { projectsMenuItems, findMenuItemByPath } from './menuConfig'

// Find item and build navigation context
const findItemWithContext = (
    items: MenuItem[],
    targetPath: string,
    parentPath: MenuItem[] = []
): NavigationResult => {
    for (const item of items) {
        const currentPath = [...parentPath, item]

        // Exact match
        if (item.path === targetPath) {
            return {
                item,
                path: currentPath,
                siblings: items,
                parent: parentPath.length > 0 ? parentPath[parentPath.length - 1] : null
            }
        }

        // Check if targetPath starts with item's path (for nested routes)
        if (item.path !== '#' && targetPath.startsWith(item.path + '/')) {
            return {
                item,
                path: currentPath,
                siblings: items,
                parent: parentPath.length > 0 ? parentPath[parentPath.length - 1] : null
            }
        }

        // Recursively check children
        if (item.children) {
            const result = findItemWithContext(item.children, targetPath, currentPath)
            if (result.item) {
                return result
            }
        }
    }

    return { item: null, path: [], siblings: [], parent: null }
}

// Build breadcrumb items from path
const buildBreadcrumbs = (path: MenuItem[], currentPath: string, includeBase: boolean = true): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []

    if (includeBase) {
        breadcrumbs.push({
            label: 'Form Management',
            path: '/forms',
            level: 0
        })
        breadcrumbs.push({
            label: 'Form Management',
            path: '/forms',
            level: 0
        })

        const segments = currentPath.split('/')

        // Handle Achievements
        if (segments.includes('achievements')) {
            breadcrumbs.push({
                label: 'Achievements',
                path: '/forms/achievements',
                level: 1
            })
        }

        // Handle Performance Indicators
        if (segments.includes('performance')) {
            breadcrumbs.push({
                label: 'Performance Indicators',
                path: '/forms/performance',
                level: 1
            })
        }

        // Map for consistent naming
        const segmentMap: Record<string, string> = {
            'oft': 'OFT',
            'fld': 'FLD',
            'publications': 'Publications',
            'trainings': 'Trainings',
            'extension-activities': 'Extension Activities',
            'other-extension': 'Other Extension Activities',
            'projects': 'Projects',
            'hrd': 'HRD',
            'soil-equipment': 'Soil Equipment',
            'soil-analysis': 'Soil Analysis',
            'world-soil-day': 'World Soil Day',
            'award-recognition': 'Award recognition',
            'linkages': 'Linkages',
            'functional-linkage': 'Functional Linkage',
            'special-programmes': 'Special Programmes',
            'impact': 'Impact',
            'kvk-activities': 'Impact of KVK Activities',
            'entrepreneurship': 'Entrepreneurship',
            'success-stories': 'Success Stories',
            'district-village': 'District and Village Performance',
            'district-level': 'District Level Data',
            'operational-area': 'Operational Area Details',
            'village-adoption': 'Village Adoption Programme',
            'priority-thrust': 'Priority Thrust Area',
            'infrastructure': 'Infrastructure Performance',
            'financial': 'Financial Performance'
        }
        // Determine the starting index for dynamic segments
        let rootIndex = -1
        let rootPath = ''

        if (segments.includes('achievements')) {
            rootIndex = segments.indexOf('achievements')
            rootPath = '/forms/achievements'
        } else if (segments.includes('performance')) {
            rootIndex = segments.indexOf('performance')
            rootPath = '/forms/performance'
        }

        // Add all segments after the root section
        if (rootIndex !== -1 && segments.length > rootIndex + 1) {
            let currentBuildPath = rootPath

            for (let i = rootIndex + 1; i < segments.length; i++) {
                const segment = segments[i]
                currentBuildPath += `/${segment}`

                const label = segmentMap[segment] || (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '))

                breadcrumbs.push({
                    label,
                    path: currentBuildPath,
                    level: breadcrumbs.length
                })
            }
        }
    }

    path.forEach((item) => {
        breadcrumbs.push({
            label: item.label,
            path: item.path === '#' ? '' : item.path,
            level: breadcrumbs.length
        })
    })

    return breadcrumbs
}

// Custom hook for navigation context
export const useNavigationContext = (
    menuItems: MenuItem[] = projectsMenuItems,
    customPath?: string
): NavigationContext => {
    const location = useLocation()
    const currentPath = customPath || location.pathname

    return useMemo(() => {
        const result = findItemWithContext(menuItems, currentPath)

        return {
            currentPath,
            breadcrumbs: buildBreadcrumbs(result.path, currentPath).filter((v, i, a) => a.findIndex(t => (t.path === v.path)) === i),
            siblings: result.siblings,
            parent: result.parent || undefined,
            children: result.item?.children,
            currentItem: result.item || undefined
        }
    }, [menuItems, currentPath])
}

// Get sibling navigation items (prev/next)
export const getSiblingNavigation = (
    siblings: MenuItem[],
    currentPath: string
): { prev: MenuItem | null; next: MenuItem | null; current: MenuItem | null; currentIndex: number } => {
    const currentIndex = siblings.findIndex(s => s.path === currentPath)

    if (currentIndex === -1) {
        return { prev: null, next: null, current: null, currentIndex: -1 }
    }

    return {
        prev: currentIndex > 0 ? siblings[currentIndex - 1] : null,
        next: currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null,
        current: siblings[currentIndex],
        currentIndex
    }
}

// Check if a path is active (exact or starts with)
export const isPathActive = (itemPath: string, currentPath: string): boolean => {
    if (itemPath === '#') return false
    if (itemPath === currentPath) return true
    return currentPath.startsWith(itemPath + '/')
}

// Check if any child is active
export const hasActiveChild = (item: MenuItem, currentPath: string): boolean => {
    if (!item.children) return false

    for (const child of item.children) {
        if (isPathActive(child.path, currentPath)) return true
        if (hasActiveChild(child, currentPath)) return true
    }

    return false
}

// Export the findMenuItemByPath for external use
export { findMenuItemByPath }
