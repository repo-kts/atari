import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aboutKvkApi } from '@/services/aboutKvkApi';
import { useAuthStore } from '@/stores/authStore';
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

// Helper to get user-aware query keys
function getUserAwareQueryKey(baseKey: string | string[], params?: any): any[] {
    const { user } = useAuthStore.getState();
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
    const { user } = useAuthStore();
    const query = useQuery({
        queryKey: ['kvks', params, user?.userId, user?.role],
        queryFn: () => aboutKvkApi.getKvks(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkFormData>(
        getUserAwareQueryKey('kvks'),
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
    const { user } = useAuthStore();
    const query = useQuery({
        queryKey: ['kvks-dropdown', params, user?.userId, user?.role],
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
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-bank-accounts', params),
        queryFn: () => aboutKvkApi.getKvkBankAccounts(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkBankAccountFormData>(
        getUserAwareQueryKey('kvk-bank-accounts'),
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
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-employees', params),
        queryFn: () => aboutKvkApi.getKvkEmployees(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkEmployeeFormData>(
        getUserAwareQueryKey('kvk-employees'),
        {
            create: aboutKvkApi.createKvkEmployee,
            update: aboutKvkApi.updateKvkEmployee,
            delete: aboutKvkApi.deleteKvkEmployee,
        },
        [getUserAwareQueryKey('kvk-staff-transferred')] // Invalidate transferred list too as status might change
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

export function useKvkStaffTransferred(params?: any) {
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-staff-transferred', params),
        queryFn: () => aboutKvkApi.getKvkStaffTransferred(params).then(res => res.data),
    });

    // Uses same mutations as employees really, but exposed via specific hooks if needed
    const mutations = useEntityMutation<KvkEmployeeFormData>(
        getUserAwareQueryKey('kvk-staff-transferred'),
        {
            create: aboutKvkApi.createKvkStaffTransferred,
            update: aboutKvkApi.updateKvkStaffTransferred,
            delete: aboutKvkApi.deleteKvkStaffTransferred,
        },
        [getUserAwareQueryKey('kvk-employees')]
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
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-infrastructure', params),
        queryFn: () => aboutKvkApi.getKvkInfrastructure(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkInfrastructureFormData>(
        getUserAwareQueryKey('kvk-infrastructure'),
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
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-vehicles', params),
        queryFn: () => aboutKvkApi.getKvkVehicles(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkVehicleFormData>(
        getUserAwareQueryKey('kvk-vehicles'),
        {
            create: aboutKvkApi.createKvkVehicle,
            update: aboutKvkApi.updateKvkVehicle,
            delete: aboutKvkApi.deleteKvkVehicle,
        },
        [getUserAwareQueryKey('kvk-vehicle-details')]
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

export function useKvkVehicleDetails(params?: any) {
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-vehicle-details', params),
        queryFn: () => aboutKvkApi.getKvkVehicleDetails(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkVehicleFormData>(
        getUserAwareQueryKey('kvk-vehicle-details'),
        {
            create: aboutKvkApi.createKvkVehicleDetails,
            update: aboutKvkApi.updateKvkVehicleDetails,
            delete: aboutKvkApi.deleteKvkVehicleDetails,
        },
        [getUserAwareQueryKey('kvk-vehicles')]
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
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-equipments', params),
        queryFn: () => aboutKvkApi.getKvkEquipments(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkEquipmentFormData>(
        getUserAwareQueryKey('kvk-equipments'),
        {
            create: aboutKvkApi.createKvkEquipment,
            update: aboutKvkApi.updateKvkEquipment,
            delete: aboutKvkApi.deleteKvkEquipment,
        },
        [getUserAwareQueryKey('kvk-equipment-details')]
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

export function useKvkEquipmentDetails(params?: any) {
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-equipment-details', params),
        queryFn: () => aboutKvkApi.getKvkEquipmentDetails(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkEquipmentFormData>(
        getUserAwareQueryKey('kvk-equipment-details'),
        {
            create: aboutKvkApi.createKvkEquipmentDetails,
            update: aboutKvkApi.updateKvkEquipmentDetails,
            delete: aboutKvkApi.deleteKvkEquipmentDetails,
        },
        [getUserAwareQueryKey('kvk-equipments')]
    );

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        ...mutations,
    };
}

export function useKvkFarmImplements(params?: any) {
    const query = useQuery({
        queryKey: getUserAwareQueryKey('kvk-farm-implements', params),
        queryFn: () => aboutKvkApi.getKvkFarmImplements(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkFarmImplementFormData>(
        getUserAwareQueryKey('kvk-farm-implements'),
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
