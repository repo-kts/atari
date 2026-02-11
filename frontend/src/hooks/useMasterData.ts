import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterDataApi } from '../services/masterDataApi';
import { useAuth } from '../contexts/AuthContext';
import type {
    EntityType,
    Zone,
    State,
    District,
    Organization,
    QueryParams,
    CreateZoneDto,
    CreateStateDto,
    CreateDistrictDto,
    CreateOrganizationDto,
    UpdateZoneDto,
    UpdateStateDto,
    UpdateDistrictDto,
    UpdateOrganizationDto,
} from '../types/masterData';

type EntityData = Zone | State | District | Organization;
type CreateDto = CreateZoneDto | CreateStateDto | CreateDistrictDto | CreateOrganizationDto;
type UpdateDto = UpdateZoneDto | UpdateStateDto | UpdateDistrictDto | UpdateOrganizationDto;

// API call mapping
const apiCalls = {
    zones: {
        getAll: (params?: QueryParams) => masterDataApi.getZones(params),
        create: (data: CreateZoneDto) => masterDataApi.createZone(data),
        update: (id: number, data: UpdateZoneDto) => masterDataApi.updateZone(id, data),
        delete: (id: number) => masterDataApi.deleteZone(id),
    },
    states: {
        getAll: (params?: QueryParams) => masterDataApi.getStates(params),
        create: (data: CreateStateDto) => masterDataApi.createState(data),
        update: (id: number, data: UpdateStateDto) => masterDataApi.updateState(id, data),
        delete: (id: number) => masterDataApi.deleteState(id),
    },
    districts: {
        getAll: (params?: QueryParams) => masterDataApi.getDistricts(params),
        create: (data: CreateDistrictDto) => masterDataApi.createDistrict(data),
        update: (id: number, data: UpdateDistrictDto) => masterDataApi.updateDistrict(id, data),
        delete: (id: number) => masterDataApi.deleteDistrict(id),
    },
    organizations: {
        getAll: (params?: QueryParams) => masterDataApi.getOrganizations(params),
        create: (data: CreateOrganizationDto) => masterDataApi.createOrganization(data),
        update: (id: number, data: UpdateOrganizationDto) => masterDataApi.updateOrganization(id, data),
        delete: (id: number) => masterDataApi.deleteOrganization(id),
    },
};

/**
 * Generic hook for master data CRUD operations using TanStack Query
 * Replaces Zustand store with React Query for better caching and state management
 */
export function useMasterData<T extends EntityData>(entityType: EntityType) {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const queryKey = ['master-data', entityType, user?.userId, user?.role];

    // Query for fetching data
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await apiCalls[entityType].getAll();
            return response.data as T[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: CreateDto) => {
            const response = await apiCalls[entityType].create(data as any);
            return response.data as T;
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateDto }) => {
            const response = await apiCalls[entityType].update(id, data as any);
            return response.data as T;
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiCalls[entityType].delete(id);
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return {
        data: (query.data || []) as T[],
        loading: query.isLoading,
        error: query.error ? (query.error instanceof Error ? query.error.message : 'Failed to fetch data') : null,
        filters: {}, // Filters are now handled via params in query
        fetchAll: async (params?: QueryParams) => {
            // Refetch with new params
            await queryClient.refetchQueries({ queryKey });
        },
        create: async (data: CreateDto) => {
            return await createMutation.mutateAsync(data);
        },
        update: async (id: number, data: UpdateDto) => {
            return await updateMutation.mutateAsync({ id, data });
        },
        remove: async (id: number) => {
            await deleteMutation.mutateAsync(id);
        },
        setFilters: () => {
            // Filters are now handled via params in fetchAll
            console.warn('setFilters is deprecated. Use fetchAll with params instead.');
        },
        resetFilters: () => {
            // Filters are now handled via params in fetchAll
            console.warn('resetFilters is deprecated. Use fetchAll with params instead.');
        },
        clearError: () => {
            // Error is managed by React Query
            console.warn('clearError is deprecated. Errors are managed by React Query.');
        },
    };
}

/**
 * Hook for fetching related entities
 */
export function useRelatedData() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const getStatesByZone = async (zoneId: number) => {
        const queryKey = ['master-data', 'states-by-zone', zoneId, user?.userId, user?.role];
        const cached = queryClient.getQueryData(queryKey);
        if (cached) return cached as State[];

        const response = await masterDataApi.getStatesByZone(zoneId);
        queryClient.setQueryData(queryKey, response.data);
        return response.data;
    };

    const getDistrictsByState = async (stateId: number) => {
        const queryKey = ['master-data', 'districts-by-state', stateId, user?.userId, user?.role];
        const cached = queryClient.getQueryData(queryKey);
        if (cached) return cached as District[];

        const response = await masterDataApi.getDistrictsByState(stateId);
        queryClient.setQueryData(queryKey, response.data);
        return response.data;
    };

    const getOrganizationsByState = async (stateId: number) => {
        const queryKey = ['master-data', 'organizations-by-state', stateId, user?.userId, user?.role];
        const cached = queryClient.getQueryData(queryKey);
        if (cached) return cached as Organization[];

        const response = await masterDataApi.getOrganizationsByState(stateId);
        queryClient.setQueryData(queryKey, response.data);
        return response.data;
    };

    // Computed selectors - now using query cache
    const getStatesByZoneFromStore = (zoneId: number): State[] => {
        const queryKey = ['master-data', 'states-by-zone', zoneId, user?.userId, user?.role];
        return (queryClient.getQueryData(queryKey) as State[]) || [];
    };

    const getDistrictsByStateFromStore = (stateId: number): District[] => {
        const queryKey = ['master-data', 'districts-by-state', stateId, user?.userId, user?.role];
        return (queryClient.getQueryData(queryKey) as District[]) || [];
    };

    const getOrganizationsByStateFromStore = (stateId: number): Organization[] => {
        const queryKey = ['master-data', 'organizations-by-state', stateId, user?.userId, user?.role];
        return (queryClient.getQueryData(queryKey) as Organization[]) || [];
    };

    return {
        getStatesByZone,
        getDistrictsByState,
        getOrganizationsByState,
        getStatesByZoneFromStore,
        getDistrictsByStateFromStore,
        getOrganizationsByStateFromStore,
    };
}

/**
 * Hook for statistics
 */
export function useMasterDataStats() {
    const { user } = useAuth();
    const query = useQuery({
        queryKey: ['master-data', 'stats', user?.userId, user?.role],
        queryFn: async () => {
            const response = await masterDataApi.getStats();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        fetchStats: async () => {
            await query.refetch();
            return query.data;
        },
        stats: query.data,
        loading: query.isLoading,
        error: query.error,
    };
}
