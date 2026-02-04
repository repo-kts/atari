import { apiClient } from './api';
import type {
    ApiResponse,
    PaginatedResponse,
    TrainingType,
    TrainingArea,
    TrainingThematicArea,
    ExtensionActivity,
    OtherExtensionActivity,
    Event,
    TrainingTypeFormData,
    TrainingAreaFormData,
    TrainingThematicAreaFormData,
    ExtensionActivityFormData,
    OtherExtensionActivityFormData,
    EventFormData,
    TrainingExtensionEventsStats,
} from '../types/trainingExtensionEvents';

const BASE_URL = '/admin/masters';

/**
 * Training, Extension & Events Master Data API Client
 */
export const trainingExtensionEventsApi = {
    // ============================================
    // Training Type APIs
    // ============================================
    getTrainingTypes: () =>
        apiClient.get<PaginatedResponse<TrainingType>>(`${BASE_URL}/training/types`),

    getTrainingTypeById: (id: number) =>
        apiClient.get<ApiResponse<TrainingType>>(`${BASE_URL}/training/types/${id}`),

    createTrainingType: (data: TrainingTypeFormData) =>
        apiClient.post<ApiResponse<TrainingType>>(`${BASE_URL}/training/types`, data),

    updateTrainingType: (id: number, data: Partial<TrainingTypeFormData>) =>
        apiClient.put<ApiResponse<TrainingType>>(`${BASE_URL}/training/types/${id}`, data),

    deleteTrainingType: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/training/types/${id}`),

    // ============================================
    // Training Area APIs
    // ============================================
    getTrainingAreas: () =>
        apiClient.get<PaginatedResponse<TrainingArea>>(`${BASE_URL}/training/areas`),

    getTrainingAreaById: (id: number) =>
        apiClient.get<ApiResponse<TrainingArea>>(`${BASE_URL}/training/areas/${id}`),

    createTrainingArea: (data: TrainingAreaFormData) =>
        apiClient.post<ApiResponse<TrainingArea>>(`${BASE_URL}/training/areas`, data),

    updateTrainingArea: (id: number, data: Partial<TrainingAreaFormData>) =>
        apiClient.put<ApiResponse<TrainingArea>>(`${BASE_URL}/training/areas/${id}`, data),

    deleteTrainingArea: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/training/areas/${id}`),

    getTrainingAreasByType: (trainingTypeId: number) =>
        apiClient.get<ApiResponse<TrainingArea[]>>(`${BASE_URL}/training/types/${trainingTypeId}/areas`),

    // ============================================
    // Training Thematic Area APIs
    // ============================================
    getTrainingThematicAreas: () =>
        apiClient.get<PaginatedResponse<TrainingThematicArea>>(`${BASE_URL}/training/thematic-areas`),

    getTrainingThematicAreaById: (id: number) =>
        apiClient.get<ApiResponse<TrainingThematicArea>>(`${BASE_URL}/training/thematic-areas/${id}`),

    createTrainingThematicArea: (data: TrainingThematicAreaFormData) =>
        apiClient.post<ApiResponse<TrainingThematicArea>>(`${BASE_URL}/training/thematic-areas`, data),

    updateTrainingThematicArea: (id: number, data: Partial<TrainingThematicAreaFormData>) =>
        apiClient.put<ApiResponse<TrainingThematicArea>>(`${BASE_URL}/training/thematic-areas/${id}`, data),

    deleteTrainingThematicArea: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/training/thematic-areas/${id}`),

    getTrainingThematicAreasByArea: (trainingAreaId: number) =>
        apiClient.get<ApiResponse<TrainingThematicArea[]>>(`${BASE_URL}/training/areas/${trainingAreaId}/thematic-areas`),

    // ============================================
    // Extension Activity APIs
    // ============================================
    getExtensionActivities: () =>
        apiClient.get<PaginatedResponse<ExtensionActivity>>(`${BASE_URL}/extension-activities`),

    getExtensionActivityById: (id: number) =>
        apiClient.get<ApiResponse<ExtensionActivity>>(`${BASE_URL}/extension-activities/${id}`),

    createExtensionActivity: (data: ExtensionActivityFormData) =>
        apiClient.post<ApiResponse<ExtensionActivity>>(`${BASE_URL}/extension-activities`, data),

    updateExtensionActivity: (id: number, data: Partial<ExtensionActivityFormData>) =>
        apiClient.put<ApiResponse<ExtensionActivity>>(`${BASE_URL}/extension-activities/${id}`, data),

    deleteExtensionActivity: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/extension-activities/${id}`),

    // ============================================
    // Other Extension Activity APIs
    // ============================================
    getOtherExtensionActivities: () =>
        apiClient.get<PaginatedResponse<OtherExtensionActivity>>(`${BASE_URL}/other-extension-activities`),

    getOtherExtensionActivityById: (id: number) =>
        apiClient.get<ApiResponse<OtherExtensionActivity>>(`${BASE_URL}/other-extension-activities/${id}`),

    createOtherExtensionActivity: (data: OtherExtensionActivityFormData) =>
        apiClient.post<ApiResponse<OtherExtensionActivity>>(`${BASE_URL}/other-extension-activities`, data),

    updateOtherExtensionActivity: (id: number, data: Partial<OtherExtensionActivityFormData>) =>
        apiClient.put<ApiResponse<OtherExtensionActivity>>(`${BASE_URL}/other-extension-activities/${id}`, data),

    deleteOtherExtensionActivity: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/other-extension-activities/${id}`),

    // ============================================
    // Event APIs
    // ============================================
    getEvents: () =>
        apiClient.get<PaginatedResponse<Event>>(`${BASE_URL}/events`),

    getEventById: (id: number) =>
        apiClient.get<ApiResponse<Event>>(`${BASE_URL}/events/${id}`),

    createEvent: (data: EventFormData) =>
        apiClient.post<ApiResponse<Event>>(`${BASE_URL}/events`, data),

    updateEvent: (id: number, data: Partial<EventFormData>) =>
        apiClient.put<ApiResponse<Event>>(`${BASE_URL}/events/${id}`, data),

    deleteEvent: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/events/${id}`),

    // ============================================
    // Statistics API
    // ============================================
    getStats: () =>
        apiClient.get<ApiResponse<TrainingExtensionEventsStats>>(`${BASE_URL}/stats`),
};
