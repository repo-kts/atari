import React, { useEffect } from 'react'
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
import { Dashboard } from './components/dashboard/Dashboard'
import { Login } from './pages/Login'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AllMasters } from './components/dashboard/AllMasters'
import { FormManagement } from './components/dashboard/FormManagement'
import { MasterView } from './components/dashboard/masters/MasterView'
import { RoleManagement } from './pages/RoleManagement'
import { RolePermissionEditor } from './pages/RolePermissionEditor'
import { UserManagement } from './pages/UserManagement'
import { ModuleImages } from './pages/ModuleImages'
import { Targets } from './pages/Targets'
import { LogHistory } from './pages/LogHistory'
import { Notifications } from './pages/Notifications'
import { Reports } from './pages/Reports'
import { ViewKVKDetails } from './components/kvk/KVKDetails/ViewKVKDetails'
import { BankAccountList } from './components/kvk/BankAccounts/BankAccountList'
import { StaffList } from './components/kvk/Staff/StaffList'
import { AddStaff } from './components/kvk/Staff/AddStaff'
import { KVKListView } from './components/admin/ViewKVK/KVKListView'
import { KVKDetailView } from './components/admin/ViewKVK/KVKDetailView'
import { AdminKVKRedirect } from './components/common/AdminKVKRedirect'
import { DynamicFormPage } from './components/common/DynamicFormPage'
import { ProjectsOverview } from './components/dashboard/forms/projects/ProjectsOverview'
import { VehicleList } from './components/kvk/Vehicle/VehicleList'
import { VehicleDetailsList } from './components/kvk/Vehicle/VehicleDetailsList'
import { EquipmentList } from './components/kvk/Equipment/EquipmentList'
import { EquipmentDetailsList } from './components/kvk/Equipment/EquipmentDetailsList'
import { InfrastructureList } from './components/kvk/Infrastructure/InfrastructureList'

// Import route config for dynamic rendering
import { projectsRoutes, allMastersRoutes, aboutKvkRoutes, viewKvkRoutes } from './config/routeConfig'
import { getAllMastersMockData } from './mocks/allMastersMockData'
import { RouteWrapper } from './components/common/RouteWrapper'

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
                                    <MasterView
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

                    {/* About KVK Routes - Dynamic */}
                    {aboutKvkRoutes.map(route => {
                        let Component: React.ComponentType<any> | null = null

                        if (route.path === '/forms/about-kvk/bank-account') {
                            Component = BankAccountList
                        } else if (
                            route.path === '/forms/about-kvk/employee-details' ||
                            route.path === '/forms/about-kvk/staff-transferred'
                        ) {
                            Component = StaffList
                        } else if (route.path === '/forms/about-kvk/details') {
                            Component = ViewKVKDetails
                        } else if (route.path === '/forms/about-kvk/infrastructure') {
                            Component = InfrastructureList
                        } else if (route.path === '/forms/about-kvk/vehicles') {
                            Component = VehicleList
                        } else if (route.path === '/forms/about-kvk/vehicle-details') {
                            Component = VehicleDetailsList
                        } else if (route.path === '/forms/about-kvk/equipments') {
                            Component = EquipmentList
                        } else if (
                            route.path === '/forms/about-kvk/equipment-details' ||
                            route.path === '/forms/about-kvk/farm-implements'
                        ) {
                            Component = EquipmentDetailsList
                        } else if (route.path === '/forms/about-kvk/employee-details/add') {
                            Component = AddStaff
                        }

                        if (!Component) return null

                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    <RouteWrapper>
                                        <Component />
                                    </RouteWrapper>
                                }
                            />
                        )
                    })}

                    {/* View KVK Routes - Dynamic */}
                    {viewKvkRoutes.map(route => {
                        let Component: React.ComponentType<any> | null = null

                        if (route.path === '/forms/about-kvk/view-kvks') {
                            Component = KVKListView
                        } else if (
                            route.path === '/forms/about-kvk/view-kvks/:id' ||
                            route.path === '/forms/about-kvk/view-kvks/:id/bank' ||
                            route.path === '/forms/about-kvk/view-kvks/:id/employees' ||
                            route.path === '/forms/about-kvk/view-kvks/:id/vehicles' ||
                            route.path === '/forms/about-kvk/view-kvks/:id/equipments'
                        ) {
                            Component = KVKDetailView
                        }

                        if (!Component) return null

                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={<Component />}
                            />
                        )
                    })}

                    {/* Legacy About KVK route */}
                    <Route path="/kvk/staff/add" element={<AddStaff />} />

                    {/* Legacy routes - redirect to new paths */}
                    <Route path="/kvk/details" element={<Navigate to="/forms/about-kvk/details" replace />} />
                    <Route path="/kvk/bank-accounts" element={<Navigate to="/forms/about-kvk/bank-account" replace />} />
                    <Route path="/kvk/staff" element={<Navigate to="/forms/about-kvk/employee-details" replace />} />
                    <Route path="/admin/kvk" element={<Navigate to="/forms/about-kvk/view-kvks" replace />} />
                    <Route path="/admin/kvk/:id" element={<AdminKVKRedirect />} />
                    <Route path="/admin/bank-accounts" element={<Navigate to="/forms/about-kvk/bank-account" replace />} />
                    <Route path="/admin/staff" element={<Navigate to="/forms/about-kvk/employee-details" replace />} />

                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
