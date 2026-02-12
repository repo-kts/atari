import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aboutKvkApi } from '@/services/aboutKvkApi';
import { useAuth } from '@/contexts/AuthContext';
import type {
    KvkFormData,
    KvkBankAccountFormData,
    KvkEmployeeFormData,
    KvkInfrastructureFormData,
    KvkVehicleFormData,
    KvkEquipmentFormData,
    KvkFarmImplementFormData,
} from '../../types/aboutKvk';
import { ENTITY_TYPES } from '../../constants/entityTypes';

// Helper to build user-aware query keys
// Takes user from hook context instead of accessing store directly
function buildQueryKey(baseKey: string | string[], params?: any, user?: any): any[] {
    const base = Array.isArray(baseKey) ? baseKey : [baseKey];
    return [...base, params, user?.userId ?? null, user?.role ?? null];
}

// Helper for mutation hooks pattern
function useEntityMutation<TData>(
    queryKey: string[],
    apiCalls: {
        create: (data: TData) => Promise<any>;
        update: (id: number, data: Partial<TData>) => Promise<any>;
        delete: (id: number) => Promise<any>;
    },
    relatedKeys: string[][] = []
) {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: TData) => apiCalls.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            relatedKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TData> }) =>
            apiCalls.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            relatedKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiCalls.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            relatedKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
        },
    });

    return {
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// KVK Hooks
// ============================================

export function useKvks(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvks', params, user),
        queryFn: () => aboutKvkApi.getKvks(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkFormData>(
        buildQueryKey('kvks', undefined, user),
        {
            create: aboutKvkApi.createKvk,
            update: aboutKvkApi.updateKvk,
            delete: aboutKvkApi.deleteKvk,
        }
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

// Hook to fetch ALL KVKs for dropdown (bypasses user filtering)
export function useAllKvksForDropdown(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvks-dropdown', params, user),
        queryFn: () => aboutKvkApi.getAllKvksForDropdown(params).then(res => res.data),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    };
}

// ============================================
// Bank Account Hooks
// ============================================

export function useKvkBankAccounts(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-bank-accounts', params, user),
        queryFn: () => aboutKvkApi.getKvkBankAccounts(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkBankAccountFormData>(
        buildQueryKey('kvk-bank-accounts', undefined, user),
        {
            create: aboutKvkApi.createKvkBankAccount,
            update: aboutKvkApi.updateKvkBankAccount,
            delete: aboutKvkApi.deleteKvkBankAccount,
        }
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

// ============================================
// Employee Hooks
// ============================================

export function useKvkEmployees(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-employees', params, user),
        queryFn: () => aboutKvkApi.getKvkEmployees(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkEmployeeFormData>(
        buildQueryKey('kvk-employees', undefined, user),
        {
            create: aboutKvkApi.createKvkEmployee,
            update: aboutKvkApi.updateKvkEmployee,
            delete: aboutKvkApi.deleteKvkEmployee,
        },
        [buildQueryKey('kvk-staff-transferred', undefined, user)] // Invalidate transferred list too as status might change
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

export function useKvkStaffTransferred(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-staff-transferred', params, user),
        queryFn: () => aboutKvkApi.getKvkStaffTransferred(params).then(res => res.data),
    });

    // Uses same mutations as employees really, but exposed via specific hooks if needed
    const mutations = useEntityMutation<KvkEmployeeFormData>(
        buildQueryKey('kvk-staff-transferred', undefined, user),
        {
            create: aboutKvkApi.createKvkStaffTransferred,
            update: aboutKvkApi.updateKvkStaffTransferred,
            delete: aboutKvkApi.deleteKvkStaffTransferred,
        },
        [buildQueryKey('kvk-employees', undefined, user)]
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

// ============================================
// Infrastructure Hooks
// ============================================

export function useKvkInfrastructure(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-infrastructure', params, user),
        queryFn: () => aboutKvkApi.getKvkInfrastructure(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkInfrastructureFormData>(
        buildQueryKey('kvk-infrastructure', undefined, user),
        {
            create: aboutKvkApi.createKvkInfrastructure,
            update: aboutKvkApi.updateKvkInfrastructure,
            delete: aboutKvkApi.deleteKvkInfrastructure,
        }
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

// ============================================
// Vehicle Hooks
// ============================================

export function useKvkVehicles(params?: any) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-vehicles', params, user),
        queryFn: () => aboutKvkApi.getKvkVehicles(params).then(res => res.data),
    });

    const baseMutations = useEntityMutation<KvkVehicleFormData>(
        buildQueryKey('kvk-vehicles', undefined, user),
        {
            create: aboutKvkApi.createKvkVehicle,
            update: aboutKvkApi.updateKvkVehicle,
            delete: aboutKvkApi.deleteKvkVehicle,
        },
        [buildQueryKey('kvk-vehicle-details', undefined, user)]
    );

    // Wrap mutations to also invalidate dropdown queries
    const mutations = {
        ...baseMutations,
        create: async (data: KvkVehicleFormData) => {
            const result = await baseMutations.create(data);
            // Invalidate all vehicle dropdown queries
            queryClient.invalidateQueries({ queryKey: ['kvk-vehicles-dropdown'] });
            return result;
        },
        update: async ({ id, data }: { id: number; data: Partial<KvkVehicleFormData> }) => {
            const result = await baseMutations.update({ id, data });
            // Invalidate all vehicle dropdown queries
            queryClient.invalidateQueries({ queryKey: ['kvk-vehicles-dropdown'] });
            return result;
        },
        remove: async (id: number) => {
            const result = await baseMutations.remove(id);
            // Invalidate all vehicle dropdown queries
            queryClient.invalidateQueries({ queryKey: ['kvk-vehicles-dropdown'] });
            return result;
        },
    };

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

export function useKvkVehicleDetails(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-vehicle-details', params, user),
        queryFn: () => aboutKvkApi.getKvkVehicleDetails(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkVehicleFormData>(
        buildQueryKey('kvk-vehicle-details', undefined, user),
        {
            create: aboutKvkApi.createKvkVehicleDetails,
            update: aboutKvkApi.updateKvkVehicleDetails,
            delete: aboutKvkApi.deleteKvkVehicleDetails,
        },
        [buildQueryKey('kvk-vehicles', undefined, user)]
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

// ============================================
// Equipment Hooks
// ============================================

export function useKvkEquipments(params?: any) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-equipments', params, user),
        queryFn: () => aboutKvkApi.getKvkEquipments(params).then(res => res.data),
    });

    const baseMutations = useEntityMutation<KvkEquipmentFormData>(
        buildQueryKey('kvk-equipments', undefined, user),
        {
            create: aboutKvkApi.createKvkEquipment,
            update: aboutKvkApi.updateKvkEquipment,
            delete: aboutKvkApi.deleteKvkEquipment,
        },
        [buildQueryKey('kvk-equipment-details', undefined, user)]
    );

    // Wrap mutations to also invalidate dropdown queries
    const mutations = {
        ...baseMutations,
        create: async (data: KvkEquipmentFormData) => {
            const result = await baseMutations.create(data);
            // Invalidate all equipment dropdown queries
            queryClient.invalidateQueries({ queryKey: ['kvk-equipments-dropdown'] });
            return result;
        },
        update: async ({ id, data }: { id: number; data: Partial<KvkEquipmentFormData> }) => {
            const result = await baseMutations.update({ id, data });
            // Invalidate all equipment dropdown queries
            queryClient.invalidateQueries({ queryKey: ['kvk-equipments-dropdown'] });
            return result;
        },
        remove: async (id: number) => {
            const result = await baseMutations.remove(id);
            // Invalidate all equipment dropdown queries
            queryClient.invalidateQueries({ queryKey: ['kvk-equipments-dropdown'] });
            return result;
        },
    };

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

export function useKvkEquipmentDetails(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-equipment-details', params, user),
        queryFn: () => aboutKvkApi.getKvkEquipmentDetails(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkEquipmentFormData>(
        buildQueryKey('kvk-equipment-details', undefined, user),
        {
            create: aboutKvkApi.createKvkEquipmentDetails,
            update: aboutKvkApi.updateKvkEquipmentDetails,
            delete: aboutKvkApi.deleteKvkEquipmentDetails,
        },
        [buildQueryKey('kvk-equipments', undefined, user)]
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

export function useKvkFarmImplements(params?: any) {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: buildQueryKey('kvk-farm-implements', params, user),
        queryFn: () => aboutKvkApi.getKvkFarmImplements(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkFarmImplementFormData>(
        buildQueryKey('kvk-farm-implements', undefined, user),
        {
            create: aboutKvkApi.createKvkFarmImplement,
            update: aboutKvkApi.updateKvkFarmImplement,
            delete: aboutKvkApi.deleteKvkFarmImplement,
        }
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

// ============================================
// Staff Transfer Hooks
// ============================================

/**
 * Hook to transfer an employee to another KVK
 */
export function useTransferEmployee() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({
            staffId,
            targetKvkId,
            reason,
            notes
        }: {
            staffId: number;
            targetKvkId: number;
            reason?: string;
            notes?: string
        }) => aboutKvkApi.transferKvkEmployee(staffId, targetKvkId, reason, notes),
        onSuccess: () => {
            // Invalidate employee queries to refetch
            queryClient.invalidateQueries({ queryKey: buildQueryKey('kvk-employees', undefined, user) });
            queryClient.invalidateQueries({ queryKey: buildQueryKey('kvk-staff-transferred', undefined, user) });
        },
    });
}

/**
 * Hook to fetch staff transfer history
 */
export function useStaffTransferHistory(staffId: number | null) {
    const { user } = useAuth();

    return useQuery({
        queryKey: buildQueryKey('staff-transfer-history', { staffId }, user),
        queryFn: () => aboutKvkApi.getStaffTransferHistory(staffId!, { limit: 100 }).then(res => res.data),
        enabled: staffId != null,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export type AboutKvkEntity =
    | typeof ENTITY_TYPES.KVKS
    | typeof ENTITY_TYPES.KVK_BANK_ACCOUNTS
    | typeof ENTITY_TYPES.KVK_EMPLOYEES
    | typeof ENTITY_TYPES.KVK_STAFF_TRANSFERRED
    | typeof ENTITY_TYPES.KVK_INFRASTRUCTURE
    | typeof ENTITY_TYPES.KVK_VEHICLES
    | typeof ENTITY_TYPES.KVK_VEHICLE_DETAILS
    | typeof ENTITY_TYPES.KVK_EQUIPMENTS
    | typeof ENTITY_TYPES.KVK_EQUIPMENT_DETAILS
    | typeof ENTITY_TYPES.KVK_FARM_IMPLEMENTS;

export function useAboutKvkData(entityType: AboutKvkEntity | null) {
    // We must call all hooks unconditionally to satisfy React rules
    const kvks = useKvks();
    const accounts = useKvkBankAccounts();
    const employees = useKvkEmployees();
    const transferred = useKvkStaffTransferred();
    const infra = useKvkInfrastructure();
    const vehicles = useKvkVehicles();
    const vehicleDetails = useKvkVehicleDetails();
    const equipments = useKvkEquipments();
    const equipmentDetails = useKvkEquipmentDetails();
    const implements_ = useKvkFarmImplements();

    if (!entityType) {
        return {
            data: [],
            isLoading: false,
            error: null,
            create: async () => { },
            update: async () => { },
            remove: async () => { }
        };
    }

    switch (entityType) {
        case ENTITY_TYPES.KVKS: return kvks;
        case ENTITY_TYPES.KVK_BANK_ACCOUNTS: return accounts;
        case ENTITY_TYPES.KVK_EMPLOYEES: return employees;
        case ENTITY_TYPES.KVK_STAFF_TRANSFERRED: return transferred;
        case ENTITY_TYPES.KVK_INFRASTRUCTURE: return infra;
        case ENTITY_TYPES.KVK_VEHICLES: return vehicles;
        case ENTITY_TYPES.KVK_VEHICLE_DETAILS: return vehicleDetails;
        case ENTITY_TYPES.KVK_EQUIPMENTS: return equipments;
        case ENTITY_TYPES.KVK_EQUIPMENT_DETAILS: return equipmentDetails;
        case ENTITY_TYPES.KVK_FARM_IMPLEMENTS: return implements_;
        default: return kvks;
    }
}

// ============================================
// Master Data Hooks (from useAboutKvkMasters)
// ============================================

// Fetch Sanctioned Posts
export function useSanctionedPosts() {
    return useQuery({
        queryKey: ['sanctioned-posts'],
        queryFn: async () => {
            const response = await aboutKvkApi.getSanctionedPosts();
            return response.data || []
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Fetch Disciplines
export function useDisciplines() {
    return useQuery({
        queryKey: ['disciplines'],
        queryFn: async () => {
            const response = await aboutKvkApi.getDisciplines();
            return response.data || []
        },
        staleTime: 5 * 60 * 1000,
    })
}

// Fetch Infrastructure Masters
export function useInfraMasters() {
    return useQuery({
        queryKey: ['infra-masters'],
        queryFn: async () => {
            const response = await aboutKvkApi.getInfraMasters();
            return response.data || []
        },
        staleTime: 5 * 60 * 1000,
    })
}

// Fetch Vehicles for dropdown (for vehicle details form)
export function useKvkVehiclesForDropdown(kvkId?: number) {
    return useQuery({
        queryKey: ['kvk-vehicles-dropdown', kvkId],
        queryFn: async () => {
            const response = await aboutKvkApi.getVehiclesDropdown(kvkId);
            return response.data || []
        },
        enabled: !!kvkId,
        staleTime: 2 * 60 * 1000,
    })
}

// Fetch Equipments for dropdown (for equipment details form)
export function useKvkEquipmentsForDropdown(kvkId?: number) {
    return useQuery({
        queryKey: ['kvk-equipments-dropdown', kvkId],
        queryFn: async () => {
            const response = await aboutKvkApi.getEquipmentsDropdown(kvkId);
            return response.data || []
        },
        enabled: !!kvkId,
        staleTime: 2 * 60 * 1000,
    })
}

// Helper to convert enum to options
export function enumToOptions(enumObj: Record<string, string>) {
    return Object.entries(enumObj).map(([key, value]) => ({
        value: key,
        label: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }))
}

// Enum definitions (these should match backend enums)
export const AccountTypeEnum = {
    KVK: 'KVK',
    REVOLVING_FUND: 'Revolving Fund',
    OTHER: 'Other'
}

export const PayLevelEnum = {
    LEVEL_1: 'Level 1',
    LEVEL_2: 'Level 2',
    LEVEL_3: 'Level 3',
    LEVEL_4: 'Level 4',
    LEVEL_5: 'Level 5',
    LEVEL_6: 'Level 6',
    LEVEL_10: 'Level 10',
    LEVEL_10R: 'Level 10R',
    LEVEL_11: 'Level 11',
    LEVEL_11R: 'Level 11R',
    LEVEL_12: 'Level 12',
    LEVEL_12R: 'Level 12R',
    LEVEL_13A: 'Level 13A',
    LEVEL_14: 'Level 14'
}

export const StaffCategoryEnum = {
    SC: 'SC',
    ST: 'ST',
    OBC: 'OBC',
    GENERAL: 'General'
}

export const VehiclePresentStatusEnum = {
    WORKING: 'Working',
    GOOD_CONDITION: 'Good Condition',
    NEW: 'New'
}

export const EquipmentPresentStatusEnum = {
    WORKING: 'Working',
    GOOD_CONDITION: 'Good Condition',
    NEW: 'New'
}

export const ImplementPresentStatusEnum = {
    WORKING: 'Working',
    GOOD_CONDITION: 'Good Condition',
    NEW: 'New',
    REPAIRABLE: 'Repairable',
    NOT_WORKING: 'Not Working'
}
