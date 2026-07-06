import type { ComponentType } from 'react'
import { UserRole } from '../../types/auth'

/**
 * Route configuration interface
 * Defines the structure for all route configurations in the application
 */
export interface RouteConfig {
    path: string
    title: string
    // Optional shorter label shown in the breadcrumb trail when `title` is long.
    // Falls back to `title` when omitted.
    breadcrumbLabel?: string
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
    // Optional frontend-only default sort order. Use dependency fields first,
    // then the master field, while keeping the visible table columns unchanged.
    defaultSortFields?: readonly string[] | string[]
    // Optional: dedupe the table to one row per distinct value of this field
    // (table display only; form/backend unaffected). Used by Institute/Host masters.
    uniqueByField?: string
    // Authorization: which roles can create new items (undefined = all roles can create)
    canCreate?: UserRole[] | 'none'
    // Optional module code for Role Permission-based access control
    // (matches backend seedModulesForRolePermissions MODULES.moduleCode)
    moduleCode?: string
    // Optional component to render instead of DataManagementView
    component?: ComponentType<any>
    // Optional mock data for prototyping
    mockData?: any[]
}
