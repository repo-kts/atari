import { apiClient } from './api';

export const cfldApi = {
    // Technical Parameters
    getTechnicalParameters: () => apiClient.get<any>('/forms/achievements/cfld-technical-parameters'),
    getTechnicalParameterById: (id: number) => apiClient.get<any>(`/forms/achievements/cfld-technical-parameters/${id}`),
    createTechnicalParameter: (data: any) => apiClient.post<any>('/forms/achievements/cfld-technical-parameters', data),
    updateTechnicalParameter: (id: number, data: any) => apiClient.put<any>(`/forms/achievements/cfld-technical-parameters/${id}`, data),
    deleteTechnicalParameter: (id: number) => apiClient.delete<any>(`/forms/achievements/cfld-technical-parameters/${id}`),
};
