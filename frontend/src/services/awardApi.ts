import { apiClient } from './api';
import { buildUrlWithQuery, type QueryParams } from '../utils/apiQueryBuilder';
import type { ApiResponse, PaginatedResponse } from '../types/aboutKvk';

// We can reuse types or define new ones. For now, using any for data since types might not exist for awards yet
const BASE_URL_KVK_AWARDS = '/forms/achievements/kvk-awards';
const BASE_URL_SCIENTIST_AWARDS = '/forms/achievements/scientist-awards';
const BASE_URL_FARMER_AWARDS = '/forms/achievements/farmer-awards';

/**
 * Creates a generic GET endpoint for paginated responses
 */
function createGetEndpoint<T>(baseUrl: string) {
    return (params?: QueryParams) => {
        const url = buildUrlWithQuery(baseUrl, params);
        return apiClient.get<PaginatedResponse<T>>(url);
    };
}

/**
 * Creates a generic POST endpoint
 */
function createPostEndpoint<TData, TResponse = TData>(baseUrl: string) {
    return (data: TData) => {
        return apiClient.post<ApiResponse<TResponse>>(baseUrl, data);
    };
}

/**
 * Creates a generic PATCH endpoint
 */
function createPatchEndpoint<TData, TResponse = TData>(baseUrl: string) {
    return (id: number, data: Partial<TData>) => {
        return apiClient.patch<ApiResponse<TResponse>>(`${baseUrl}/${id}`, data);
    };
}

/**
 * Creates a generic DELETE endpoint
 */
function createDeleteEndpoint(baseUrl: string) {
    return (id: number) => {
        return apiClient.delete<ApiResponse<void>>(`${baseUrl}/${id}`);
    };
}

export const awardApi = {
    // KVK Awards
    getKvkAwards: createGetEndpoint<any>(BASE_URL_KVK_AWARDS),
    createKvkAward: createPostEndpoint<any, any>(BASE_URL_KVK_AWARDS),
    updateKvkAward: createPatchEndpoint<any, any>(BASE_URL_KVK_AWARDS),
    deleteKvkAward: createDeleteEndpoint(BASE_URL_KVK_AWARDS),

    // Scientist Awards
    getScientistAwards: createGetEndpoint<any>(BASE_URL_SCIENTIST_AWARDS),
    createScientistAward: createPostEndpoint<any, any>(BASE_URL_SCIENTIST_AWARDS),
    updateScientistAward: createPatchEndpoint<any, any>(BASE_URL_SCIENTIST_AWARDS),
    deleteScientistAward: createDeleteEndpoint(BASE_URL_SCIENTIST_AWARDS),

    // Farmer Awards
    getFarmerAwards: createGetEndpoint<any>(BASE_URL_FARMER_AWARDS),
    createFarmerAward: createPostEndpoint<any, any>(BASE_URL_FARMER_AWARDS),
    updateFarmerAward: createPatchEndpoint<any, any>(BASE_URL_FARMER_AWARDS),
    deleteFarmerAward: createDeleteEndpoint(BASE_URL_FARMER_AWARDS),
};
