import { apiClient } from './api';
import type {
    ApiResponse,
    PaginatedResponse,
    OftSubject,
    OftThematicArea,
    Sector,
    FldThematicArea,
    FldCategory,
    FldSubcategory,
    FldCrop,
    Season,
    CropType,
    CfldCrop,
    OftSubjectFormData,
    OftThematicAreaFormData,
    SectorFormData,
    FldThematicAreaFormData,
    FldCategoryFormData,
    FldSubcategoryFormData,
    FldCropFormData,
    SeasonFormData,
    CropTypeFormData,
    CfldCropFormData,
    OftFldStats,
} from '../types/oftFld';

const BASE_URL = '/admin/masters';

/**
 * OFT & FLD Master Data API Client
 */
export const oftFldApi = {
    // ============================================
    // OFT Subject APIs
    // ============================================
    getOftSubjects: () =>
        apiClient.get<PaginatedResponse<OftSubject>>(`${BASE_URL}/oft/subjects`),

    getOftSubjectById: (id: number) =>
        apiClient.get<ApiResponse<OftSubject>>(`${BASE_URL}/oft/subjects/${id}`),

    createOftSubject: (data: OftSubjectFormData) =>
        apiClient.post<ApiResponse<OftSubject>>(`${BASE_URL}/oft/subjects`, data),

    updateOftSubject: (id: number, data: Partial<OftSubjectFormData>) =>
        apiClient.put<ApiResponse<OftSubject>>(`${BASE_URL}/oft/subjects/${id}`, data),

    deleteOftSubject: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/oft/subjects/${id}`),

    // ============================================
    // OFT Thematic Area APIs
    // ============================================
    getOftThematicAreas: () =>
        apiClient.get<PaginatedResponse<OftThematicArea>>(`${BASE_URL}/oft/thematic-areas`),

    getOftThematicAreaById: (id: number) =>
        apiClient.get<ApiResponse<OftThematicArea>>(`${BASE_URL}/oft/thematic-areas/${id}`),

    createOftThematicArea: (data: OftThematicAreaFormData) =>
        apiClient.post<ApiResponse<OftThematicArea>>(`${BASE_URL}/oft/thematic-areas`, data),

    updateOftThematicArea: (id: number, data: Partial<OftThematicAreaFormData>) =>
        apiClient.put<ApiResponse<OftThematicArea>>(`${BASE_URL}/oft/thematic-areas/${id}`, data),

    deleteOftThematicArea: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/oft/thematic-areas/${id}`),

    getOftThematicAreasBySubject: (subjectId: number) =>
        apiClient.get<ApiResponse<OftThematicArea[]>>(`${BASE_URL}/oft/subjects/${subjectId}/thematic-areas`),

    // ============================================
    // FLD Sector APIs
    // ============================================
    getSectors: () =>
        apiClient.get<PaginatedResponse<Sector>>(`${BASE_URL}/fld/sectors`),

    getSectorById: (id: number) =>
        apiClient.get<ApiResponse<Sector>>(`${BASE_URL}/fld/sectors/${id}`),

    createSector: (data: SectorFormData) =>
        apiClient.post<ApiResponse<Sector>>(`${BASE_URL}/fld/sectors`, data),

    updateSector: (id: number, data: Partial<SectorFormData>) =>
        apiClient.put<ApiResponse<Sector>>(`${BASE_URL}/fld/sectors/${id}`, data),

    deleteSector: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/fld/sectors/${id}`),

    // ============================================
    // FLD Thematic Area APIs
    // ============================================
    getFldThematicAreas: () =>
        apiClient.get<PaginatedResponse<FldThematicArea>>(`${BASE_URL}/fld/thematic-areas`),

    getFldThematicAreaById: (id: number) =>
        apiClient.get<ApiResponse<FldThematicArea>>(`${BASE_URL}/fld/thematic-areas/${id}`),

    createFldThematicArea: (data: FldThematicAreaFormData) =>
        apiClient.post<ApiResponse<FldThematicArea>>(`${BASE_URL}/fld/thematic-areas`, data),

    updateFldThematicArea: (id: number, data: Partial<FldThematicAreaFormData>) =>
        apiClient.put<ApiResponse<FldThematicArea>>(`${BASE_URL}/fld/thematic-areas/${id}`, data),

    deleteFldThematicArea: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/fld/thematic-areas/${id}`),

    getFldThematicAreasBySector: (sectorId: number) =>
        apiClient.get<ApiResponse<FldThematicArea[]>>(`${BASE_URL}/fld/sectors/${sectorId}/thematic-areas`),

    // ============================================
    // FLD Category APIs
    // ============================================
    getFldCategories: () =>
        apiClient.get<PaginatedResponse<FldCategory>>(`${BASE_URL}/fld/categories`),

    getFldCategoryById: (id: number) =>
        apiClient.get<ApiResponse<FldCategory>>(`${BASE_URL}/fld/categories/${id}`),

    createFldCategory: (data: FldCategoryFormData) =>
        apiClient.post<ApiResponse<FldCategory>>(`${BASE_URL}/fld/categories`, data),

    updateFldCategory: (id: number, data: Partial<FldCategoryFormData>) =>
        apiClient.put<ApiResponse<FldCategory>>(`${BASE_URL}/fld/categories/${id}`, data),

    deleteFldCategory: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/fld/categories/${id}`),

    getFldCategoriesBySector: (sectorId: number) =>
        apiClient.get<ApiResponse<FldCategory[]>>(`${BASE_URL}/fld/sectors/${sectorId}/categories`),

    // ============================================
    // FLD Subcategory APIs
    // ============================================
    getFldSubcategories: () =>
        apiClient.get<PaginatedResponse<FldSubcategory>>(`${BASE_URL}/fld/subcategories`),

    getFldSubcategoryById: (id: number) =>
        apiClient.get<ApiResponse<FldSubcategory>>(`${BASE_URL}/fld/subcategories/${id}`),

    createFldSubcategory: (data: FldSubcategoryFormData) =>
        apiClient.post<ApiResponse<FldSubcategory>>(`${BASE_URL}/fld/subcategories`, data),

    updateFldSubcategory: (id: number, data: Partial<FldSubcategoryFormData>) =>
        apiClient.put<ApiResponse<FldSubcategory>>(`${BASE_URL}/fld/subcategories/${id}`, data),

    deleteFldSubcategory: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/fld/subcategories/${id}`),

    getFldSubcategoriesByCategory: (categoryId: number) =>
        apiClient.get<ApiResponse<FldSubcategory[]>>(`${BASE_URL}/fld/categories/${categoryId}/subcategories`),

    // ============================================
    // FLD Crop APIs
    // ============================================
    getFldCrops: () =>
        apiClient.get<PaginatedResponse<FldCrop>>(`${BASE_URL}/fld/crops`),

    getFldCropById: (id: number) =>
        apiClient.get<ApiResponse<FldCrop>>(`${BASE_URL}/fld/crops/${id}`),

    createFldCrop: (data: FldCropFormData) =>
        apiClient.post<ApiResponse<FldCrop>>(`${BASE_URL}/fld/crops`, data),

    updateFldCrop: (id: number, data: Partial<FldCropFormData>) =>
        apiClient.put<ApiResponse<FldCrop>>(`${BASE_URL}/fld/crops/${id}`, data),

    deleteFldCrop: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/fld/crops/${id}`),

    getFldCropsBySubcategory: (subCategoryId: number) =>
        apiClient.get<ApiResponse<FldCrop[]>>(`${BASE_URL}/fld/subcategories/${subCategoryId}/crops`),

    // ============================================
    // Season APIs
    // ============================================
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

    // ============================================
    // CropType APIs
    // ============================================
    getCropTypes: () =>
        apiClient.get<PaginatedResponse<CropType>>(`${BASE_URL}/crop-types`),

    getCropTypeById: (id: number) =>
        apiClient.get<ApiResponse<CropType>>(`${BASE_URL}/crop-types/${id}`),

    createCropType: (data: CropTypeFormData) =>
        apiClient.post<ApiResponse<CropType>>(`${BASE_URL}/crop-types`, data),

    updateCropType: (id: number, data: Partial<CropTypeFormData>) =>
        apiClient.put<ApiResponse<CropType>>(`${BASE_URL}/crop-types/${id}`, data),

    deleteCropType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/crop-types/${id}`),

    // ============================================
    // CFLD Crop APIs
    // ============================================
    getCfldCrops: () =>
        apiClient.get<PaginatedResponse<CfldCrop>>(`${BASE_URL}/cfld/crops`),

    getCfldCropById: (id: number) =>
        apiClient.get<ApiResponse<CfldCrop>>(`${BASE_URL}/cfld/crops/${id}`),

    createCfldCrop: (data: CfldCropFormData) =>
        apiClient.post<ApiResponse<CfldCrop>>(`${BASE_URL}/cfld/crops`, data),

    updateCfldCrop: (id: number, data: Partial<CfldCropFormData>) =>
        apiClient.put<ApiResponse<CfldCrop>>(`${BASE_URL}/cfld/crops/${id}`, data),

    deleteCfldCrop: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/cfld/crops/${id}`),

    getCfldCropsBySeasonAndType: (seasonId: number, typeId: number) =>
        apiClient.get<ApiResponse<CfldCrop[]>>(`${BASE_URL}/cfld/crops/season/${seasonId}/type/${typeId}`),

    // ============================================
    // Statistics API
    // ============================================
    getStats: () =>
        apiClient.get<ApiResponse<OftFldStats>>(`${BASE_URL}/stats`),
};
