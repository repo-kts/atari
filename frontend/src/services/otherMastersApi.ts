import { apiClient } from './api';
import type { ApiResponse } from '../types/masterData';

// Paginated response type
interface PaginatedResponse<T> {
    data: T[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const BASE_URL = '/admin/masters';

/**
 * API client for Other Masters (Season, Sanctioned Post, Year)
 */

// ============================================
// Type Definitions
// ============================================

export interface Season {
    seasonId: number;
    seasonName: string;
    isOther?: boolean;
    _count?: {
        cfldCrops: number;
        craCropingSystems: number;
        craFarmingSystems: number;
    };
}

export interface SanctionedPost {
    sanctionedPostId: number;
    postName: string;
    _count?: {
        staff: number;
    };
}

// Form Data Types
export interface SeasonFormData {
    seasonName: string;
    isOther?: boolean;
}

export interface SanctionedPostFormData {
    postName: string;
    isOther?: boolean;
}

// Employee Masters
export interface StaffCategory {
    staffCategoryId: number;
    categoryName: string;
    _count?: {
        staff: number;
    };
}

export interface PayLevel {
    payLevelId: number;
    levelName: string;
    _count?: {
        staff: number;
    };
}

export interface PayScale {
    payScaleId: number;
    scaleName: string;
    _count?: {
        staff: number;
    };
}


export interface EquipmentTypeEntry {
    equipmentTypeId: number;
    name: string;
    isOther?: boolean;
    _count?: {
        equipments: number;
        equipmentMasters: number;
    };
}

export interface VehicleTypeEntry {
    vehicleTypeId: number;
    name: string;
    isOther?: boolean;
    _count?: {
        vehicles: number;
    };
}

export interface EquipmentMasterEntry {
    equipmentMasterId: number;
    equipmentTypeId: number;
    name: string;
    equipmentType?: { equipmentTypeId: number; name: string };
    _count?: {
        equipments: number;
    };
}

export interface EquipmentTypeFormData {
    name: string;
    isOther?: boolean;
}

export interface VehicleTypeFormData {
    name: string;
    isOther?: boolean;
}

export interface EquipmentMasterFormData {
    equipmentTypeId: number;
    name: string;
}

export interface Discipline {
    disciplineId: number;
    disciplineName: string;
    isOther?: boolean;
    _count?: {
        staff: number;
    };
}

// Extension Masters
export interface ExtensionActivityType {
    activityId: number;
    activityName: string;
    _count?: {
        extensions: number;
        kvkExtensionActivities: number;
    };
}

export interface OtherExtensionActivityType {
    activityTypeId: number;
    activityName: string;
    _count?: {
        otherExtensionActivities: number;
    };
}

export interface ImportantDay {
    importantDayId: number;
    dayName: string;
    isOther?: boolean;
    _count?: {
        celebrations: number;
    };
}

// Training Masters
export interface TrainingClientele {
    clienteleId: number;
    name: string;
    isOther?: boolean;
    _count?: {
        trainings: number;
    };
}

export interface FundingSource {
    fundingSourceId: number;
    name: string;
    isOther?: boolean;
    _count?: {
        trainings: number;
        kvkOfts: number;
        equipments: number;
        equipmentDetails: number;
        vehicleDetails: number;
    };
}

// Other Masters
export interface Unit {
    unitId: number;
    unitName: string;
    isOther?: boolean;
    _count?: {
        fldCrops: number;
        products: number;
    };
}

export interface UnitFormData {
    unitName: string;
    isOther?: boolean;
}

export interface CropType {
    typeId: number;
    typeName: string;
    isOther?: boolean;
    _count?: {
        cfldCrops: number;
    };
}

export interface InfrastructureMaster {
    infraMasterId: number;
    name: string;
    _count?: {
        infrastructures: number;
    };
}

export interface LandItemMaster {
    landItemId: number;
    name: string;
    isOther?: boolean;
    _count?: {
        landDetails: number;
    };
}

// Form Data Types
export interface StaffCategoryFormData {
    categoryName: string;
    isOther?: boolean;
}

export interface JobType {
    jobTypeId: number;
    name: string;
    isOther?: boolean;
    _count?: {
        staff: number;
    };
}

export interface JobTypeFormData {
    name: string;
    isOther?: boolean;
}

export interface BankAccountType {
    bankAccountTypeId: number;
    name: string;
    isOther?: boolean;
    _count?: {
        bankAccounts: number;
    };
}

export interface BankAccountTypeFormData {
    name: string;
    isOther?: boolean;
}

export interface PayLevelFormData {
    levelName: string;
    isOther?: boolean;
}

export interface PayScaleFormData {
    scaleName: string;
    isOther?: boolean;
}

export interface DisciplineFormData {
    disciplineName: string;
    isOther?: boolean;
}

export interface ExtensionActivityTypeFormData {
    activityName: string;
    isOther?: boolean;
}

export interface OtherExtensionActivityTypeFormData {
    activityName: string;
    isOther?: boolean;
}

export interface ImportantDayFormData {
    dayName: string;
    isOther?: boolean;
}

export interface TrainingClienteleFormData {
    name: string;
    isOther?: boolean;
}

export interface FundingSourceFormData {
    name: string;
    isOther?: boolean;
}

export interface CropTypeFormData {
    typeName: string;
    isOther?: boolean;
}

export interface InfrastructureMasterFormData {
    name: string;
    isOther?: boolean;
}

export interface LandItemMasterFormData {
    name: string;
    isOther?: boolean;
}

export interface VehiclePresentStatus {
    vehicleStatusId: number;
    statusCode: string;
    statusLabel: string;
    hideInNextYear: boolean;
    isActive: boolean;
}

export interface EquipmentPresentStatus {
    equipmentStatusId: number;
    statusCode: string;
    statusLabel: string;
    hideInNextYear: boolean;
    isActive: boolean;
}

export interface VehiclePresentStatusFormData {
    statusCode: string;
    statusLabel: string;
    hideInNextYear?: boolean;
    isActive?: boolean;
}

export interface EquipmentPresentStatusFormData {
    statusCode: string;
    statusLabel: string;
    hideInNextYear?: boolean;
    isActive?: boolean;
}

export interface SoilWaterAnalysis {
    soilWaterAnalysisId: number;
    analysisName: string;
    createdAt?: string;
    updatedAt?: string;
    _count?: {
        analysis: number;
        equipments: number;
    };
}

export interface SoilWaterAnalysisFormData {
    analysisName: string;
}

// NARI Masters
export interface NariCropCategory {
    cropCategoryId: number;
    name: string;
}

export interface NariCropCategoryFormData {
    name: string;
}

export interface NariActivity {
    nariActivityId: number;
    activityName: string;
    isOther?: boolean;
}

export interface NariNutritionGardenType {
    nutritionGardenTypeId: number;
    name: string;
    isOther?: boolean;
}

export interface NariActivityFormData {
    activityName: string;
    isOther?: boolean;
}

export interface NariNutritionGardenTypeFormData {
    name: string;
    isOther?: boolean;
}

export interface NicraCategory {
    nicraCategoryId: number;
    categoryName: string;
    isOther?: boolean;
    _count?: {
        nicraDetails: number;
        subCategories: number;
    };
}

export interface NicraSubCategory {
    nicraSubCategoryId: number;
    nicraCategoryId: number;
    subCategoryName: string;
    category?: {
        nicraCategoryId: number;
        categoryName: string;
    };
    _count?: {
        nicraDetails: number;
    };
}

export interface NicraCategoryFormData {
    categoryName: string;
    isOther?: boolean;
}

export interface NicraSubCategoryFormData {
    subCategoryName: string;
    nicraCategoryId: number;
}

export interface NicraSeedBankFodderBank {
    nicraSeedBankFodderBankId: number;
    name: string;
}

export interface NicraSeedBankFodderBankFormData {
    name: string;
}

export interface NicraDignitaryType {
    nicraDignitaryTypeId: number;
    name: string;
}

export interface NicraDignitaryTypeFormData {
    name: string;
}

export interface NicraPiType {
    nicraPiTypeId: number;
    name: string;
}

export interface NicraPiTypeFormData {
    name: string;
}

export interface ImpactSpecificArea {
    specificAreaId: number;
    specificAreaName: string;
}

export interface ImpactSpecificAreaFormData {
    specificAreaName: string;
}

export interface EnterpriseType {
    enterpriseTypeId: number;
    enterpriseTypeName: string;
}

export interface EnterpriseTypeFormData {
    enterpriseTypeName: string;
}

export interface AccountType {
    accountTypeId: number;
    accountType: string;
    isOther?: boolean;
}

export interface AccountTypeFormData {
    accountType: string;
    isOther?: boolean;
}

export interface ProgrammeType {
    programmeTypeId: number;
    programmeType: string;
}

export interface ProgrammeTypeFormData {
    programmeType: string;
}

export interface PpvFraTrainingTypeFormData {
    typeName: string;
}

export interface DignitaryType {
    dignitaryTypeId: number;
    name: string;
    _count?: {
        visitors: number;
    };
}

export interface DignitaryTypeFormData {
    name: string;
}

export interface FinancialProject {
    financialProjectId: number;
    projectName: string;
    fundingSourceId?: number;
    fundingSource?: {
        fundingSourceId: number;
        name: string;
    };
}

export interface FinancialProjectFormData {
    projectName: string;
    fundingSourceId?: number;
}

// ============================================
// Season APIs
// ============================================

export const otherMastersApi = {
    // Seasons
    getSeasons: () =>
        apiClient.get<PaginatedResponse<Season>>(`${BASE_URL}/seasons`),

    getSeasonById: (id: number) =>
        apiClient.get<ApiResponse<Season>>(`${BASE_URL}/seasons/${id}`),

    createSeason: (data: SeasonFormData) =>
        apiClient.post<ApiResponse<Season>>(`${BASE_URL}/seasons`, data),

    updateSeason: (id: number, data: Partial<SeasonFormData>) =>
        apiClient.put<ApiResponse<Season>>(`${BASE_URL}/seasons/${id}`, data),

    deleteSeason: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/seasons/${id}`),

    // Sanctioned Posts
    getSanctionedPosts: () =>
        apiClient.get<PaginatedResponse<SanctionedPost>>(`${BASE_URL}/sanctioned-posts`),

    getSanctionedPostById: (id: number) =>
        apiClient.get<ApiResponse<SanctionedPost>>(`${BASE_URL}/sanctioned-posts/${id}`),

    createSanctionedPost: (data: SanctionedPostFormData) =>
        apiClient.post<ApiResponse<SanctionedPost>>(`${BASE_URL}/sanctioned-posts`, data),

    updateSanctionedPost: (id: number, data: Partial<SanctionedPostFormData>) =>
        apiClient.put<ApiResponse<SanctionedPost>>(`${BASE_URL}/sanctioned-posts/${id}`, data),

    deleteSanctionedPost: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/sanctioned-posts/${id}`),

    // Employee Masters
    getStaffCategories: () =>
        apiClient.get<PaginatedResponse<StaffCategory>>(`${BASE_URL}/staff-category`),
    getStaffCategoryById: (id: number) =>
        apiClient.get<ApiResponse<StaffCategory>>(`${BASE_URL}/staff-category/${id}`),
    createStaffCategory: (data: StaffCategoryFormData) =>
        apiClient.post<ApiResponse<StaffCategory>>(`${BASE_URL}/staff-category`, data),
    updateStaffCategory: (id: number, data: Partial<StaffCategoryFormData>) =>
        apiClient.put<ApiResponse<StaffCategory>>(`${BASE_URL}/staff-category/${id}`, data),
    deleteStaffCategory: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/staff-category/${id}`),

    getJobTypes: () =>
        apiClient.get<PaginatedResponse<JobType>>(`${BASE_URL}/job-type`),
    getJobTypeById: (id: number) =>
        apiClient.get<ApiResponse<JobType>>(`${BASE_URL}/job-type/${id}`),
    createJobType: (data: JobTypeFormData) =>
        apiClient.post<ApiResponse<JobType>>(`${BASE_URL}/job-type`, data),
    updateJobType: (id: number, data: Partial<JobTypeFormData>) =>
        apiClient.put<ApiResponse<JobType>>(`${BASE_URL}/job-type/${id}`, data),
    deleteJobType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/job-type/${id}`),

    getBankAccountTypes: () =>
        apiClient.get<PaginatedResponse<BankAccountType>>(`${BASE_URL}/bank-account-type`),
    getBankAccountTypeById: (id: number) =>
        apiClient.get<ApiResponse<BankAccountType>>(`${BASE_URL}/bank-account-type/${id}`),
    createBankAccountType: (data: BankAccountTypeFormData) =>
        apiClient.post<ApiResponse<BankAccountType>>(`${BASE_URL}/bank-account-type`, data),
    updateBankAccountType: (id: number, data: Partial<BankAccountTypeFormData>) =>
        apiClient.put<ApiResponse<BankAccountType>>(`${BASE_URL}/bank-account-type/${id}`, data),
    deleteBankAccountType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/bank-account-type/${id}`),

    getPayLevels: () =>
        apiClient.get<PaginatedResponse<PayLevel>>(`${BASE_URL}/pay-level`),
    getPayLevelById: (id: number) =>
        apiClient.get<ApiResponse<PayLevel>>(`${BASE_URL}/pay-level/${id}`),
    createPayLevel: (data: PayLevelFormData) =>
        apiClient.post<ApiResponse<PayLevel>>(`${BASE_URL}/pay-level`, data),
    updatePayLevel: (id: number, data: Partial<PayLevelFormData>) =>
        apiClient.put<ApiResponse<PayLevel>>(`${BASE_URL}/pay-level/${id}`, data),
    deletePayLevel: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/pay-level/${id}`),

    getPayScales: () =>
        apiClient.get<PaginatedResponse<PayScale>>(`${BASE_URL}/pay-scale`),
    getPayScaleById: (id: number) =>
        apiClient.get<ApiResponse<PayScale>>(`${BASE_URL}/pay-scale/${id}`),
    createPayScale: (data: PayScaleFormData) =>
        apiClient.post<ApiResponse<PayScale>>(`${BASE_URL}/pay-scale`, data),
    updatePayScale: (id: number, data: Partial<PayScaleFormData>) =>
        apiClient.put<ApiResponse<PayScale>>(`${BASE_URL}/pay-scale/${id}`, data),
    deletePayScale: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/pay-scale/${id}`),


    getEquipmentTypes: () =>
        apiClient.get<PaginatedResponse<EquipmentTypeEntry>>(`${BASE_URL}/equipment-type`),
    getEquipmentTypeById: (id: number) =>
        apiClient.get<ApiResponse<EquipmentTypeEntry>>(`${BASE_URL}/equipment-type/${id}`),
    createEquipmentType: (data: EquipmentTypeFormData) =>
        apiClient.post<ApiResponse<EquipmentTypeEntry>>(`${BASE_URL}/equipment-type`, data),
    updateEquipmentType: (id: number, data: Partial<EquipmentTypeFormData>) =>
        apiClient.put<ApiResponse<EquipmentTypeEntry>>(`${BASE_URL}/equipment-type/${id}`, data),
    deleteEquipmentType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/equipment-type/${id}`),

    getVehicleTypes: () =>
        apiClient.get<PaginatedResponse<VehicleTypeEntry>>(`${BASE_URL}/vehicle-type`),
    getVehicleTypeById: (id: number) =>
        apiClient.get<ApiResponse<VehicleTypeEntry>>(`${BASE_URL}/vehicle-type/${id}`),
    createVehicleType: (data: VehicleTypeFormData) =>
        apiClient.post<ApiResponse<VehicleTypeEntry>>(`${BASE_URL}/vehicle-type`, data),
    updateVehicleType: (id: number, data: Partial<VehicleTypeFormData>) =>
        apiClient.put<ApiResponse<VehicleTypeEntry>>(`${BASE_URL}/vehicle-type/${id}`, data),
    deleteVehicleType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/vehicle-type/${id}`),

    getEquipmentMasters: (params?: { page?: number; limit?: number; search?: string }) => {
        const qs = new URLSearchParams()
        if (params?.page) qs.set('page', String(params.page))
        if (params?.limit) qs.set('limit', String(params.limit))
        if (params?.search) qs.set('search', params.search)
        const q = qs.toString()
        return apiClient.get<PaginatedResponse<EquipmentMasterEntry>>(
            `${BASE_URL}/equipment-master${q ? `?${q}` : ''}`
        )
    },
    getEquipmentMasterById: (id: number) =>
        apiClient.get<ApiResponse<EquipmentMasterEntry>>(`${BASE_URL}/equipment-master/${id}`),
    createEquipmentMaster: (data: EquipmentMasterFormData) =>
        apiClient.post<ApiResponse<EquipmentMasterEntry>>(`${BASE_URL}/equipment-master`, data),
    updateEquipmentMaster: (id: number, data: Partial<EquipmentMasterFormData>) =>
        apiClient.put<ApiResponse<EquipmentMasterEntry>>(`${BASE_URL}/equipment-master/${id}`, data),
    deleteEquipmentMaster: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/equipment-master/${id}`),

    getDisciplines: () =>
        apiClient.get<PaginatedResponse<Discipline>>(`${BASE_URL}/discipline`),
    getDisciplineById: (id: number) =>
        apiClient.get<ApiResponse<Discipline>>(`${BASE_URL}/discipline/${id}`),
    createDiscipline: (data: DisciplineFormData) =>
        apiClient.post<ApiResponse<Discipline>>(`${BASE_URL}/discipline`, data),
    updateDiscipline: (id: number, data: Partial<DisciplineFormData>) =>
        apiClient.put<ApiResponse<Discipline>>(`${BASE_URL}/discipline/${id}`, data),
    deleteDiscipline: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/discipline/${id}`),

    // Extension Masters
    getExtensionActivityTypes: () =>
        apiClient.get<PaginatedResponse<ExtensionActivityType>>(`${BASE_URL}/extension-activity-type`),
    getExtensionActivityTypeById: (id: number) =>
        apiClient.get<ApiResponse<ExtensionActivityType>>(`${BASE_URL}/extension-activity-type/${id}`),
    createExtensionActivityType: (data: ExtensionActivityTypeFormData) =>
        apiClient.post<ApiResponse<ExtensionActivityType>>(`${BASE_URL}/extension-activity-type`, data),
    updateExtensionActivityType: (id: number, data: Partial<ExtensionActivityTypeFormData>) =>
        apiClient.put<ApiResponse<ExtensionActivityType>>(`${BASE_URL}/extension-activity-type/${id}`, data),
    deleteExtensionActivityType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/extension-activity-type/${id}`),

    getOtherExtensionActivityTypes: () =>
        apiClient.get<PaginatedResponse<OtherExtensionActivityType>>(`${BASE_URL}/other-extension-activity-type`),
    getOtherExtensionActivityTypeById: (id: number) =>
        apiClient.get<ApiResponse<OtherExtensionActivityType>>(`${BASE_URL}/other-extension-activity-type/${id}`),
    createOtherExtensionActivityType: (data: OtherExtensionActivityTypeFormData) =>
        apiClient.post<ApiResponse<OtherExtensionActivityType>>(`${BASE_URL}/other-extension-activity-type`, data),
    updateOtherExtensionActivityType: (id: number, data: Partial<OtherExtensionActivityTypeFormData>) =>
        apiClient.put<ApiResponse<OtherExtensionActivityType>>(`${BASE_URL}/other-extension-activity-type/${id}`, data),
    deleteOtherExtensionActivityType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/other-extension-activity-type/${id}`),

    getImportantDays: () =>
        apiClient.get<PaginatedResponse<ImportantDay>>(`${BASE_URL}/important-day`),
    getImportantDayById: (id: number) =>
        apiClient.get<ApiResponse<ImportantDay>>(`${BASE_URL}/important-day/${id}`),
    createImportantDay: (data: ImportantDayFormData) =>
        apiClient.post<ApiResponse<ImportantDay>>(`${BASE_URL}/important-day`, data),
    updateImportantDay: (id: number, data: Partial<ImportantDayFormData>) =>
        apiClient.put<ApiResponse<ImportantDay>>(`${BASE_URL}/important-day/${id}`, data),
    deleteImportantDay: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/important-day/${id}`),

    // Training Masters
    getTrainingClientele: () =>
        apiClient.get<PaginatedResponse<TrainingClientele>>(`${BASE_URL}/training-clientele`),
    getTrainingClienteleById: (id: number) =>
        apiClient.get<ApiResponse<TrainingClientele>>(`${BASE_URL}/training-clientele/${id}`),
    createTrainingClientele: (data: TrainingClienteleFormData) =>
        apiClient.post<ApiResponse<TrainingClientele>>(`${BASE_URL}/training-clientele`, data),
    updateTrainingClientele: (id: number, data: Partial<TrainingClienteleFormData>) =>
        apiClient.put<ApiResponse<TrainingClientele>>(`${BASE_URL}/training-clientele/${id}`, data),
    deleteTrainingClientele: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/training-clientele/${id}`),

    getFundingSources: () =>
        apiClient.get<PaginatedResponse<FundingSource>>(`${BASE_URL}/funding-source`),
    getFundingSourceById: (id: number) =>
        apiClient.get<ApiResponse<FundingSource>>(`${BASE_URL}/funding-source/${id}`),
    createFundingSource: (data: FundingSourceFormData) =>
        apiClient.post<ApiResponse<FundingSource>>(`${BASE_URL}/funding-source`, data),
    updateFundingSource: (id: number, data: Partial<FundingSourceFormData>) =>
        apiClient.put<ApiResponse<FundingSource>>(`${BASE_URL}/funding-source/${id}`, data),
    deleteFundingSource: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/funding-source/${id}`),

    // Units
    getUnits: () =>
        apiClient.get<PaginatedResponse<Unit>>(`${BASE_URL}/units`),
    getUnitById: (id: number) =>
        apiClient.get<ApiResponse<Unit>>(`${BASE_URL}/units/${id}`),
    createUnit: (data: UnitFormData) =>
        apiClient.post<ApiResponse<Unit>>(`${BASE_URL}/units`, data),
    updateUnit: (id: number, data: Partial<UnitFormData>) =>
        apiClient.put<ApiResponse<Unit>>(`${BASE_URL}/units/${id}`, data),
    deleteUnit: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/units/${id}`),

    // Other Masters
    getCropTypes: () =>
        apiClient.get<PaginatedResponse<CropType>>(`${BASE_URL}/crop-type`),
    getCropTypeById: (id: number) =>
        apiClient.get<ApiResponse<CropType>>(`${BASE_URL}/crop-type/${id}`),
    createCropType: (data: CropTypeFormData) =>
        apiClient.post<ApiResponse<CropType>>(`${BASE_URL}/crop-type`, data),
    updateCropType: (id: number, data: Partial<CropTypeFormData>) =>
        apiClient.put<ApiResponse<CropType>>(`${BASE_URL}/crop-type/${id}`, data),
    deleteCropType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/crop-type/${id}`),

    getInfrastructureMasters: () =>
        apiClient.get<PaginatedResponse<InfrastructureMaster>>(`${BASE_URL}/infrastructure-master`),
    getInfrastructureMasterById: (id: number) =>
        apiClient.get<ApiResponse<InfrastructureMaster>>(`${BASE_URL}/infrastructure-master/${id}`),
    createInfrastructureMaster: (data: InfrastructureMasterFormData) =>
        apiClient.post<ApiResponse<InfrastructureMaster>>(`${BASE_URL}/infrastructure-master`, data),
    updateInfrastructureMaster: (id: number, data: Partial<InfrastructureMasterFormData>) =>
        apiClient.put<ApiResponse<InfrastructureMaster>>(`${BASE_URL}/infrastructure-master/${id}`, data),
    deleteInfrastructureMaster: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/infrastructure-master/${id}`),

    getLandItemMasters: () =>
        apiClient.get<PaginatedResponse<LandItemMaster>>(`${BASE_URL}/land-item-master`),
    getLandItemMasterById: (id: number) =>
        apiClient.get<ApiResponse<LandItemMaster>>(`${BASE_URL}/land-item-master/${id}`),
    createLandItemMaster: (data: LandItemMasterFormData) =>
        apiClient.post<ApiResponse<LandItemMaster>>(`${BASE_URL}/land-item-master`, data),
    updateLandItemMaster: (id: number, data: Partial<LandItemMasterFormData>) =>
        apiClient.put<ApiResponse<LandItemMaster>>(`${BASE_URL}/land-item-master/${id}`, data),
    deleteLandItemMaster: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/land-item-master/${id}`),

    getVehiclePresentStatuses: () =>
        apiClient.get<PaginatedResponse<VehiclePresentStatus>>(`${BASE_URL}/vehicle-present-status`),
    createVehiclePresentStatus: (data: VehiclePresentStatusFormData) =>
        apiClient.post<ApiResponse<VehiclePresentStatus>>(`${BASE_URL}/vehicle-present-status`, data),
    updateVehiclePresentStatus: (id: number, data: Partial<VehiclePresentStatusFormData>) =>
        apiClient.put<ApiResponse<VehiclePresentStatus>>(`${BASE_URL}/vehicle-present-status/${id}`, data),
    deleteVehiclePresentStatus: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/vehicle-present-status/${id}`),

    getEquipmentPresentStatuses: () =>
        apiClient.get<PaginatedResponse<EquipmentPresentStatus>>(`${BASE_URL}/equipment-present-status`),
    createEquipmentPresentStatus: (data: EquipmentPresentStatusFormData) =>
        apiClient.post<ApiResponse<EquipmentPresentStatus>>(`${BASE_URL}/equipment-present-status`, data),
    updateEquipmentPresentStatus: (id: number, data: Partial<EquipmentPresentStatusFormData>) =>
        apiClient.put<ApiResponse<EquipmentPresentStatus>>(`${BASE_URL}/equipment-present-status/${id}`, data),
    deleteEquipmentPresentStatus: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/equipment-present-status/${id}`),

    // Soil Water Analysis Masters
    getSoilWaterAnalyses: () =>
        apiClient.get<PaginatedResponse<SoilWaterAnalysis>>(`${BASE_URL}/soil-water-analysis`),
    getSoilWaterAnalysisById: (id: number) =>
        apiClient.get<ApiResponse<SoilWaterAnalysis>>(`${BASE_URL}/soil-water-analysis/${id}`),
    createSoilWaterAnalysis: (data: SoilWaterAnalysisFormData) =>
        apiClient.post<ApiResponse<SoilWaterAnalysis>>(`${BASE_URL}/soil-water-analysis`, data),
    updateSoilWaterAnalysis: (id: number, data: Partial<SoilWaterAnalysisFormData>) =>
        apiClient.put<ApiResponse<SoilWaterAnalysis>>(`${BASE_URL}/soil-water-analysis/${id}`, data),
    deleteSoilWaterAnalysis: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/soil-water-analysis/${id}`),

    // NARI Masters
    getNariCropCategories: () =>
        apiClient.get<PaginatedResponse<NariCropCategory>>(`${BASE_URL}/nari-crop-category`),
    getNariCropCategoryById: (id: number) =>
        apiClient.get<ApiResponse<NariCropCategory>>(`${BASE_URL}/nari-crop-category/${id}`),
    createNariCropCategory: (data: NariCropCategoryFormData) =>
        apiClient.post<ApiResponse<NariCropCategory>>(`${BASE_URL}/nari-crop-category`, data),
    updateNariCropCategory: (id: number, data: Partial<NariCropCategoryFormData>) =>
        apiClient.put<ApiResponse<NariCropCategory>>(`${BASE_URL}/nari-crop-category/${id}`, data),
    deleteNariCropCategory: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/nari-crop-category/${id}`),
    getNariActivities: () =>
        apiClient.get<PaginatedResponse<NariActivity>>(`${BASE_URL}/nari-activity`),
    getNariActivityById: (id: number) =>
        apiClient.get<ApiResponse<NariActivity>>(`${BASE_URL}/nari-activity/${id}`),
    createNariActivity: (data: NariActivityFormData) =>
        apiClient.post<ApiResponse<NariActivity>>(`${BASE_URL}/nari-activity`, data),
    updateNariActivity: (id: number, data: Partial<NariActivityFormData>) =>
        apiClient.put<ApiResponse<NariActivity>>(`${BASE_URL}/nari-activity/${id}`, data),
    deleteNariActivity: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/nari-activity/${id}`),

    getNariNutritionGardenTypes: () =>
        apiClient.get<PaginatedResponse<NariNutritionGardenType>>(`${BASE_URL}/nari-nutrition-garden-type`),
    getNariNutritionGardenTypeById: (id: number) =>
        apiClient.get<ApiResponse<NariNutritionGardenType>>(`${BASE_URL}/nari-nutrition-garden-type/${id}`),
    createNariNutritionGardenType: (data: NariNutritionGardenTypeFormData) =>
        apiClient.post<ApiResponse<NariNutritionGardenType>>(`${BASE_URL}/nari-nutrition-garden-type`, data),
    updateNariNutritionGardenType: (id: number, data: Partial<NariNutritionGardenTypeFormData>) =>
        apiClient.put<ApiResponse<NariNutritionGardenType>>(`${BASE_URL}/nari-nutrition-garden-type/${id}`, data),
    deleteNariNutritionGardenType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/nari-nutrition-garden-type/${id}`),

    // NICRA Masters
    getNicraCategories: () =>
        apiClient.get<PaginatedResponse<NicraCategory>>(`${BASE_URL}/nicra-category`),
    getNicraCategoryById: (id: number) =>
        apiClient.get<ApiResponse<NicraCategory>>(`${BASE_URL}/nicra-category/${id}`),
    createNicraCategory: (data: NicraCategoryFormData) =>
        apiClient.post<ApiResponse<NicraCategory>>(`${BASE_URL}/nicra-category`, data),
    updateNicraCategory: (id: number, data: Partial<NicraCategoryFormData>) =>
        apiClient.put<ApiResponse<NicraCategory>>(`${BASE_URL}/nicra-category/${id}`, data),
    deleteNicraCategory: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/nicra-category/${id}`),

    getNicraSubCategories: () =>
        apiClient.get<PaginatedResponse<NicraSubCategory>>(`${BASE_URL}/nicra-sub-category`),
    getNicraSubCategoryById: (id: number) =>
        apiClient.get<ApiResponse<NicraSubCategory>>(`${BASE_URL}/nicra-sub-category/${id}`),
    createNicraSubCategory: (data: NicraSubCategoryFormData) =>
        apiClient.post<ApiResponse<NicraSubCategory>>(`${BASE_URL}/nicra-sub-category`, data),
    updateNicraSubCategory: (id: number, data: Partial<NicraSubCategoryFormData>) =>
        apiClient.put<ApiResponse<NicraSubCategory>>(`${BASE_URL}/nicra-sub-category/${id}`, data),
    deleteNicraSubCategory: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/nicra-sub-category/${id}`),

    getNicraSeedBankFodderBanks: () =>
        apiClient.get<PaginatedResponse<NicraSeedBankFodderBank>>(`${BASE_URL}/nicra-seed-bank-fodder-bank`),
    getNicraSeedBankFodderBankById: (id: number) =>
        apiClient.get<ApiResponse<NicraSeedBankFodderBank>>(`${BASE_URL}/nicra-seed-bank-fodder-bank/${id}`),
    createNicraSeedBankFodderBank: (data: NicraSeedBankFodderBankFormData) =>
        apiClient.post<ApiResponse<NicraSeedBankFodderBank>>(`${BASE_URL}/nicra-seed-bank-fodder-bank`, data),
    updateNicraSeedBankFodderBank: (id: number, data: Partial<NicraSeedBankFodderBankFormData>) =>
        apiClient.put<ApiResponse<NicraSeedBankFodderBank>>(`${BASE_URL}/nicra-seed-bank-fodder-bank/${id}`, data),
    deleteNicraSeedBankFodderBank: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/nicra-seed-bank-fodder-bank/${id}`),

    getNicraDignitaryTypes: () =>
        apiClient.get<PaginatedResponse<NicraDignitaryType>>(`${BASE_URL}/nicra-dignitary-type`),
    getNicraDignitaryTypeById: (id: number) =>
        apiClient.get<ApiResponse<NicraDignitaryType>>(`${BASE_URL}/nicra-dignitary-type/${id}`),
    createNicraDignitaryType: (data: NicraDignitaryTypeFormData) =>
        apiClient.post<ApiResponse<NicraDignitaryType>>(`${BASE_URL}/nicra-dignitary-type`, data),
    updateNicraDignitaryType: (id: number, data: Partial<NicraDignitaryTypeFormData>) =>
        apiClient.put<ApiResponse<NicraDignitaryType>>(`${BASE_URL}/nicra-dignitary-type/${id}`, data),
    deleteNicraDignitaryType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/nicra-dignitary-type/${id}`),

    getNicraPiTypes: () =>
        apiClient.get<PaginatedResponse<NicraPiType>>(`${BASE_URL}/nicra-pi-type`),
    getNicraPiTypeById: (id: number) =>
        apiClient.get<ApiResponse<NicraPiType>>(`${BASE_URL}/nicra-pi-type/${id}`),
    createNicraPiType: (data: NicraPiTypeFormData) =>
        apiClient.post<ApiResponse<NicraPiType>>(`${BASE_URL}/nicra-pi-type`, data),
    updateNicraPiType: (id: number, data: Partial<NicraPiTypeFormData>) =>
        apiClient.put<ApiResponse<NicraPiType>>(`${BASE_URL}/nicra-pi-type/${id}`, data),
    deleteNicraPiType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/nicra-pi-type/${id}`),

    // Impact Specific Areas
    getImpactSpecificAreas: () =>
        apiClient.get<PaginatedResponse<ImpactSpecificArea>>(`${BASE_URL}/impact-specific-area-master`),
    getImpactSpecificAreaById: (id: number) =>
        apiClient.get<ApiResponse<ImpactSpecificArea>>(`${BASE_URL}/impact-specific-area-master/${id}`),
    createImpactSpecificArea: (data: ImpactSpecificAreaFormData) =>
        apiClient.post<ApiResponse<ImpactSpecificArea>>(`${BASE_URL}/impact-specific-area-master`, data),
    updateImpactSpecificArea: (id: number, data: Partial<ImpactSpecificAreaFormData>) =>
        apiClient.put<ApiResponse<ImpactSpecificArea>>(`${BASE_URL}/impact-specific-area-master/${id}`, data),
    deleteImpactSpecificArea: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/impact-specific-area-master/${id}`),

    // Enterprise Types
    getEnterpriseTypes: () =>
        apiClient.get<PaginatedResponse<EnterpriseType>>(`${BASE_URL}/enterprise-type`),
    getEnterpriseTypeById: (id: number) =>
        apiClient.get<ApiResponse<EnterpriseType>>(`${BASE_URL}/enterprise-type/${id}`),
    createEnterpriseType: (data: EnterpriseTypeFormData) =>
        apiClient.post<ApiResponse<EnterpriseType>>(`${BASE_URL}/enterprise-type`, data),
    updateEnterpriseType: (id: number, data: Partial<EnterpriseTypeFormData>) =>
        apiClient.put<ApiResponse<EnterpriseType>>(`${BASE_URL}/enterprise-type/${id}`, data),
    deleteEnterpriseType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/enterprise-type/${id}`),

    // Account Types
    getAccountTypes: () =>
        apiClient.get<PaginatedResponse<AccountType>>(`${BASE_URL}/account-type`),
    getAccountTypeById: (id: number) =>
        apiClient.get<ApiResponse<AccountType>>(`${BASE_URL}/account-type/${id}`),
    createAccountType: (data: AccountTypeFormData) =>
        apiClient.post<ApiResponse<AccountType>>(`${BASE_URL}/account-type`, data),
    updateAccountType: (id: number, data: Partial<AccountTypeFormData>) =>
        apiClient.put<ApiResponse<AccountType>>(`${BASE_URL}/account-type/${id}`, data),
    deleteAccountType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/account-type/${id}`),

    // Programme Types
    getProgrammeTypes: () =>
        apiClient.get<PaginatedResponse<ProgrammeType>>(`${BASE_URL}/programme-type`),
    getProgrammeTypeById: (id: number) =>
        apiClient.get<ApiResponse<ProgrammeType>>(`${BASE_URL}/programme-type/${id}`),
    createProgrammeType: (data: ProgrammeTypeFormData) =>
        apiClient.post<ApiResponse<ProgrammeType>>(`${BASE_URL}/programme-type`, data),
    updateProgrammeType: (id: number, data: Partial<ProgrammeTypeFormData>) =>
        apiClient.put<ApiResponse<ProgrammeType>>(`${BASE_URL}/programme-type/${id}`, data),
    deleteProgrammeType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/programme-type/${id}`),

    // ============================================
    // PPV & FRA Training Type Master
    // ============================================
    getPpvFraTrainingTypes: () =>
        apiClient.get<ApiResponse<any[]>>(`${BASE_URL}/ppv-fra-training-type`),

    createPpvFraTrainingType: (data: PpvFraTrainingTypeFormData) =>
        apiClient.post<ApiResponse<any>>(`${BASE_URL}/ppv-fra-training-type`, data),

    updatePpvFraTrainingType: (id: number, data: Partial<PpvFraTrainingTypeFormData>) =>
        apiClient.put<ApiResponse<any>>(`${BASE_URL}/ppv-fra-training-type/${id}`, data),

    deletePpvFraTrainingType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/ppv-fra-training-type/${id}`),

    // Dignitary Types
    getDignitaryTypes: () =>
        apiClient.get<PaginatedResponse<DignitaryType>>(`${BASE_URL}/dignitary-type`),

    getDignitaryTypeById: (id: number) =>
        apiClient.get<ApiResponse<DignitaryType>>(`${BASE_URL}/dignitary-type/${id}`),

    createDignitaryType: (data: DignitaryTypeFormData) =>
        apiClient.post<ApiResponse<DignitaryType>>(`${BASE_URL}/dignitary-type`, data),

    updateDignitaryType: (id: number, data: Partial<DignitaryTypeFormData>) =>
        apiClient.put<ApiResponse<DignitaryType>>(`${BASE_URL}/dignitary-type/${id}`, data),

    deleteDignitaryType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/dignitary-type/${id}`),

    // Financial Projects
    getFinancialProjects: () =>
        apiClient.get<PaginatedResponse<FinancialProject>>(`${BASE_URL}/financial-project`),
    getFinancialProjectById: (id: number) =>
        apiClient.get<ApiResponse<FinancialProject>>(`${BASE_URL}/financial-project/${id}`),
    createFinancialProject: (data: FinancialProjectFormData) =>
        apiClient.post<ApiResponse<FinancialProject>>(`${BASE_URL}/financial-project`, data),
    updateFinancialProject: (id: number, data: Partial<FinancialProjectFormData>) =>
        apiClient.put<ApiResponse<FinancialProject>>(`${BASE_URL}/financial-project/${id}`, data),
    deleteFinancialProject: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/financial-project/${id}`),
};
