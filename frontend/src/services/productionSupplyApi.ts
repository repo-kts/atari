import { apiClient } from './api';
import type {
    ApiResponse,
    ProductionSupply,
    ProductionSupplyFormData,
} from '../types/productionSupply';

const BASE_URL = '/forms/achievements/production-supply';

/**
 * Production Supply API Client
 * Handles all API calls for Production and Supply of Technological Products
 */
export const productionSupplyApi = {
    /**
     * Get all production supply records
     * @param {object} filters - Optional filters
     * @returns {Promise<PaginatedResponse<ProductionSupply>>}
     */
    getProductionSupplies: (filters?: Record<string, any>) => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, String(value));
                }
            });
        }
        const queryString = queryParams.toString();
        const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
        return apiClient.get<ApiResponse<ProductionSupply[]>>(url);
    },

    /**
     * Get production supply record by ID
     * @param {string} id - Production supply UUID
     * @returns {Promise<ApiResponse<ProductionSupply>>}
     */
    getProductionSupplyById: (id: string) =>
        apiClient.get<ApiResponse<ProductionSupply>>(`${BASE_URL}/${id}`),

    /**
     * Create a new production supply record
     * @param {ProductionSupplyFormData} data - Production supply data
     * @returns {Promise<ApiResponse<ProductionSupply>>}
     */
    createProductionSupply: (data: ProductionSupplyFormData) =>
        apiClient.post<ApiResponse<ProductionSupply>>(BASE_URL, data),

    /**
     * Update production supply record
     * @param {string} id - Production supply UUID
     * @param {Partial<ProductionSupplyFormData>} data - Updated data
     * @returns {Promise<ApiResponse<ProductionSupply>>}
     */
    updateProductionSupply: (id: string, data: Partial<ProductionSupplyFormData>) =>
        apiClient.patch<ApiResponse<ProductionSupply>>(`${BASE_URL}/${id}`, data),

    /**
     * Delete production supply record
     * @param {string} id - Production supply UUID
     * @returns {Promise<ApiResponse<void>>}
     */
    deleteProductionSupply: (id: string) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`),
};
