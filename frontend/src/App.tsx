import { useEffect } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { setOnSessionExpired } from './services/api'
import { AuthProvider, getLogoutFunction } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/dashboard/Dashboard'
import { Login } from './pages/auth/Login'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AllMasters } from './pages/dashboard/AllMasters'
import { FormManagement } from './pages/dashboard/FormManagement'
import { DataManagementView } from './pages/dashboard/shared/DataManagementView'
import { RoleManagement } from './pages/admin/RoleManagement'
import { RolePermissionEditor } from './pages/admin/RolePermissionEditor'
import { UserManagement } from './pages/admin/UserManagement'
import { UserPermissionEditor } from './pages/admin/UserPermissionEditor'
import { ModuleImages } from './pages/features/ModuleImages'
import { Gallery } from './pages/features/Gallery'
import { Targets } from './pages/features/Targets'
import { LogHistory } from './pages/admin/LogHistory'
import { Notifications } from './pages/admin/Notifications'
import { Reports } from './pages/features/Reports'
import { FormSummary } from './pages/features/FormSummary'
import { TechnicalAchievementSummary } from './pages/dashboard/forms/TechnicalAchievementSummary'
import { AdminKVKRedirect } from './components/common/AdminKVKRedirect'
import {
    projectsRoutes,
    allMastersRoutes,
    aboutKvkRoutes,
    achievementsRoutes,
    performanceIndicatorRoutes,
    miscellaneousRoutes,
    digitalInformationRoutes,
    swachhtaBharatAbhiyaanRoutes,
    meetingsRoutes
} from './config/route'
import type { UserRole } from './types/auth'
import { ENTITY_PATHS } from './constants/entityConstants'

import { ADMIN_ROLES as _ADMIN_ROLES } from './constants/roleHierarchy'

const ADMIN_ROLES: UserRole[] = [..._ADMIN_ROLES]
const ALL_MASTER_BLOCKED_ROLES = ['kvk_admin', 'kvk_amdin']

function AppRoutes() {
    const queryClient = useQueryClient()

    // When access token expires and refresh fails, clear auth state so user is sent to login
    useEffect(() => {
        const logout = getLogoutFunction(queryClient)
        setOnSessionExpired(logout)
    }, [queryClient])

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                        path="/form-summary"
                        element={
                            <ProtectedRoute requiredModuleCode="form_summary_status">
                                <FormSummary />
                            </ProtectedRoute>
                        }
                    />

                    {/* All Masters Routes - each route guards its own module permission */}
                    {allMastersRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute requiredModuleCode={route.moduleCode} deniedRoles={ALL_MASTER_BLOCKED_ROLES}>
                                    <DataManagementView
                                        key={route.path}
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    ))}
                    <Route
                        path="/all-master/*"
                        element={
                            <ProtectedRoute requiredRole={ADMIN_ROLES} deniedRoles={ALL_MASTER_BLOCKED_ROLES}>
                                <AllMasters />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Pages - Restricted to Admin Roles + module-based VIEW permissions */}
                    <Route
                        path="/role-view"
                        element={
                            <ProtectedRoute requiredModuleCode="role_management_roles">
                                <RoleManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/role-view/:roleId/permissions"
                        element={
                            <ProtectedRoute requiredModuleCode="role_management_roles">
                                <RolePermissionEditor />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/view-users"
                        element={
                            <ProtectedRoute requiredModuleCode="user_management_users">
                                <UserManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/view-users/:userId/permissions"
                        element={
                            <ProtectedRoute requiredModuleCode="user_management_users">
                                <UserPermissionEditor />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/view-log-history"
                        element={
                            <ProtectedRoute requiredModuleCode="log_history">
                                <LogHistory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/view-email-notifications"
                        element={
                            <ProtectedRoute requiredModuleCode="notifications">
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />

                    {/* Features - module-based VIEW permissions (any role with those permissions) */}
                    <Route
                        path="/module-images"
                        element={
                            <ProtectedRoute requiredModuleCode="module_images">
                                <ModuleImages />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/module-images/create"
                        element={
                            <ProtectedRoute requiredModuleCode="module_images">
                                <ModuleImages />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/gallery"
                        element={
                            <ProtectedRoute requiredModuleCode="module_images">
                                <Gallery />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/targets"
                        element={
                            <ProtectedRoute requiredModuleCode="targets">
                                <Targets />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/targets/create"
                        element={
                            <ProtectedRoute requiredModuleCode="targets">
                                <Targets />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/all-reports"
                        element={
                            <ProtectedRoute requiredModuleCode="reports">
                                <Reports />
                            </ProtectedRoute>
                        }
                    />

                    {/* Form Management */}
                    <Route path="/forms" element={<FormManagement />} />
                    <Route
                        path="/forms/achievements/technical-summary"
                        element={
                            <ProtectedRoute requiredModuleCode="achievements_technical_achievement_summary">
                                <TechnicalAchievementSummary />
                            </ProtectedRoute>
                        }
                    />

                    {/* Dynamic Project Form Routes - All rendered by DynamicFormPage */}
                    {projectsRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                    <DataManagementView
                                        key={route.path}
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    ))}

                    {achievementsRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                    <DataManagementView
                                        key={route.path}
                                        title={route.title}
                                        fields={route.fields}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    ))}

                    {/* Performance Indicator Routes */}
                    {performanceIndicatorRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                    <DataManagementView
                                        key={route.path}
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    ))}

                    {/* Miscellaneous Routes */}
                    {miscellaneousRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                    <DataManagementView
                                        key={route.path}
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    ))}

                    {/* Digital Information Routes */}
                    {digitalInformationRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                    <DataManagementView
                                        key={route.path}
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    ))}

                    {/* Swachhta Bharat Abhiyaan Routes */}
                    {swachhtaBharatAbhiyaanRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                    <DataManagementView
                                        key={route.path}
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    ))}

                    {/* Meetings Routes */}
                    {meetingsRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                    <DataManagementView
                                        key={route.path}
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    ))}

                    {/* Success Stories - permission gated before the catch-all */}
                    <Route
                        path="/forms/success-stories"
                        element={
                            <ProtectedRoute requiredModuleCode="form_management_success_stories">
                                <FormManagement />
                            </ProtectedRoute>
                        }
                    />

                    {/* Form Management Catch-all */}
                    <Route path="/forms/*" element={<FormManagement />} />

                    {/* About KVK Routes - Mapping approach */}
                    {aboutKvkRoutes.map(route => {
                        const Component = route.component
                        if (Component) {
                            return (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    element={
                                        <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                            <Component />
                                        </ProtectedRoute>
                                    }
                                />
                            )
                        }

                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    <ProtectedRoute requiredModuleCode={route.moduleCode}>
                                        <DataManagementView
                                            key={route.path}
                                            title={route.title}
                                            description={route.description}
                                            fields={route.fields}
                                        />
                                    </ProtectedRoute>
                                }
                            />
                        )
                    })}
                    {/* Legacy About KVK route */}
                    <Route path="/kvk/staff/add" element={<Navigate to={ENTITY_PATHS.KVK_EMPLOYEES} replace />} />

                    {/* Legacy routes - redirect to new paths */}
                    <Route path="/kvk/details" element={<Navigate to={ENTITY_PATHS.KVK_DETAILS} replace />} />
                    <Route path="/kvk/bank-accounts" element={<Navigate to={ENTITY_PATHS.KVK_BANK_ACCOUNT} replace />} />
                    <Route path="/kvk/staff" element={<Navigate to={ENTITY_PATHS.KVK_EMPLOYEES} replace />} />
                    <Route path="/admin/kvk" element={<Navigate to={ENTITY_PATHS.KVK_VIEW} replace />} />
                    <Route path="/admin/kvk/:id" element={<AdminKVKRedirect />} />
                    <Route path="/admin/bank-accounts" element={<Navigate to={ENTITY_PATHS.KVK_BANK_ACCOUNT} replace />} />
                    <Route path="/admin/staff" element={<Navigate to={ENTITY_PATHS.KVK_EMPLOYEES} replace />} />

                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App
