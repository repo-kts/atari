import { apiClient } from './api';
import type {
    ApiResponse,
    PublicationDetails,
    PublicationDetailsFormData,
    PaginatedResponse,
} from '../types/publicationDetails';

const BASE_URL = '/forms/achievements/publication-details';

/**
 * Publication Details API Client
 * Handles all API calls for KVK Publication Details
 */
export const publicationDetailsApi = {
    /**
     * Get all publication details records
     * @param {object} filters - Optional filters
     * @returns {Promise<PaginatedResponse<PublicationDetails>>}
     */
    getPublicationDetails: (filters?: Record<string, any>) => {
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
        return apiClient.get<PaginatedResponse<PublicationDetails>>(url);
    },

    /**
     * Get publication details record by ID
     * @param {string} id - Publication details UUID
     * @returns {Promise<ApiResponse<PublicationDetails>>}
     */
    getPublicationDetailsById: (id: string) =>
        apiClient.get<ApiResponse<PublicationDetails>>(`${BASE_URL}/${id}`),

    /**
     * Create a new publication details record
     * @param {PublicationDetailsFormData} data - Publication details data
     * @returns {Promise<ApiResponse<PublicationDetails>>}
     */
    createPublicationDetails: (data: PublicationDetailsFormData) =>
        apiClient.post<ApiResponse<PublicationDetails>>(BASE_URL, data), 

    /**
     * Update publication details record
     * @param {string} id - Publication details UUID
     * @param {Partial<PublicationDetailsFormData>} data - Updated data
     * @returns {Promise<ApiResponse<PublicationDetails>>}
     */
    updatePublicationDetails: (id: string, data: Partial<PublicationDetailsFormData>) =>
        apiClient.patch<ApiResponse<PublicationDetails>>(`${BASE_URL}/${id}`, data),

    /**
     * Delete publication details record
     * @param {string} id - Publication details UUID
     * @returns {Promise<ApiResponse<void>>}
     */
    deletePublicationDetails: (id: string) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`),
};
