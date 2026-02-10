import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aboutKvkApi } from '../services/aboutKvkApi';
import type {
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
import { ENTITY_TYPES } from '../constants/entityTypes';

// Helper for mutation hooks pattern
function useEntityMutation<T, TData>(
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
    const query = useQuery({
        queryKey: ['kvks', params],
        queryFn: () => aboutKvkApi.getKvks(params).then(res => res.data),
    });

    const mutations = useEntityMutation<Kvk, KvkFormData>(
        ['kvks'],
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

// ============================================
// Bank Account Hooks
// ============================================

export function useKvkBankAccounts(params?: any) {
    const query = useQuery({
        queryKey: ['kvk-bank-accounts', params],
        queryFn: () => aboutKvkApi.getKvkBankAccounts(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkBankAccount, KvkBankAccountFormData>(
        ['kvk-bank-accounts'],
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
        queryKey: ['kvk-employees', params],
        queryFn: () => aboutKvkApi.getKvkEmployees(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkEmployee, KvkEmployeeFormData>(
        ['kvk-employees'],
        {
            create: aboutKvkApi.createKvkEmployee,
            update: aboutKvkApi.updateKvkEmployee,
            delete: aboutKvkApi.deleteKvkEmployee,
        },
        [['kvk-staff-transferred']] // Invalidate transferred list too as status might change
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
        queryKey: ['kvk-staff-transferred', params],
        queryFn: () => aboutKvkApi.getKvkStaffTransferred(params).then(res => res.data),
    });

    // Uses same mutations as employees really, but exposed via specific hooks if needed
    const mutations = useEntityMutation<KvkEmployee, KvkEmployeeFormData>(
        ['kvk-staff-transferred'],
        {
            create: aboutKvkApi.createKvkStaffTransferred,
            update: aboutKvkApi.updateKvkStaffTransferred,
            delete: aboutKvkApi.deleteKvkStaffTransferred,
        },
        [['kvk-employees']]
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
        queryKey: ['kvk-infrastructure', params],
        queryFn: () => aboutKvkApi.getKvkInfrastructure(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkInfrastructure, KvkInfrastructureFormData>(
        ['kvk-infrastructure'],
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
        queryKey: ['kvk-vehicles', params],
        queryFn: () => aboutKvkApi.getKvkVehicles(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkVehicle, KvkVehicleFormData>(
        ['kvk-vehicles'],
        {
            create: aboutKvkApi.createKvkVehicle,
            update: aboutKvkApi.updateKvkVehicle,
            delete: aboutKvkApi.deleteKvkVehicle,
        },
        [['kvk-vehicle-details']]
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
        queryKey: ['kvk-vehicle-details', params],
        queryFn: () => aboutKvkApi.getKvkVehicleDetails(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkVehicle, KvkVehicleFormData>(
        ['kvk-vehicle-details'],
        {
            create: aboutKvkApi.createKvkVehicleDetails,
            update: aboutKvkApi.updateKvkVehicleDetails,
            delete: aboutKvkApi.deleteKvkVehicleDetails,
        },
        [['kvk-vehicles']]
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
        queryKey: ['kvk-equipments', params],
        queryFn: () => aboutKvkApi.getKvkEquipments(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkEquipment, KvkEquipmentFormData>(
        ['kvk-equipments'],
        {
            create: aboutKvkApi.createKvkEquipment,
            update: aboutKvkApi.updateKvkEquipment,
            delete: aboutKvkApi.deleteKvkEquipment,
        },
        [['kvk-equipment-details']]
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
        queryKey: ['kvk-equipment-details', params],
        queryFn: () => aboutKvkApi.getKvkEquipmentDetails(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkEquipment, KvkEquipmentFormData>(
        ['kvk-equipment-details'],
        {
            create: aboutKvkApi.createKvkEquipmentDetails,
            update: aboutKvkApi.updateKvkEquipmentDetails,
            delete: aboutKvkApi.deleteKvkEquipmentDetails,
        },
        [['kvk-equipments']]
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
        queryKey: ['kvk-farm-implements', params],
        queryFn: () => aboutKvkApi.getKvkFarmImplements(params).then(res => res.data),
    });

    const mutations = useEntityMutation<KvkFarmImplement, KvkFarmImplementFormData>(
        ['kvk-farm-implements'],
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
