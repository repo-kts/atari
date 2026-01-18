import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './components/dashboard/Dashboard'
import { Login } from './pages/Login'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AllMasters } from './components/dashboard/AllMasters'
import { FormManagement } from './components/dashboard/FormManagement'
import { ViewZones } from './components/dashboard/ViewZones'
import { ViewStates } from './components/dashboard/ViewStates'
import { ViewOrganizations } from './components/dashboard/ViewOrganizations'
import { ViewDistricts } from './components/dashboard/ViewDistricts'
import { MasterView } from './components/dashboard/masters/MasterView'
import { RoleManagement } from './pages/RoleManagement'
import { UserManagement } from './pages/UserManagement'
import { ModuleImages } from './pages/ModuleImages'
import { Targets } from './pages/Targets'
import { LogHistory } from './pages/LogHistory'
import { Notifications } from './pages/Notifications'
import { Reports } from './pages/Reports'
import { ViewKVKDetails } from './components/kvk/KVKDetails/ViewKVKDetails'
import { BankAccountList } from './components/kvk/BankAccounts/BankAccountList'
import { StaffList } from './components/kvk/Staff/StaffList'
import { KVKListView } from './components/admin/ViewKVK/KVKListView'
import { KVKDetailView } from './components/admin/ViewKVK/KVKDetailView'
import { AdminKVKRedirect } from './components/common/AdminKVKRedirect'


function App() {
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
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* All Masters Routes */}
                    <Route path="/all-master" element={<AllMasters />} />
                    <Route path="/all-master/basic" element={<AllMasters />} />
                    <Route path="/all-master/oft-fld" element={<AllMasters />} />
                    <Route path="/all-master/training-extension" element={<AllMasters />} />
                    <Route path="/all-master/production-projects" element={<AllMasters />} />
                    <Route path="/all-master/publications" element={<AllMasters />} />

                    {/* Basic Masters */}
                    <Route path="/all-master/zones" element={<ViewZones />} />
                    <Route path="/all-master/states" element={<ViewStates />} />
                    <Route path="/all-master/organizations" element={<ViewOrganizations />} />
                    <Route path="/all-master/universities" element={<ViewOrganizations />} />
                    <Route path="/all-master/districts" element={<ViewDistricts />} />

                    {/* OFT Master */}
                    <Route path="/all-master/oft/subject" element={<MasterView title="Subject Master" fields={['name']} />} />
                    <Route path="/all-master/oft/thematic-area" element={<MasterView title="Thematic Area Master" fields={['name']} />} />

                    {/* FLD Master */}
                    <Route path="/all-master/fld/sector" element={<MasterView title="Sector Master" fields={['name']} />} />
                    <Route path="/all-master/fld/thematic-area" element={<MasterView title="FLD Thematic Area Master" fields={['name']} />} />
                    <Route path="/all-master/fld/category" element={<MasterView title="Category Master" fields={['name']} />} />
                    <Route path="/all-master/fld/sub-category" element={<MasterView title="Sub-category Master" fields={['name']} />} />
                    <Route path="/all-master/fld/crop" element={<MasterView title="Crop Master" fields={['name']} />} />

                    {/* CFLD Master */}
                    <Route path="/all-master/cfld-crop" element={<MasterView title="CFLD Crop Master" fields={['name']} />} />

                    {/* Training Master */}
                    <Route path="/all-master/training-type" element={<MasterView title="Training Type Master" fields={['name']} />} />
                    <Route path="/all-master/training-area" element={<MasterView title="Training Area Master" fields={['name']} />} />
                    <Route path="/all-master/training-thematic" element={<MasterView title="Training Thematic Area Master" fields={['name']} />} />

                    {/* Extension & Events */}
                    <Route path="/all-master/extension-activity" element={<MasterView title="Extension Activity Master" fields={['name']} />} />
                    <Route path="/all-master/other-extension-activity" element={<MasterView title="Other Extension Activity Master" fields={['name']} />} />
                    <Route path="/all-master/events" element={<MasterView title="Events Master" fields={['name']} />} />

                    {/* Production */}
                    <Route path="/all-master/product-category" element={<MasterView title="Product Category Master" fields={['name']} />} />
                    <Route path="/all-master/product-type" element={<MasterView title="Product Type Master" fields={['name']} />} />
                    <Route path="/all-master/product" element={<MasterView title="Products Master" fields={['name']} />} />

                    {/* Climate Resilient Agriculture */}
                    <Route path="/all-master/cra-croping-system" element={<MasterView title="Cropping System Master" fields={['name']} />} />
                    <Route path="/all-master/cra-farming-system" element={<MasterView title="Farming System Master" fields={['name']} />} />

                    {/* ARYA */}
                    <Route path="/all-master/arya-enterprise" element={<MasterView title="ARYA Enterprise Master" fields={['name']} />} />

                    {/* Publications */}
                    <Route path="/all-master/publication-item" element={<MasterView title="Publication Items Master" fields={['name']} />} />

                    {/* Catch-all for all-master routes */}
                    <Route path="/all-master/*" element={<AllMasters />} />
                    <Route
                        path="/role-view"
                        element={<RoleManagement />}
                    />
                    <Route
                        path="/view-users"
                        element={<UserManagement />}
                    />
                    <Route
                        path="/module-images"
                        element={<ModuleImages />}
                    />
                    <Route
                        path="/targets"
                        element={<Targets />}
                    />
                    <Route
                        path="/view-log-history"
                        element={<LogHistory />}
                    />
                    <Route
                        path="/view-email-notifications"
                        element={<Notifications />}
                    />
                    <Route
                        path="/all-reports"
                        element={<Reports />}
                    />
                    <Route
                        path="/forms"
                        element={<FormManagement />}
                    />
                    <Route
                        path="/forms/*"
                        element={<FormManagement />}
                    />

                    {/* About KVK Routes - Nested under /forms/about-kvk/* */}
                    <Route
                        path="/forms/about-kvk/view-kvks"
                        element={<KVKListView />}
                    />
                    <Route
                        path="/forms/about-kvk/view-kvks/:id"
                        element={<KVKDetailView />}
                    />
                    <Route
                        path="/forms/about-kvk/bank-account"
                        element={<BankAccountList />}
                    />
                    <Route
                        path="/forms/about-kvk/employee-details"
                        element={<StaffList />}
                    />
                    <Route
                        path="/forms/about-kvk/details"
                        element={<ViewKVKDetails />}
                    />

                    {/* Legacy routes - redirect to new paths */}
                    <Route
                        path="/kvk/details"
                        element={<Navigate to="/forms/about-kvk/details" replace />}
                    />
                    <Route
                        path="/kvk/bank-accounts"
                        element={<Navigate to="/forms/about-kvk/bank-account" replace />}
                    />
                    <Route
                        path="/kvk/staff"
                        element={<Navigate to="/forms/about-kvk/employee-details" replace />}
                    />
                    <Route
                        path="/admin/kvk"
                        element={<Navigate to="/forms/about-kvk/view-kvks" replace />}
                    />
                    <Route
                        path="/admin/kvk/:id"
                        element={<AdminKVKRedirect />}
                    />
                    <Route
                        path="/admin/bank-accounts"
                        element={<Navigate to="/forms/about-kvk/bank-account" replace />}
                    />
                    <Route
                        path="/admin/staff"
                        element={<Navigate to="/forms/about-kvk/employee-details" replace />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                    />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
