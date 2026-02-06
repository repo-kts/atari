import React, { useEffect } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
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
import { OFTList } from './components/kvk/OFT/OFTList'
import { FLDList } from './components/kvk/FLD/FLDList'
import { PublicationList } from './components/kvk/Publications/PublicationList'
import { TrainingList } from './components/kvk/Trainings/TrainingList'
import { ExtensionActivityList } from './components/kvk/Trainings/ExtensionActivityList'
import { OtherExtensionActivityList } from './components/kvk/Trainings/OtherExtensionActivityList'
import { TechnologyWeekList } from './components/kvk/Trainings/TechnologyWeekList'
import { CelebrationDaysList } from './components/kvk/Trainings/CelebrationDaysList'
import { ProductionSupplyList } from './components/kvk/ProductionSupply/ProductionSupplyList'
import { HRDList } from './components/kvk/HRD/HRDList'
import { SoilEquipmentList } from './components/kvk/SoilWater/SoilEquipmentList'
import { SoilAnalysisList } from './components/kvk/SoilWater/SoilAnalysisList'
import { WorldSoilDayList } from './components/kvk/SoilWater/WorldSoilDayList'
import { KVKAwardList } from './components/kvk/Awards/KVKAwardList'
import { ScientistAwardList } from './components/kvk/Awards/ScientistAwardList'
import { FarmerAwardList } from './components/kvk/Awards/FarmerAwardList'
import { FunctionalLinkageList } from './components/kvk/Linkages/FunctionalLinkageList'
import { SpecialProgramList } from './components/kvk/Linkages/SpecialProgramList'
import { KVKImpactList } from './components/kvk/Impact/KVKImpactList'
import { EntrepreneurshipList } from './components/kvk/Impact/EntrepreneurshipList'
import { SuccessStoriesList } from './components/kvk/Impact/SuccessStoriesList'
import { DistrictLevelDataList } from './components/kvk/DistrictVillage/DistrictLevelDataList'
import { OperationalAreaList } from './components/kvk/DistrictVillage/OperationalAreaList'
import { VillageAdoptionList } from './components/kvk/DistrictVillage/VillageAdoptionList'
import { PriorityThrustAreaList } from './components/kvk/DistrictVillage/PriorityThrustAreaList'
import { DemonstrationUnitsList } from './components/kvk/Infrastructure/DemonstrationUnitsList'
import { InstructionalFarmCropsList } from './components/kvk/Infrastructure/InstructionalFarmCropsList'
import { ProductionUnitsList } from './components/kvk/Infrastructure/ProductionUnitsList'
import { InstructionalFarmLivestockList } from './components/kvk/Infrastructure/InstructionalFarmLivestockList'
import { HostelFacilitiesList } from './components/kvk/Infrastructure/HostelFacilitiesList'
import { StaffQuartersList } from './components/kvk/Infrastructure/StaffQuartersList'
import { RainWaterHarvestingList } from './components/kvk/Infrastructure/RainWaterHarvestingList'
import { BudgetDetailsList } from './components/kvk/Financial/BudgetDetailsList'
import { ProjectBudgetList } from './components/kvk/Financial/ProjectBudgetList'
import { RevolvingFundList } from './components/kvk/Financial/RevolvingFundList'
import { RevenueGenerationList } from './components/kvk/Financial/RevenueGenerationList'
import { ResourceGenerationList } from './components/kvk/Financial/ResourceGenerationList'
import { PrevalentDiseasesCropsList } from './components/kvk/Miscellaneous/PrevalentDiseasesCropsList'
import { PrevalentDiseasesLivestockList } from './components/kvk/Miscellaneous/PrevalentDiseasesLivestockList'
import { NehruYuvaKendraList } from './components/kvk/Miscellaneous/NehruYuvaKendraList'
import { PPVFRATrainingList } from './components/kvk/Miscellaneous/PPVFRATrainingList'
import { PPVFRAFarmerDetailsList } from './components/kvk/Miscellaneous/PPVFRAFarmerDetailsList'
import { RaweFetList } from './components/kvk/Miscellaneous/RaweFetList'
import { VIPVisitorsList } from './components/kvk/Miscellaneous/VIPVisitorsList'
import { SACMeetingList } from './components/kvk/Miscellaneous/SACMeetingList'
import { OtherMeetingList } from './components/kvk/Miscellaneous/OtherMeetingList'
import { MobileAppList } from './components/kvk/Miscellaneous/MobileAppList'
import { KVKPortalList } from './components/kvk/Miscellaneous/KVKPortalList'
import { KisanSarathiList } from './components/kvk/Miscellaneous/KisanSarathiList'
import { KMASList } from './components/kvk/Miscellaneous/KMASList'
import { OtherChannelsList } from './components/kvk/Miscellaneous/OtherChannelsList'
import { SwachhtaSewaList } from './components/kvk/Miscellaneous/SwachhtaSewaList'
import { SwachhtaPakhwadaList } from './components/kvk/Miscellaneous/SwachhtaPakhwadaList'
import { SwachhtaBudgetList } from './components/kvk/Miscellaneous/SwachhtaBudgetList'

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

                    {/* All Masters - Dynamic MasterView routes (includes basic masters AND OFT/FLD masters) */}
                    {
                        allMastersRoutes.map(route => (
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
                        ))
                    }

                    {/* All Masters Catch-all */}
                    <Route path="/all-master/*" element={<AllMasters />} />

                    {/* Admin Pages */}
                    <Route path="/role-view" element={<RoleManagement />} />
                    <Route path="/view-users" element={<UserManagement />} />
                    <Route path="/module-images" element={<ModuleImages />} />
                    <Route path="/targets" element={<Targets />} />
                    <Route path="/view-log-history" element={<LogHistory />} />
                    <Route path="/view-email-notifications" element={<Notifications />} />
                    <Route path="/all-reports" element={<Reports />} />

                    {/* Form Management */}
                    <Route path="/forms" element={<FormManagement />} />

                    {/* Projects Overview */}
                    <Route path="/forms/achievements/projects" element={<ProjectsOverview />} />

                    {/* Achievements/Projects Standalone Routes */}
                    <Route path="/forms/achievements/oft" element={<OFTList />} />
                    <Route path="/forms/achievements/fld" element={<FLDList />} />
                    <Route path="/forms/achievements/publications" element={<PublicationList />} />
                    <Route path="/forms/achievements/trainings" element={<TrainingList />} />
                    <Route path="/forms/achievements/extension-activities" element={<ExtensionActivityList />} />
                    <Route path="/forms/achievements/other-extension" element={<OtherExtensionActivityList />} />
                    <Route path="/forms/achievements/technology-week" element={<TechnologyWeekList />} />
                    <Route path="/forms/achievements/celebration-days" element={<CelebrationDaysList />} />
                    <Route path="/forms/achievements/production-supply" element={<ProductionSupplyList />} />
                    <Route path="/forms/achievements/hrd" element={<HRDList />} />
                    <Route path="/forms/achievements/soil-equipment" element={<SoilEquipmentList />} />
                    <Route path="/forms/achievements/soil-analysis" element={<SoilAnalysisList />} />
                    <Route path="/forms/achievements/world-soil-day" element={<WorldSoilDayList />} />
                    <Route path="/forms/achievements/award-recognition/kvk" element={<KVKAwardList />} />
                    <Route path="/forms/achievements/award-recognition/scientist" element={<ScientistAwardList />} />
                    <Route path="/forms/achievements/award-recognition/farmer" element={<FarmerAwardList />} />

                    {/* Performance Routes */}
                    <Route path="/forms/performance/linkages/functional-linkage" element={<FunctionalLinkageList />} />
                    <Route path="/forms/performance/linkages/special-programmes" element={<SpecialProgramList />} />
                    <Route path="/forms/performance/impact/kvk-activities" element={<KVKImpactList />} />
                    <Route path="/forms/performance/impact/entrepreneurship" element={<EntrepreneurshipList />} />
                    <Route path="/forms/performance/impact/success-stories" element={<SuccessStoriesList />} />
                    <Route path="/forms/performance/district-village/district-level" element={<DistrictLevelDataList />} />
                    <Route path="/forms/performance/district-village/operational-area" element={<OperationalAreaList />} />
                    <Route path="/forms/performance/district-village/village-adoption" element={<VillageAdoptionList />} />
                    <Route path="/forms/performance/district-village/priority-thrust" element={<PriorityThrustAreaList />} />

                    {/* Infrastructure Performance Routes */}
                    <Route path="/forms/performance/infrastructure/demonstration-units" element={<DemonstrationUnitsList />} />
                    <Route path="/forms/performance/infrastructure/instructional-farm-crops" element={<InstructionalFarmCropsList />} />
                    <Route path="/forms/performance/infrastructure/production-units" element={<ProductionUnitsList />} />
                    <Route path="/forms/performance/infrastructure/instructional-farm-livestock" element={<InstructionalFarmLivestockList />} />
                    <Route path="/forms/performance/infrastructure/hostel-facilities" element={<HostelFacilitiesList />} />
                    <Route path="/forms/performance/infrastructure/staff-quarters" element={<StaffQuartersList />} />
                    <Route path="/forms/performance/infrastructure/rain-water-harvesting" element={<RainWaterHarvestingList />} />

                    {/* Financial Performance Routes */}
                    <Route path="/forms/performance/financial/budget-details" element={<BudgetDetailsList />} />
                    <Route path="/forms/performance/financial/project-budget" element={<ProjectBudgetList />} />
                    <Route path="/forms/performance/financial/revolving-fund" element={<RevolvingFundList />} />
                    <Route path="/forms/performance/financial/revenue-generation" element={<RevenueGenerationList />} />
                    <Route path="/forms/performance/financial/resource-generation" element={<ResourceGenerationList />} />

                    {/* Miscellaneous Routes */}
                    <Route path="/forms/miscellaneous/prevalent-diseases/crops" element={<PrevalentDiseasesCropsList />} />
                    <Route path="/forms/miscellaneous/prevalent-diseases/livestock" element={<PrevalentDiseasesLivestockList />} />
                    <Route path="/forms/miscellaneous/nehru-yuva-kendra" element={<NehruYuvaKendraList />} />

                    {/* PPV & FRA Sensitization */}
                    <Route path="/forms/miscellaneous/ppv-fra/training-awareness" element={<PPVFRATrainingList />} />
                    <Route path="/forms/miscellaneous/ppv-fra/plant-varieties" element={<PPVFRAFarmerDetailsList />} />

                    {/* RAWE/FET Programme */}
                    <Route path="/forms/miscellaneous/rawe-fet" element={<RaweFetList />} />

                    {/* VIP Visitors */}
                    <Route path="/forms/miscellaneous/vip-visitors" element={<VIPVisitorsList />} />

                    {/* Digital Information */}
                    <Route path="/forms/miscellaneous/digital/mobile-app" element={<MobileAppList />} />
                    <Route path="/forms/miscellaneous/digital/web-portal" element={<KVKPortalList />} />
                    <Route path="/forms/miscellaneous/digital/kisan-sarathi" element={<KisanSarathiList />} />
                    <Route path="/forms/miscellaneous/digital/kisan-mobile-advisory" element={<KMASList />} />
                    <Route path="/forms/miscellaneous/digital/other-channels" element={<OtherChannelsList />} />

                    {/* Swachhta Bharat Abhiyaan */}
                    <Route path="/forms/miscellaneous/swachhta-bharat/sewa" element={<SwachhtaSewaList />} />
                    <Route path="/forms/miscellaneous/swachhta-bharat/pakhwada" element={<SwachhtaPakhwadaList />} />
                    <Route path="/forms/miscellaneous/swachhta-bharat/budget" element={<SwachhtaBudgetList />} />

                    {/* Meetings */}
                    <Route path="/forms/miscellaneous/meetings/sac" element={<SACMeetingList />} />
                    <Route path="/forms/miscellaneous/meetings/other" element={<OtherMeetingList />} />

                    {/* Dynamic Project Form Routes - All rendered by DynamicFormPage */}
                    {projectsRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<DynamicFormPage />}
                        />
                    ))}

                    {/* Award Recognition (Scientist and Farmer) */}
                    <Route path="/forms/achievements/award-recognition/scientist" element={<ScientistAwardList />} />
                    <Route path="/forms/achievements/award-recognition/farmer" element={<FarmerAwardList />} />

                    {/* Form Management Catch-all */}
                    <Route path="/forms/*" element={<FormManagement />} />

                    {/* About KVK Routes - Dynamic */}
                    {
                        aboutKvkRoutes.map(route => {
                            // Map route paths to components
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

                            // Skip routes without components (they might be placeholders)
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
                        })
                    }

                    {/* View KVK Routes - Dynamic */}
                    {
                        viewKvkRoutes.map(route => {
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
                        })
                    }

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
                </Route >
            </Routes >
        </Router >
    )
}

export default App
