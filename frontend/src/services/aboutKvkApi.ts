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
    KvkLandDetail,
    KvkFormData,
    KvkBankAccountFormData,
    KvkEmployeeFormData,
    KvkInfrastructureFormData,
    KvkVehicleFormData,
    KvkEquipmentFormData,
    KvkFarmImplementFormData,
    KvkLandDetailFormData,
} from '../types/aboutKvk';

const BASE_URL = '/forms/about-kvk';

const KVK_ALLOWED_KEYS = [
    'kvkName', 'zoneId', 'stateId', 'districtId', 'orgId', 'universityId',
    'mobile', 'landline', 'fax', 'email', 'address',
    'hostOrg', 'hostMobile', 'hostLandline', 'hostFax', 'hostEmail', 'hostAddress',
    'yearOfSanction', 'landDetails',
] as const;

const BANK_ACCOUNT_ALLOWED_KEYS = [
    'kvkId', 'accountType', 'accountName', 'bankName', 'location', 'accountNumber',
] as const;

const STAFF_ALLOWED_KEYS = [
    'kvkId', 'staffName', 'email', 'mobile', 'dateOfBirth', 'photoPath', 'resumePath',
    'sanctionedPostId', 'positionOrder', 'disciplineId', 'payScaleId', 'dateOfJoining',
    'jobType', 'allowances', 'transferStatus', 'sourceKvkIds', 'originalKvkId',
    'staffCategoryId', 'payLevelId',
] as const;

const INFRASTRUCTURE_ALLOWED_KEYS = [
    'kvkId', 'infraMasterId', 'notYetStarted', 'completedPlinthLevel', 'completedLintelLevel',
    'completedRoofLevel', 'totallyCompleted', 'plinthAreaSqM', 'underUse', 'sourceOfFunding',
] as const;

const VEHICLE_ALLOWED_KEYS = [
    'kvkId', 'vehicleName', 'registrationNo', 'yearOfPurchase', 'totalCost',
] as const;

const VEHICLE_DETAIL_ALLOWED_KEYS = [
    'kvkId', 'vehicleId', 'reportingYear', 'totalRun', 'repairingCost', 'sourceOfFunding', 'vehicleStatusId',
] as const;

const EQUIPMENT_ALLOWED_KEYS = [
    'kvkId', 'equipmentName', 'identifierCode', 'yearOfPurchase', 'totalCost', 'sourceOfFunding', 'type',
] as const;

const EQUIPMENT_DETAIL_ALLOWED_KEYS = [
    'kvkId', 'equipmentId', 'reportingYear', 'sourceOfFunding', 'equipmentStatusId',
] as const;

const FARM_IMPLEMENT_ALLOWED_KEYS = [
    'kvkId', 'implementName', 'yearOfPurchase', 'totalCost', 'presentStatus', 'sourceOfFund',
] as const;

const LAND_DETAIL_ALLOWED_KEYS = [
    'kvkId', 'item', 'areaHa',
] as const;

function normalizeBankAccountType(value: unknown): 'KVK' | 'REVOLVING_FUND' | 'OTHER' {
    const normalized = String(value ?? '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_');

    if (normalized === 'REVOLVING_FUND') return 'REVOLVING_FUND';
    if (normalized === 'OTHER') return 'OTHER';
    return 'KVK';
}

function pickAllowedFields<TData>(
    data: Partial<TData>,
    allowedKeys: readonly string[]
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    for (const key of allowedKeys) {
        const value = (data as Record<string, unknown>)[key];
        if (value !== undefined) {
            payload[key] = value;
        }
    }

    return payload;
}

function createSanitizedPostEndpoint<TData, TResponse = TData>(
    path: string,
    allowedKeys: readonly string[],
    normalize?: (payload: Record<string, unknown>) => Record<string, unknown>
) {
    return (data: TData) => {
        const basePayload = pickAllowedFields(data as Partial<TData>, allowedKeys);
        const payload = normalize ? normalize(basePayload) : basePayload;
        return apiClient.post<ApiResponse<TResponse>>(`${BASE_URL}${path}`, payload);
    };
}

function createSanitizedPutEndpoint<TData, TResponse = TData>(
    path: string,
    allowedKeys: readonly string[],
    normalize?: (payload: Record<string, unknown>) => Record<string, unknown>
) {
    return (id: number, data: Partial<TData>) => {
        const basePayload = pickAllowedFields(data, allowedKeys);
        const payload = normalize ? normalize(basePayload) : basePayload;
        return apiClient.put<ApiResponse<TResponse>>(`${BASE_URL}${path}/${id}`, payload);
    };
}

function normalizeBankAccountPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const normalized = { ...payload };
    if (normalized.accountType !== undefined) {
        normalized.accountType = normalizeBankAccountType(normalized.accountType);
    }
    return normalized;
}

function normalizeCommonStringFields(payload: Record<string, unknown>): Record<string, unknown> {
    const normalized = { ...payload };
    for (const [key, value] of Object.entries(normalized)) {
        if (typeof value === 'string') {
            normalized[key] = value.trim();
        }
    }
    return normalized;
}

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
    createKvk: createSanitizedPostEndpoint<KvkFormData, Kvk>('/kvks', KVK_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvk: createSanitizedPutEndpoint<KvkFormData, Kvk>('/kvks', KVK_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvk: createDeleteEndpoint('/kvks'),

    // ============================================
    // Bank Accounts
    // ============================================
    getKvkBankAccounts: createGetEndpoint<KvkBankAccount>('/bank-accounts'),
    getKvkBankAccountById: createGetByIdEndpoint<KvkBankAccount>('/bank-accounts'),
    createKvkBankAccount: createSanitizedPostEndpoint<KvkBankAccountFormData, KvkBankAccount>(
        '/bank-accounts',
        BANK_ACCOUNT_ALLOWED_KEYS,
        normalizeBankAccountPayload
    ),
    updateKvkBankAccount: createSanitizedPutEndpoint<KvkBankAccountFormData, KvkBankAccount>(
        '/bank-accounts',
        BANK_ACCOUNT_ALLOWED_KEYS,
        normalizeBankAccountPayload
    ),
    deleteKvkBankAccount: createDeleteEndpoint('/bank-accounts'),

    // ============================================
    // Employees
    // ============================================
    getKvkEmployees: createGetEndpoint<KvkEmployee>('/employees'),
    getKvkEmployeeById: createGetByIdEndpoint<KvkEmployee>('/employees'),
    createKvkEmployee: createSanitizedPostEndpoint<KvkEmployeeFormData, KvkEmployee>('/employees', STAFF_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkEmployee: createSanitizedPutEndpoint<KvkEmployeeFormData, KvkEmployee>('/employees', STAFF_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkEmployee: createDeleteEndpoint('/employees'),

    transferKvkEmployee: (id: number, targetKvkId: number, transferReason?: string, notes?: string, transferDate?: string) =>
        apiClient.post<ApiResponse<{ employee: KvkEmployee; transferHistory: StaffTransferHistory }>>(
            `${BASE_URL}/employees/${id}/transfer`,
            { targetKvkId, transferReason, notes, transferDate }
        ),
    getStaffTransferHistory: (staffId: number, params?: QueryParams) => {
        const url = buildUrlWithQuery(`${BASE_URL}/employees/${staffId}/transfer-history`, params);
        return apiClient.get<PaginatedResponse<StaffTransferHistory>>(url);
    },
    revertTransfer: (transferId: number, targetKvkId?: number, reason?: string, notes?: string, transferDate?: string) =>
        apiClient.post<ApiResponse<{ employee: KvkEmployee; transferHistory: StaffTransferHistory }>>(
            `${BASE_URL}/employees/${transferId}/transfer/revert`,
            { targetKvkId, reason, notes, transferDate }
        ),

    // ============================================
    // Staff Transferred
    // ============================================
    getKvkStaffTransferred: createGetEndpoint<KvkEmployee>('/staff-transferred'),
    createKvkStaffTransferred: createSanitizedPostEndpoint<KvkEmployeeFormData, KvkEmployee>('/staff-transferred', STAFF_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkStaffTransferred: createSanitizedPutEndpoint<KvkEmployeeFormData, KvkEmployee>('/staff-transferred', STAFF_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkStaffTransferred: createDeleteEndpoint('/staff-transferred'),

    // ============================================
    // Infrastructure
    // ============================================
    getKvkInfrastructure: createGetEndpoint<KvkInfrastructure>('/infrastructure'),
    getKvkInfrastructureById: createGetByIdEndpoint<KvkInfrastructure>('/infrastructure'),
    createKvkInfrastructure: createSanitizedPostEndpoint<KvkInfrastructureFormData, KvkInfrastructure>('/infrastructure', INFRASTRUCTURE_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkInfrastructure: createSanitizedPutEndpoint<KvkInfrastructureFormData, KvkInfrastructure>('/infrastructure', INFRASTRUCTURE_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkInfrastructure: createDeleteEndpoint('/infrastructure'),

    // ============================================
    // Vehicles
    // ============================================
    getKvkVehicles: createGetEndpoint<KvkVehicle>('/vehicles'),
    getKvkVehicleById: createGetByIdEndpoint<KvkVehicle>('/vehicles'),
    createKvkVehicle: createSanitizedPostEndpoint<KvkVehicleFormData, KvkVehicle>('/vehicles', VEHICLE_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkVehicle: createSanitizedPutEndpoint<KvkVehicleFormData, KvkVehicle>('/vehicles', VEHICLE_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkVehicle: createDeleteEndpoint('/vehicles'),

    // Vehicle Details (Alias)
    getKvkVehicleDetails: createGetEndpoint<KvkVehicle>('/vehicle-details'),
    createKvkVehicleDetails: createSanitizedPostEndpoint<KvkVehicleFormData, KvkVehicle>('/vehicle-details', VEHICLE_DETAIL_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkVehicleDetails: createSanitizedPutEndpoint<KvkVehicleFormData, KvkVehicle>('/vehicle-details', VEHICLE_DETAIL_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkVehicleDetails: createDeleteEndpoint('/vehicle-details'),

    // ============================================
    // Equipments
    // ============================================
    getKvkEquipments: createGetEndpoint<KvkEquipment>('/equipments'),
    getKvkEquipmentById: createGetByIdEndpoint<KvkEquipment>('/equipments'),
    createKvkEquipment: createSanitizedPostEndpoint<KvkEquipmentFormData, KvkEquipment>('/equipments', EQUIPMENT_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkEquipment: createSanitizedPutEndpoint<KvkEquipmentFormData, KvkEquipment>('/equipments', EQUIPMENT_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkEquipment: createDeleteEndpoint('/equipments'),

    // Equipment Details (Alias)
    getKvkEquipmentDetails: createGetEndpoint<KvkEquipment>('/equipment-details'),
    createKvkEquipmentDetails: createSanitizedPostEndpoint<KvkEquipmentFormData, KvkEquipment>('/equipment-details', EQUIPMENT_DETAIL_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkEquipmentDetails: createSanitizedPutEndpoint<KvkEquipmentFormData, KvkEquipment>('/equipment-details', EQUIPMENT_DETAIL_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkEquipmentDetails: createDeleteEndpoint('/equipment-details'),

    // ============================================
    // Farm Implements
    // ============================================
    getKvkFarmImplements: createGetEndpoint<KvkFarmImplement>('/farm-implements'),
    getKvkFarmImplementById: createGetByIdEndpoint<KvkFarmImplement>('/farm-implements'),
    createKvkFarmImplement: createSanitizedPostEndpoint<KvkFarmImplementFormData, KvkFarmImplement>('/farm-implements', FARM_IMPLEMENT_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkFarmImplement: createSanitizedPutEndpoint<KvkFarmImplementFormData, KvkFarmImplement>('/farm-implements', FARM_IMPLEMENT_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkFarmImplement: createDeleteEndpoint('/farm-implements'),

    // ============================================
    // Land Details
    // ============================================
    getKvkLandDetails: createGetEndpoint<KvkLandDetail>('/land-details'),
    getKvkLandDetailById: createGetByIdEndpoint<KvkLandDetail>('/land-details'),
    createKvkLandDetail: createSanitizedPostEndpoint<KvkLandDetailFormData, KvkLandDetail>('/land-details', LAND_DETAIL_ALLOWED_KEYS, normalizeCommonStringFields),
    updateKvkLandDetail: createSanitizedPutEndpoint<KvkLandDetailFormData, KvkLandDetail>('/land-details', LAND_DETAIL_ALLOWED_KEYS, normalizeCommonStringFields),
    deleteKvkLandDetail: createDeleteEndpoint('/land-details'),

    // ============================================
    // Master Data (for dropdowns)
    // ============================================
    getSanctionedPosts: () => apiClient.get<ApiResponse<any[]>>(`${BASE_URL}/sanctioned-posts`),
    getDisciplines: () => apiClient.get<ApiResponse<any[]>>(`${BASE_URL}/disciplines`),
    getInfraMasters: () => apiClient.get<ApiResponse<any[]>>(`${BASE_URL}/infra-masters`),
    getKvkStaffForDropdown: (kvkId: number) =>
        apiClient.get<ApiResponse<Array<{ kvkStaffId: number; staffName: string; email?: string; sanctionedPost?: { postName: string } }>>>(
            `${BASE_URL}/staff-dropdown?kvkId=${kvkId}`
        ),

    // ============================================
    // Dropdown helpers for vehicle/equipment details
    // ============================================
    getVehiclesDropdown: (kvkId?: number, reportingYear?: string) => {
        const url = buildUrlWithQuery(
            `${BASE_URL}/vehicles-dropdown`,
            kvkId ? { kvkId, ...(reportingYear ? { reportingYear } : {}) } : undefined
        );
        return apiClient.get<ApiResponse<any[]>>(url);
    },
    getEquipmentsDropdown: (kvkId?: number, reportingYear?: string) => {
        const url = buildUrlWithQuery(
            `${BASE_URL}/equipments-dropdown`,
            kvkId ? { kvkId, ...(reportingYear ? { reportingYear } : {}) } : undefined
        );
        return apiClient.get<ApiResponse<any[]>>(url);
    },

    // ============================================
    // Transfer History
    // ============================================
    getStaffTransfers: createGetEndpoint<StaffTransferHistory>('/staff-transfers'),
};
