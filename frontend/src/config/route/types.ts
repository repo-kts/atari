import { UserRole } from '../../types/auth'

/**
 * Route configuration interface
 * Defines the structure for all route configurations in the application
 */
export interface RouteConfig {
    path: string
    title: string
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
    // Authorization: which roles can create new items (undefined = all roles can create)
    canCreate?: UserRole[] | 'none'
    // Optional module code for Role Permission-based access control
    // (matches backend seedModulesForRolePermissions MODULES.moduleCode)
    moduleCode?: string
    // Optional component to render instead of DataManagementView
    component?: React.ComponentType<any>
    // Optional mock data for prototyping
    mockData?: any[]
}
