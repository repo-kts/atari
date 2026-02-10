import { apiClient } from './api';
import type {
    ApiResponse,
    PaginatedResponse,
    Kvk,
    KvkBankAccount,
    KvkEmployee,
    KvkInfrastructure,
    KvkVehicle,
    KvkEquipment,
    KvkFarmImplement,
    KvkFormData,
    KvkBankAccountFormData,
    KvkEmployeeFormData,
    KvkInfrastructureFormData,
    KvkVehicleFormData,
    KvkEquipmentFormData,
    KvkFarmImplementFormData,
} from '../types/aboutKvk';

const BASE_URL = '/forms/about-kvk';

export const aboutKvkApi = {
    // KVKs
    getKvks: (params?: any) => apiClient.get<PaginatedResponse<Kvk>>(`${BASE_URL}/kvks`, { ...params }),
    getKvkById: (id: number) => apiClient.get<ApiResponse<Kvk>>(`${BASE_URL}/kvks/${id}`),
    createKvk: (data: KvkFormData) => apiClient.post<ApiResponse<Kvk>>(`${BASE_URL}/kvks`, data),
    updateKvk: (id: number, data: Partial<KvkFormData>) => apiClient.put<ApiResponse<Kvk>>(`${BASE_URL}/kvks/${id}`, data),
    deleteKvk: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/kvks/${id}`),

    // Bank Accounts
    getKvkBankAccounts: (params?: any) => apiClient.get<PaginatedResponse<KvkBankAccount>>(`${BASE_URL}/bank-accounts`, { ...params }),
    getKvkBankAccountById: (id: number) => apiClient.get<ApiResponse<KvkBankAccount>>(`${BASE_URL}/bank-accounts/${id}`),
    createKvkBankAccount: (data: KvkBankAccountFormData) => apiClient.post<ApiResponse<KvkBankAccount>>(`${BASE_URL}/bank-accounts`, data),
    updateKvkBankAccount: (id: number, data: Partial<KvkBankAccountFormData>) => apiClient.put<ApiResponse<KvkBankAccount>>(`${BASE_URL}/bank-accounts/${id}`, data),
    deleteKvkBankAccount: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/bank-accounts/${id}`),

    // Employees
    getKvkEmployees: (params?: any) => apiClient.get<PaginatedResponse<KvkEmployee>>(`${BASE_URL}/employees`, { ...params }),
    getKvkEmployeeById: (id: number) => apiClient.get<ApiResponse<KvkEmployee>>(`${BASE_URL}/employees/${id}`),
    createKvkEmployee: (data: KvkEmployeeFormData) => apiClient.post<ApiResponse<KvkEmployee>>(`${BASE_URL}/employees`, data),
    updateKvkEmployee: (id: number, data: Partial<KvkEmployeeFormData>) => apiClient.put<ApiResponse<KvkEmployee>>(`${BASE_URL}/employees/${id}`, data),
    deleteKvkEmployee: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/employees/${id}`),

    // Staff Transferred
    getKvkStaffTransferred: (params?: any) => apiClient.get<PaginatedResponse<KvkEmployee>>(`${BASE_URL}/staff-transferred`, { ...params }),
    // Use employee methods for create/update/delete as it's the same entity, just filtered view
    // Or if backend has specific endpoints for transfer logic, use them. 
    // For now assuming we manage them via employee endpoints or specific transfer endpoints if created.
    // The backend routes exist for staff-transferred, so we use them:
    createKvkStaffTransferred: (data: KvkEmployeeFormData) => apiClient.post<ApiResponse<KvkEmployee>>(`${BASE_URL}/staff-transferred`, data),
    updateKvkStaffTransferred: (id: number, data: Partial<KvkEmployeeFormData>) => apiClient.put<ApiResponse<KvkEmployee>>(`${BASE_URL}/staff-transferred/${id}`, data),
    deleteKvkStaffTransferred: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/staff-transferred/${id}`),

    // Infrastructure
    getKvkInfrastructure: (params?: any) => apiClient.get<PaginatedResponse<KvkInfrastructure>>(`${BASE_URL}/infrastructure`, { ...params }),
    getKvkInfrastructureById: (id: number) => apiClient.get<ApiResponse<KvkInfrastructure>>(`${BASE_URL}/infrastructure/${id}`),
    createKvkInfrastructure: (data: KvkInfrastructureFormData) => apiClient.post<ApiResponse<KvkInfrastructure>>(`${BASE_URL}/infrastructure`, data),
    updateKvkInfrastructure: (id: number, data: Partial<KvkInfrastructureFormData>) => apiClient.put<ApiResponse<KvkInfrastructure>>(`${BASE_URL}/infrastructure/${id}`, data),
    deleteKvkInfrastructure: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/infrastructure/${id}`),

    // Vehicles
    getKvkVehicles: (params?: any) => apiClient.get<PaginatedResponse<KvkVehicle>>(`${BASE_URL}/vehicles`, { ...params }),
    getKvkVehicleById: (id: number) => apiClient.get<ApiResponse<KvkVehicle>>(`${BASE_URL}/vehicles/${id}`),
    createKvkVehicle: (data: KvkVehicleFormData) => apiClient.post<ApiResponse<KvkVehicle>>(`${BASE_URL}/vehicles`, data),
    updateKvkVehicle: (id: number, data: Partial<KvkVehicleFormData>) => apiClient.put<ApiResponse<KvkVehicle>>(`${BASE_URL}/vehicles/${id}`, data),
    deleteKvkVehicle: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/vehicles/${id}`),

    // Vehicle Details (Alias)
    getKvkVehicleDetails: (params?: any) => apiClient.get<PaginatedResponse<KvkVehicle>>(`${BASE_URL}/vehicle-details`, { ...params }),
    createKvkVehicleDetails: (data: KvkVehicleFormData) => apiClient.post<ApiResponse<KvkVehicle>>(`${BASE_URL}/vehicle-details`, data),
    updateKvkVehicleDetails: (id: number, data: Partial<KvkVehicleFormData>) => apiClient.put<ApiResponse<KvkVehicle>>(`${BASE_URL}/vehicle-details/${id}`, data),
    deleteKvkVehicleDetails: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/vehicle-details/${id}`),

    // Equipments
    getKvkEquipments: (params?: any) => apiClient.get<PaginatedResponse<KvkEquipment>>(`${BASE_URL}/equipments`, { ...params }),
    getKvkEquipmentById: (id: number) => apiClient.get<ApiResponse<KvkEquipment>>(`${BASE_URL}/equipments/${id}`),
    createKvkEquipment: (data: KvkEquipmentFormData) => apiClient.post<ApiResponse<KvkEquipment>>(`${BASE_URL}/equipments`, data),
    updateKvkEquipment: (id: number, data: Partial<KvkEquipmentFormData>) => apiClient.put<ApiResponse<KvkEquipment>>(`${BASE_URL}/equipments/${id}`, data),
    deleteKvkEquipment: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/equipments/${id}`),

    // Equipment Details (Alias)
    getKvkEquipmentDetails: (params?: any) => apiClient.get<PaginatedResponse<KvkEquipment>>(`${BASE_URL}/equipment-details`, { ...params }),
    createKvkEquipmentDetails: (data: KvkEquipmentFormData) => apiClient.post<ApiResponse<KvkEquipment>>(`${BASE_URL}/equipment-details`, data),
    updateKvkEquipmentDetails: (id: number, data: Partial<KvkEquipmentFormData>) => apiClient.put<ApiResponse<KvkEquipment>>(`${BASE_URL}/equipment-details/${id}`, data),
    deleteKvkEquipmentDetails: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/equipment-details/${id}`),

    // Farm Implements
    getKvkFarmImplements: (params?: any) => apiClient.get<PaginatedResponse<KvkFarmImplement>>(`${BASE_URL}/farm-implements`, { ...params }),
    getKvkFarmImplementById: (id: number) => apiClient.get<ApiResponse<KvkFarmImplement>>(`${BASE_URL}/farm-implements/${id}`),
    createKvkFarmImplement: (data: KvkFarmImplementFormData) => apiClient.post<ApiResponse<KvkFarmImplement>>(`${BASE_URL}/farm-implements`, data),
    updateKvkFarmImplement: (id: number, data: Partial<KvkFarmImplementFormData>) => apiClient.put<ApiResponse<KvkFarmImplement>>(`${BASE_URL}/farm-implements/${id}`, data),
    deleteKvkFarmImplement: (id: number) => apiClient.delete<ApiResponse<void>>(`${BASE_URL}/farm-implements/${id}`),
};
