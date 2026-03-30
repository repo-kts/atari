/**
 * Admin Management Routes Configuration
 *
 * Contains all route configurations for the "Admin" section.
 * Includes routes for role management, user management, permissions, logs, and notifications.
 */

import { RouteConfig } from './types'

export const adminManagementRoutes: RouteConfig[] = [
    {
        path: '/role-view',
        title: 'Role Management',
        description: 'Manage system roles and permissions',
        category: 'Admin',
        moduleCode: 'role_management_roles',
    },
    {
        path: '/view-users',
        title: 'User Management',
        description: 'Manage system users',
        category: 'Admin',
        moduleCode: 'user_management_users',
    },
    {
        path: '/role-view/:roleId/permissions',
        title: 'Role Permissions',
        description: 'Edit role permissions',
        category: 'Admin',
        parent: '/role-view',
        moduleCode: 'role_management_roles',
    },
    {
        path: '/view-log-history',
        title: 'Log History',
        description: 'View system activity logs',
        category: 'Admin',
        moduleCode: 'log_history',
    },
    {
        path: '/view-email-notifications',
        title: 'Notifications',
        description: 'Manage system notifications',
        category: 'Admin',
        moduleCode: 'notifications',
    },
]
