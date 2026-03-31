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
}

export interface SanctionedPostFormData {
    postName: string;
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

export interface Discipline {
    disciplineId: number;
    disciplineName: string;
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
    _count?: {
        celebrations: number;
    };
}

// Training Masters
export interface TrainingClientele {
    clienteleId: number;
    name: string;
    _count?: {
        trainings: number;
    };
}

export interface FundingSource {
    fundingSourceId: number;
    name: string;
    _count?: {
        trainings: number;
    };
}

// Other Masters
export interface CropType {
    typeId: number;
    typeName: string;
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

// Form Data Types
export interface StaffCategoryFormData {
    categoryName: string;
}

export interface PayLevelFormData {
    levelName: string;
}

export interface DisciplineFormData {
    disciplineName: string;
}

export interface ExtensionActivityTypeFormData {
    activityName: string;
}

export interface OtherExtensionActivityTypeFormData {
    activityName: string;
}

export interface ImportantDayFormData {
    dayName: string;
}

export interface TrainingClienteleFormData {
    name: string;
}

export interface FundingSourceFormData {
    name: string;
}

export interface CropTypeFormData {
    typeName: string;
}

export interface InfrastructureMasterFormData {
    name: string;
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
}

export interface NariNutritionGardenType {
    nutritionGardenTypeId: number;
    name: string;
}

export interface NariActivityFormData {
    activityName: string;
}

export interface NariNutritionGardenTypeFormData {
    name: string;
}

export interface NicraCategory {
    nicraCategoryId: number;
    categoryName: string;
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
}

export interface AccountTypeFormData {
    accountType: string;
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
    fundingAgencyId?: number;
    fundingAgency?: {
        fundingAgencyId: number;
        agencyName: string;
    };
}

export interface FinancialProjectFormData {
    projectName: string;
    fundingAgencyId?: number;
}

export interface FundingAgency {
    fundingAgencyId: number;
    agencyName: string;
}

export interface FundingAgencyFormData {
    agencyName: string;
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

    // Funding Agencies
    getFundingAgencies: () =>
        apiClient.get<PaginatedResponse<FundingAgency>>(`${BASE_URL}/funding-agency`),
    getFundingAgencyById: (id: number) =>
        apiClient.get<ApiResponse<FundingAgency>>(`${BASE_URL}/funding-agency/${id}`),
    createFundingAgency: (data: FundingAgencyFormData) =>
        apiClient.post<ApiResponse<FundingAgency>>(`${BASE_URL}/funding-agency`, data),
    updateFundingAgency: (id: number, data: Partial<FundingAgencyFormData>) =>
        apiClient.put<ApiResponse<FundingAgency>>(`${BASE_URL}/funding-agency/${id}`, data),
    deleteFundingAgency: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/funding-agency/${id}`),
};
