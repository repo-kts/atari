import { apiClient } from './api';
import { buildUrlWithQuery, type QueryParams } from '../utils/apiQueryBuilder';
import type {
    ApiResponse,
    PaginatedResponse,
    Kvk,
    KvkBankAccount,
    KvkEmployee,
    StaffTransferHistory,
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

// ============================================
// Generic Helper Functions
// ============================================

/**
 * Creates a generic GET endpoint for paginated responses
 */
function createGetEndpoint<T>(path: string) {
    return (params?: QueryParams) => {
        const url = buildUrlWithQuery(`${BASE_URL}${path}`, params);
        return apiClient.get<PaginatedResponse<T>>(url);
    };
}

/**
 * Creates a generic GET by ID endpoint
 */
function createGetByIdEndpoint<T>(path: string) {
    return (id: number) => {
        return apiClient.get<ApiResponse<T>>(`${BASE_URL}${path}/${id}`);
    };
}

/**
 * Creates a generic POST endpoint
 */
function createPostEndpoint<TData, TResponse = TData>(path: string) {
    return (data: TData) => {
        return apiClient.post<ApiResponse<TResponse>>(`${BASE_URL}${path}`, data);
    };
}

/**
 * Creates a generic PUT endpoint
 */
function createPutEndpoint<TData, TResponse = TData>(path: string) {
    return (id: number, data: Partial<TData>) => {
        return apiClient.put<ApiResponse<TResponse>>(`${BASE_URL}${path}/${id}`, data);
    };
}

/**
 * Creates a generic DELETE endpoint
 */
function createDeleteEndpoint(path: string) {
    return (id: number) => {
        return apiClient.delete<ApiResponse<void>>(`${BASE_URL}${path}/${id}`);
    };
}

export const aboutKvkApi = {
    // ============================================
    // KVKs
    // ============================================
    getKvks: createGetEndpoint<Kvk>('/kvks'),
    getAllKvksForDropdown: createGetEndpoint<Kvk>('/kvks-dropdown'),
    getKvkById: createGetByIdEndpoint<Kvk>('/kvks'),
    createKvk: createPostEndpoint<KvkFormData, Kvk>('/kvks'),
    updateKvk: createPutEndpoint<KvkFormData, Kvk>('/kvks'),
    deleteKvk: createDeleteEndpoint('/kvks'),

    // ============================================
    // Bank Accounts
    // ============================================
    getKvkBankAccounts: createGetEndpoint<KvkBankAccount>('/bank-accounts'),
    getKvkBankAccountById: createGetByIdEndpoint<KvkBankAccount>('/bank-accounts'),
    createKvkBankAccount: createPostEndpoint<KvkBankAccountFormData, KvkBankAccount>('/bank-accounts'),
    updateKvkBankAccount: createPutEndpoint<KvkBankAccountFormData, KvkBankAccount>('/bank-accounts'),
    deleteKvkBankAccount: createDeleteEndpoint('/bank-accounts'),

    // ============================================
    // Employees
    // ============================================
    getKvkEmployees: createGetEndpoint<KvkEmployee>('/employees'),
    getKvkEmployeeById: createGetByIdEndpoint<KvkEmployee>('/employees'),
    createKvkEmployee: createPostEndpoint<KvkEmployeeFormData, KvkEmployee>('/employees'),
    updateKvkEmployee: createPutEndpoint<KvkEmployeeFormData, KvkEmployee>('/employees'),
    deleteKvkEmployee: createDeleteEndpoint('/employees'),

    transferKvkEmployee: (id: number, targetKvkId: number, transferReason?: string, notes?: string) =>
        apiClient.post<ApiResponse<{ employee: KvkEmployee; transferHistory: StaffTransferHistory }>>(
            `${BASE_URL}/employees/${id}/transfer`,
            { targetKvkId, transferReason, notes }
        ),
    getStaffTransferHistory: (staffId: number, params?: QueryParams) => {
        const url = buildUrlWithQuery(`${BASE_URL}/employees/${staffId}/transfer-history`, params);
        return apiClient.get<PaginatedResponse<StaffTransferHistory>>(url);
    },
    revertTransfer: (transferId: number, targetKvkId?: number, reason?: string, notes?: string) =>
        apiClient.post<ApiResponse<{ employee: KvkEmployee; transferHistory: StaffTransferHistory }>>(
            `${BASE_URL}/employees/${transferId}/transfer/revert`,
            { targetKvkId, reason, notes }
        ),

    // ============================================
    // Staff Transferred
    // ============================================
    getKvkStaffTransferred: createGetEndpoint<KvkEmployee>('/staff-transferred'),
    createKvkStaffTransferred: createPostEndpoint<KvkEmployeeFormData, KvkEmployee>('/staff-transferred'),
    updateKvkStaffTransferred: createPutEndpoint<KvkEmployeeFormData, KvkEmployee>('/staff-transferred'),
    deleteKvkStaffTransferred: createDeleteEndpoint('/staff-transferred'),

    // ============================================
    // Infrastructure
    // ============================================
    getKvkInfrastructure: createGetEndpoint<KvkInfrastructure>('/infrastructure'),
    getKvkInfrastructureById: createGetByIdEndpoint<KvkInfrastructure>('/infrastructure'),
    createKvkInfrastructure: createPostEndpoint<KvkInfrastructureFormData, KvkInfrastructure>('/infrastructure'),
    updateKvkInfrastructure: createPutEndpoint<KvkInfrastructureFormData, KvkInfrastructure>('/infrastructure'),
    deleteKvkInfrastructure: createDeleteEndpoint('/infrastructure'),

    // ============================================
    // Vehicles
    // ============================================
    getKvkVehicles: createGetEndpoint<KvkVehicle>('/vehicles'),
    getKvkVehicleById: createGetByIdEndpoint<KvkVehicle>('/vehicles'),
    createKvkVehicle: createPostEndpoint<KvkVehicleFormData, KvkVehicle>('/vehicles'),
    updateKvkVehicle: createPutEndpoint<KvkVehicleFormData, KvkVehicle>('/vehicles'),
    deleteKvkVehicle: createDeleteEndpoint('/vehicles'),

    // Vehicle Details (Alias)
    getKvkVehicleDetails: createGetEndpoint<KvkVehicle>('/vehicle-details'),
    createKvkVehicleDetails: createPostEndpoint<KvkVehicleFormData, KvkVehicle>('/vehicle-details'),
    updateKvkVehicleDetails: createPutEndpoint<KvkVehicleFormData, KvkVehicle>('/vehicle-details'),
    deleteKvkVehicleDetails: createDeleteEndpoint('/vehicle-details'),

    // ============================================
    // Equipments
    // ============================================
    getKvkEquipments: createGetEndpoint<KvkEquipment>('/equipments'),
    getKvkEquipmentById: createGetByIdEndpoint<KvkEquipment>('/equipments'),
    createKvkEquipment: createPostEndpoint<KvkEquipmentFormData, KvkEquipment>('/equipments'),
    updateKvkEquipment: createPutEndpoint<KvkEquipmentFormData, KvkEquipment>('/equipments'),
    deleteKvkEquipment: createDeleteEndpoint('/equipments'),

    // Equipment Details (Alias)
    getKvkEquipmentDetails: createGetEndpoint<KvkEquipment>('/equipment-details'),
    createKvkEquipmentDetails: createPostEndpoint<KvkEquipmentFormData, KvkEquipment>('/equipment-details'),
    updateKvkEquipmentDetails: createPutEndpoint<KvkEquipmentFormData, KvkEquipment>('/equipment-details'),
    deleteKvkEquipmentDetails: createDeleteEndpoint('/equipment-details'),

    // ============================================
    // Farm Implements
    // ============================================
    getKvkFarmImplements: createGetEndpoint<KvkFarmImplement>('/farm-implements'),
    getKvkFarmImplementById: createGetByIdEndpoint<KvkFarmImplement>('/farm-implements'),
    createKvkFarmImplement: createPostEndpoint<KvkFarmImplementFormData, KvkFarmImplement>('/farm-implements'),
    updateKvkFarmImplement: createPutEndpoint<KvkFarmImplementFormData, KvkFarmImplement>('/farm-implements'),
    deleteKvkFarmImplement: createDeleteEndpoint('/farm-implements'),

    // ============================================
    // Master Data (for dropdowns)
    // ============================================
    getSanctionedPosts: () => apiClient.get<ApiResponse<any[]>>(`${BASE_URL}/sanctioned-posts`),
    getDisciplines: () => apiClient.get<ApiResponse<any[]>>(`${BASE_URL}/disciplines`),
    getInfraMasters: () => apiClient.get<ApiResponse<any[]>>(`${BASE_URL}/infra-masters`),

    // ============================================
    // Dropdown helpers for vehicle/equipment details
    // ============================================
    getVehiclesDropdown: (kvkId?: number) => {
        const url = buildUrlWithQuery(`${BASE_URL}/vehicles`, kvkId ? { kvkId } : undefined);
        return apiClient.get<ApiResponse<any[]>>(url);
    },
    getEquipmentsDropdown: (kvkId?: number) => {
        const url = buildUrlWithQuery(`${BASE_URL}/equipments`, kvkId ? { kvkId } : undefined);
        return apiClient.get<ApiResponse<any[]>>(url);
    },

    // ============================================
    // Transfer History
    // ============================================
    getStaffTransfers: createGetEndpoint<StaffTransferHistory>('/staff-transfers'),
};
