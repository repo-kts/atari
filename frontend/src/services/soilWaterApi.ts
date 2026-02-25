import { apiClient } from './api';

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    error?: string;
    message?: string;
    count?: number;
}

export const soilWaterApi = {
    // Analysis Masters
    getAnalysisMasters: () => apiClient.get<ApiResponse<any[]>>('/forms/achievements/soil-water/analysis-masters'),

    // Equipment
    getAllEquipment: () => apiClient.get<ApiResponse<any[]>>('/forms/achievements/soil-water/equipments'),
    getEquipment: (id: string) => apiClient.get<ApiResponse<any>>(`/forms/achievements/soil-water/equipments/${id}`),
    createEquipment: (data: any) => apiClient.post<ApiResponse<any>>('/forms/achievements/soil-water/equipments', data),
    updateEquipment: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/forms/achievements/soil-water/equipments/${id}`, data),
    deleteEquipment: (id: string) => apiClient.delete<ApiResponse<any>>(`/forms/achievements/soil-water/equipments/${id}`),

    // Analysis
    getAllAnalysis: () => apiClient.get<ApiResponse<any[]>>('/forms/achievements/soil-water/analysis'),
    getAnalysis: (id: string) => apiClient.get<ApiResponse<any>>(`/forms/achievements/soil-water/analysis/${id}`),
    createAnalysis: (data: any) => apiClient.post<ApiResponse<any>>('/forms/achievements/soil-water/analysis', data),
    updateAnalysis: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/forms/achievements/soil-water/analysis/${id}`, data),
    deleteAnalysis: (id: string) => apiClient.delete<ApiResponse<any>>(`/forms/achievements/soil-water/analysis/${id}`),

    // World Soil Day
    getAllWorldSoilDay: () => apiClient.get<ApiResponse<any[]>>('/forms/achievements/soil-water/world-soil-day'),
    getWorldSoilDay: (id: string) => apiClient.get<ApiResponse<any>>(`/forms/achievements/soil-water/world-soil-day/${id}`),
    createWorldSoilDay: (data: any) => apiClient.post<ApiResponse<any>>('/forms/achievements/soil-water/world-soil-day', data),
    updateWorldSoilDay: (id: string, data: any) => apiClient.patch<ApiResponse<any>>(`/forms/achievements/soil-water/world-soil-day/${id}`, data),
    deleteWorldSoilDay: (id: string) => apiClient.delete<ApiResponse<any>>(`/forms/achievements/soil-water/world-soil-day/${id}`),
};
