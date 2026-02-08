import { useEffect } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
} from 'react-router-dom'
import { setOnSessionExpired } from './services/api'
import { useAuthStore } from './stores/authStore'
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
import { ModuleImages } from './pages/features/ModuleImages'
import { Targets } from './pages/features/Targets'
import { LogHistory } from './pages/admin/LogHistory'
import { Notifications } from './pages/admin/Notifications'
import { Reports } from './pages/features/Reports'
import { AdminKVKRedirect } from './components/common/AdminKVKRedirect'
import { DynamicFormPage } from './components/common/DynamicFormPage'
import { ProjectsOverview } from './pages/dashboard/forms/projects/ProjectsOverview'

// Import route config for dynamic rendering
import { projectsRoutes, allMastersRoutes, aboutKvkRoutes, viewKvkRoutes } from './config/routeConfig'
import { ENTITY_PATHS } from './constants/entityTypes'
import { getAllMastersMockData } from './mocks/allMastersMockData'


function App() {
    // When access token expires and refresh fails, clear auth state so user is sent to login
    useEffect(() => {
        setOnSessionExpired(() => {
            useAuthStore.getState().logout()
        })
    }, [])

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

                    {/* All Masters Router - Restricted to Admin Roles */}
                    <Route element={<ProtectedRoute requiredRole={['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin']}><Outlet /></ProtectedRoute>}>
                        {allMastersRoutes.map(route => (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    <DataManagementView
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                        mockData={getAllMastersMockData(route.path)}
                                    />
                                }
                            />
                        ))}
                        <Route path="/all-master/*" element={<AllMasters />} />
                    </Route>

                    {/* Admin Pages - Restricted to Admin Roles */}
                    <Route element={<ProtectedRoute requiredRole={['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin']}><Outlet /></ProtectedRoute>}>
                        <Route path="/role-view" element={<RoleManagement />} />
                        <Route path="/role-view/:roleId/permissions" element={<RolePermissionEditor />} />
                        <Route path="/view-users" element={<UserManagement />} />
                        <Route path="/view-log-history" element={<LogHistory />} />
                        <Route path="/view-email-notifications" element={<Notifications />} />
                    </Route>

                    {/* Features accessible to Admin and KVK */}
                    <Route path="/module-images" element={<ModuleImages />} />
                    <Route path="/targets" element={<Targets />} />
                    <Route path="/all-reports" element={<Reports />} />

                    {/* Form Management */}
                    <Route path="/forms" element={<FormManagement />} />

                    {/* Projects Overview */}
                    <Route path="/forms/achievements/projects" element={<ProjectsOverview />} />

                    {/* Dynamic Project Form Routes - All rendered by DynamicFormPage */}
                    {projectsRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<DynamicFormPage />}
                        />
                    ))}

                    {/* Form Management Catch-all */}
                    <Route path="/forms/*" element={<FormManagement />} />

                    {/* About KVK Routes - Mapping approach */}
                    {aboutKvkRoutes.map(route => {
                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    <DataManagementView
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                }
                            />
                        )
                    })}

                    {/* View KVK Routes - Mapping approach */}
                    {/* {viewKvkRoutes.map(route => {
                        const Component = viewKvkComponentMap[route.path]
                        if (!Component) return null

                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    <Component
                                        title={route.title}
                                        description={route.description}
                                        fields={route.fields}
                                    />
                                }
                            />
                        )
                    })} */}


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

export default App
