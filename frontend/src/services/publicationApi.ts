import { apiClient } from './api';
import type {
    PublicationItem,
    PublicationItemFormData,
    PublicationStats,
    PaginatedResponse,
} from '../types/publication';
import type { ApiResponse } from '../types/masterData';

const BASE_URL = '/admin/masters';

/**
 * API client for Publication master data
 */
export const publicationApi = {
    // ============================================
    // Publication Item APIs
    // ============================================
    getPublicationItems: () =>
        apiClient.get<PaginatedResponse<PublicationItem>>(`${BASE_URL}/publication-items`),

    getPublicationItemById: (id: number) =>
        apiClient.get<ApiResponse<PublicationItem>>(`${BASE_URL}/publication-items/${id}`),

    createPublicationItem: (data: PublicationItemFormData) =>
        apiClient.post<ApiResponse<PublicationItem>>(`${BASE_URL}/publication-items`, data),

    updatePublicationItem: (id: number, data: Partial<PublicationItemFormData>) =>
        apiClient.put<ApiResponse<PublicationItem>>(`${BASE_URL}/publication-items/${id}`, data),

    deletePublicationItem: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/publication-items/${id}`),

    // ============================================
    // Statistics API
    // ============================================
    getStats: () =>
        apiClient.get<ApiResponse<PublicationStats>>(`${BASE_URL}/stats`),
};
