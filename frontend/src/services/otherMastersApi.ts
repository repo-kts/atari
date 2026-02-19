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

export interface Year {
    yearId: number;
    yearName: string;
}

// Form Data Types
export interface SeasonFormData {
    seasonName: string;
}

export interface SanctionedPostFormData {
    postName: string;
}

export interface YearFormData {
    yearName: string;
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

    // Years
    getYears: () =>
        apiClient.get<PaginatedResponse<Year>>(`${BASE_URL}/years`),

    getYearById: (id: number) =>
        apiClient.get<ApiResponse<Year>>(`${BASE_URL}/years/${id}`),

    createYear: (data: YearFormData) =>
        apiClient.post<ApiResponse<Year>>(`${BASE_URL}/years`, data),

    updateYear: (id: number, data: Partial<YearFormData>) =>
        apiClient.put<ApiResponse<Year>>(`${BASE_URL}/years/${id}`, data),

    deleteYear: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/years/${id}`),

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
};
