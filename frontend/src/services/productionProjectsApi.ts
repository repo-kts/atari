import { apiClient } from './api';
import type {
    ApiResponse,
    PaginatedResponse,
    ProductCategory,
    ProductType,
    Product,
    CraCroppingSystem,
    CraFarmingSystem,
    AryaEnterprise,
    TspScspType,
    TspScspActivity,
    ProductCategoryFormData,
    ProductTypeFormData,
    ProductFormData,
    CraCroppingSystemFormData,
    CraFarmingSystemFormData,
    AryaEnterpriseFormData,
    TspScspTypeFormData,
    TspScspActivityFormData,
    NaturalFarmingActivity,
    NaturalFarmingActivityFormData,
    NaturalFarmingSoilParameter,
    NaturalFarmingSoilParameterFormData,
    AgriDroneDemonstrationsOn,
    AgriDroneDemonstrationsOnFormData,
    ProductionProjectsStats,
} from '../types/productionProjects';

const BASE_URL = '/admin/masters';

/**
 * Production & Projects Master Data API Client
 */
export const productionProjectsApi = {
    // ============================================
    // Product Category APIs
    // ============================================
    getProductCategories: () =>
        apiClient.get<PaginatedResponse<ProductCategory>>(`${BASE_URL}/product-categories`),

    getProductCategoryById: (id: number) =>
        apiClient.get<ApiResponse<ProductCategory>>(`${BASE_URL}/product-categories/${id}`),

    createProductCategory: (data: ProductCategoryFormData) =>
        apiClient.post<ApiResponse<ProductCategory>>(`${BASE_URL}/product-categories`, data),

    updateProductCategory: (id: number, data: Partial<ProductCategoryFormData>) =>
        apiClient.put<ApiResponse<ProductCategory>>(`${BASE_URL}/product-categories/${id}`, data),

    deleteProductCategory: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/product-categories/${id}`),

    // ============================================
    // Product Type APIs
    // ============================================
    getProductTypes: () =>
        apiClient.get<PaginatedResponse<ProductType>>(`${BASE_URL}/product-types`),

    getProductTypeById: (id: number) =>
        apiClient.get<ApiResponse<ProductType>>(`${BASE_URL}/product-types/${id}`),

    createProductType: (data: ProductTypeFormData) =>
        apiClient.post<ApiResponse<ProductType>>(`${BASE_URL}/product-types`, data),

    updateProductType: (id: number, data: Partial<ProductTypeFormData>) =>
        apiClient.put<ApiResponse<ProductType>>(`${BASE_URL}/product-types/${id}`, data),

    deleteProductType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/product-types/${id}`),

    getProductTypesByCategory: (categoryId: number) =>
        apiClient.get<ApiResponse<ProductType[]>>(`${BASE_URL}/product-categories/${categoryId}/types`),

    // ============================================
    // Product APIs
    // ============================================
    getProducts: () =>
        apiClient.get<PaginatedResponse<Product>>(`${BASE_URL}/products`),

    getProductById: (id: number) =>
        apiClient.get<ApiResponse<Product>>(`${BASE_URL}/products/${id}`),

    createProduct: (data: ProductFormData) =>
        apiClient.post<ApiResponse<Product>>(`${BASE_URL}/products`, data),

    updateProduct: (id: number, data: Partial<ProductFormData>) =>
        apiClient.put<ApiResponse<Product>>(`${BASE_URL}/products/${id}`, data),

    deleteProduct: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/products/${id}`),

    // ============================================
    // CRA Cropping System APIs
    // ============================================
    getCraCroppingSystems: () =>
        apiClient.get<PaginatedResponse<CraCroppingSystem>>(`${BASE_URL}/cra-cropping-systems`),

    getCraCroppingSystemById: (id: number) =>
        apiClient.get<ApiResponse<CraCroppingSystem>>(`${BASE_URL}/cra-cropping-systems/${id}`),

    createCraCroppingSystem: (data: CraCroppingSystemFormData) =>
        apiClient.post<ApiResponse<CraCroppingSystem>>(`${BASE_URL}/cra-cropping-systems`, data),

    updateCraCroppingSystem: (id: number, data: Partial<CraCroppingSystemFormData>) =>
        apiClient.put<ApiResponse<CraCroppingSystem>>(`${BASE_URL}/cra-cropping-systems/${id}`, data),

    deleteCraCroppingSystem: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/cra-cropping-systems/${id}`),

    // ============================================
    // CRA Farming System APIs
    // ============================================
    getCraFarmingSystems: () =>
        apiClient.get<PaginatedResponse<CraFarmingSystem>>(`${BASE_URL}/cra-farming-systems`),

    getCraFarmingSystemById: (id: number) =>
        apiClient.get<ApiResponse<CraFarmingSystem>>(`${BASE_URL}/cra-farming-systems/${id}`),

    createCraFarmingSystem: (data: CraFarmingSystemFormData) =>
        apiClient.post<ApiResponse<CraFarmingSystem>>(`${BASE_URL}/cra-farming-systems`, data),

    updateCraFarmingSystem: (id: number, data: Partial<CraFarmingSystemFormData>) =>
        apiClient.put<ApiResponse<CraFarmingSystem>>(`${BASE_URL}/cra-farming-systems/${id}`, data),

    deleteCraFarmingSystem: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/cra-farming-systems/${id}`),

    // ============================================
    // Arya Enterprise APIs
    // ============================================
    getAryaEnterprises: () =>
        apiClient.get<PaginatedResponse<AryaEnterprise>>(`${BASE_URL}/arya-enterprises`),

    getAryaEnterpriseById: (id: number) =>
        apiClient.get<ApiResponse<AryaEnterprise>>(`${BASE_URL}/arya-enterprises/${id}`),

    createAryaEnterprise: (data: AryaEnterpriseFormData) =>
        apiClient.post<ApiResponse<AryaEnterprise>>(`${BASE_URL}/arya-enterprises`, data),

    updateAryaEnterprise: (id: number, data: Partial<AryaEnterpriseFormData>) =>
        apiClient.put<ApiResponse<AryaEnterprise>>(`${BASE_URL}/arya-enterprises/${id}`, data),

    deleteAryaEnterprise: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/arya-enterprises/${id}`),

    // ============================================
    // TSP/SCSP Type APIs
    // ============================================
    getTspScspTypes: () =>
        apiClient.get<PaginatedResponse<TspScspType>>(`${BASE_URL}/tsp-scsp-types`),
    getTspScspTypeById: (id: number) =>
        apiClient.get<ApiResponse<TspScspType>>(`${BASE_URL}/tsp-scsp-types/${id}`),
    createTspScspType: (data: TspScspTypeFormData) =>
        apiClient.post<ApiResponse<TspScspType>>(`${BASE_URL}/tsp-scsp-types`, data),
    updateTspScspType: (id: number, data: Partial<TspScspTypeFormData>) =>
        apiClient.put<ApiResponse<TspScspType>>(`${BASE_URL}/tsp-scsp-types/${id}`, data),
    deleteTspScspType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/tsp-scsp-types/${id}`),

    // ============================================
    // TSP/SCSP Activity APIs
    // ============================================
    getTspScspActivities: () =>
        apiClient.get<PaginatedResponse<TspScspActivity>>(`${BASE_URL}/tsp-scsp-activities`),
    getTspScspActivityById: (id: number) =>
        apiClient.get<ApiResponse<TspScspActivity>>(`${BASE_URL}/tsp-scsp-activities/${id}`),
    createTspScspActivity: (data: TspScspActivityFormData) =>
        apiClient.post<ApiResponse<TspScspActivity>>(`${BASE_URL}/tsp-scsp-activities`, data),
    updateTspScspActivity: (id: number, data: Partial<TspScspActivityFormData>) =>
        apiClient.put<ApiResponse<TspScspActivity>>(`${BASE_URL}/tsp-scsp-activities/${id}`, data),
    deleteTspScspActivity: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/tsp-scsp-activities/${id}`),

    // ============================================
    // Natural Farming Activity APIs
    // ============================================
    getNaturalFarmingActivities: () =>
        apiClient.get<PaginatedResponse<NaturalFarmingActivity>>(`${BASE_URL}/natural-farming-activities`),
    getNaturalFarmingActivityById: (id: number) =>
        apiClient.get<ApiResponse<NaturalFarmingActivity>>(`${BASE_URL}/natural-farming-activities/${id}`),
    createNaturalFarmingActivity: (data: NaturalFarmingActivityFormData) =>
        apiClient.post<ApiResponse<NaturalFarmingActivity>>(`${BASE_URL}/natural-farming-activities`, data),
    updateNaturalFarmingActivity: (id: number, data: Partial<NaturalFarmingActivityFormData>) =>
        apiClient.put<ApiResponse<NaturalFarmingActivity>>(`${BASE_URL}/natural-farming-activities/${id}`, data),
    deleteNaturalFarmingActivity: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/natural-farming-activities/${id}`),

    getNaturalFarmingSoilParameters: () =>
        apiClient.get<PaginatedResponse<NaturalFarmingSoilParameter>>(`${BASE_URL}/natural-farming-soil-parameters`),
    getNaturalFarmingSoilParameterById: (id: number) =>
        apiClient.get<ApiResponse<NaturalFarmingSoilParameter>>(`${BASE_URL}/natural-farming-soil-parameters/${id}`),
    createNaturalFarmingSoilParameter: (data: NaturalFarmingSoilParameterFormData) =>
        apiClient.post<ApiResponse<NaturalFarmingSoilParameter>>(`${BASE_URL}/natural-farming-soil-parameters`, data),
    updateNaturalFarmingSoilParameter: (id: number, data: Partial<NaturalFarmingSoilParameterFormData>) =>
        apiClient.put<ApiResponse<NaturalFarmingSoilParameter>>(`${BASE_URL}/natural-farming-soil-parameters/${id}`, data),
    deleteNaturalFarmingSoilParameter: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/natural-farming-soil-parameters/${id}`),

    // ============================================
    // Agri Drone Masters
    // ============================================
    getAgriDroneDemonstrationsOn: () =>
        apiClient.get<PaginatedResponse<AgriDroneDemonstrationsOn>>(`${BASE_URL}/agri-drone-demonstrations-on`),
    getAgriDroneDemonstrationsOnById: (id: number) =>
        apiClient.get<ApiResponse<AgriDroneDemonstrationsOn>>(`${BASE_URL}/agri-drone-demonstrations-on/${id}`),
    createAgriDroneDemonstrationsOn: (data: AgriDroneDemonstrationsOnFormData) =>
        apiClient.post<ApiResponse<AgriDroneDemonstrationsOn>>(`${BASE_URL}/agri-drone-demonstrations-on`, data),
    updateAgriDroneDemonstrationsOn: (id: number, data: Partial<AgriDroneDemonstrationsOnFormData>) =>
        apiClient.put<ApiResponse<AgriDroneDemonstrationsOn>>(`${BASE_URL}/agri-drone-demonstrations-on/${id}`, data),
    deleteAgriDroneDemonstrationsOn: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/agri-drone-demonstrations-on/${id}`),

    // ============================================
    // Statistics API
    // ============================================
    getStats: () =>
        apiClient.get<ApiResponse<ProductionProjectsStats>>(`${BASE_URL}/stats`),
};
