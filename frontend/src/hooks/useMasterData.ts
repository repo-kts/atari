import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { masterDataApi } from '../services/masterDataApi';
import { useAuth } from '../contexts/AuthContext';
import { invalidateMasterDataEntity } from '../utils/queryInvalidation';
import { ENTITY_TYPES } from '../constants/entityTypes';
import type {
    EntityType,
    Zone,
    State,
    District,
    Organization,
    University,
    QueryParams,
    CreateZoneDto,
    CreateStateDto,
    CreateDistrictDto,
    CreateOrganizationDto,
    CreateUniversityDto,
    UpdateZoneDto,
    UpdateStateDto,
    UpdateDistrictDto,
    UpdateOrganizationDto,
    UpdateUniversityDto,
} from '../types/masterData';

type EntityData = Zone | State | District | Organization | University;
type CreateDto = CreateZoneDto | CreateStateDto | CreateDistrictDto | CreateOrganizationDto | CreateUniversityDto;
type UpdateDto = UpdateZoneDto | UpdateStateDto | UpdateDistrictDto | UpdateOrganizationDto | UpdateUniversityDto;

// Module codes for permission check (VIEW required to fetch)
const MASTER_DATA_MODULE_CODES: Record<EntityType, string> = {
    zones: 'all_masters_zone_master',
    states: 'all_masters_states_master',
    districts: 'all_masters_districts_master',
    organizations: 'all_masters_organization_master',
    universities: 'all_masters_university_master',
};

// API call mapping
const apiCalls = {
    zones: {
        getAll: (params?: QueryParams) => masterDataApi.getZones(params),
        create: (data: CreateZoneDto) => masterDataApi.createZone(data),
        update: (id: number, data: UpdateZoneDto) => masterDataApi.updateZone(id, data),
        delete: (id: number, cascade?: boolean) => masterDataApi.deleteZone(id, cascade),
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
        delete: (id: number, cascade?: boolean) => masterDataApi.deleteOrganization(id, cascade),
    },
    universities: {
        getAll: (params?: QueryParams) => masterDataApi.getUniversities(params),
        create: (data: CreateUniversityDto) => masterDataApi.createUniversity(data),
        update: (id: number, data: UpdateUniversityDto) => masterDataApi.updateUniversity(id, data),
        delete: (id: number) => masterDataApi.deleteUniversity(id),
    },
};

/**
 * Generic hook for master data CRUD operations using TanStack Query
 * Replaces Zustand store with React Query for better caching and state management
 */
export function useMasterData<T extends EntityData>(
    entityType: EntityType,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();
    const { user, hasPermission } = useAuth();
    const [params, setParams] = useState<QueryParams | undefined>();
    const queryKey = ['master-data', entityType, params, user?.userId, user?.role];

    // Only fetch when explicitly enabled or when user has VIEW permission (avoids 403 for roles without All Masters)
    const enabled =
        options?.enabled !== undefined
            ? options.enabled
            : hasPermission('VIEW', MASTER_DATA_MODULE_CODES[entityType]);

    // Query for fetching data with error handling
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            try {
                const response = await apiCalls[entityType].getAll(params);
                return response.data as T[];
            } catch (error) {
                console.error(`Error fetching ${entityType}:`, error);
                // Return empty array on error instead of throwing
                // This prevents the app from getting stuck
                return [] as T[];
            }
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // Only retry once
        retryDelay: 1000, // Wait 1 second before retry
        refetchOnWindowFocus: false, // Don't refetch on window focus to avoid stuck states
    });

    // Map EntityType to ENTITY_TYPES constant
    const entityTypeConstant = {
        'zones': ENTITY_TYPES.ZONES,
        'states': ENTITY_TYPES.STATES,
        'districts': ENTITY_TYPES.DISTRICTS,
        'organizations': ENTITY_TYPES.ORGANIZATIONS,
        'universities': ENTITY_TYPES.UNIVERSITIES,
    }[entityType];

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: CreateDto) => {
            const response = await apiCalls[entityType].create(data as any);
            return response.data as T;
        },
        onSuccess: (data) => {
            // Invalidate the entity and all dependent entities
            if (entityTypeConstant) {
                invalidateMasterDataEntity(
                    queryClient,
                    entityTypeConstant,
                    (data as any)?.zoneId || (data as any)?.stateId || (data as any)?.districtId || (data as any)?.orgId || (data as any)?.universityId,
                    { userId: user?.userId ?? null, role: user?.role ?? null }
                );
            } else {
                // Fallback to simple invalidation if entity type not found
                queryClient.invalidateQueries({
                    queryKey: ['master-data', entityType],
                    refetchType: 'all' // Force refetch all queries
                });
            }
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateDto }) => {
            const response = await apiCalls[entityType].update(id, data as any);
            return response.data as T;
        },
        onSuccess: (_, variables) => {
            // Invalidate the entity and all dependent entities
            // Use the ID from variables to invalidate related queries
            if (entityTypeConstant) {
                invalidateMasterDataEntity(
                    queryClient,
                    entityTypeConstant,
                    variables.id,
                    { userId: user?.userId ?? null, role: user?.role ?? null }
                );
            } else {
                // Fallback to simple invalidation if entity type not found
                queryClient.invalidateQueries({
                    queryKey: ['master-data', entityType],
                    refetchType: 'all' // Force refetch all queries
                });
            }
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async ({ id, cascade }: { id: number; cascade?: boolean }) => {
            // For zones and organizations, pass cascade parameter
            if (entityType === 'zones' || entityType === 'organizations') {
                await apiCalls[entityType].delete(id, cascade || false);
            } else {
                await apiCalls[entityType].delete(id);
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate the entity and all dependent entities
            // Use the ID from variables to invalidate related queries
            if (entityTypeConstant) {
                invalidateMasterDataEntity(
                    queryClient,
                    entityTypeConstant,
                    variables.id,
                    { userId: user?.userId ?? null, role: user?.role ?? null }
                );
            } else {
                // Fallback to simple invalidation if entity type not found
                queryClient.invalidateQueries({
                    queryKey: ['master-data', entityType],
                    refetchType: 'all' // Force refetch all queries
                });
            }
        },
    });

    return {
        data: (query.data || []) as T[],
        loading: query.isLoading && !query.isError, // Don't show loading if there's an error
        error: query.error ? (query.error instanceof Error ? query.error.message : 'Failed to fetch data') : null,
        filters: {}, // Filters are now handled via params in query
        fetchAll: async (newParams?: QueryParams) => {
            // Update params state — React Query will refetch automatically due to queryKey change
            setParams(newParams);
        },
        create: async (data: CreateDto) => {
            return await createMutation.mutateAsync(data);
        },
        update: async (id: number, data: UpdateDto) => {
            return await updateMutation.mutateAsync({ id, data });
        },
        remove: async (id: number, cascade?: boolean) => {
            await deleteMutation.mutateAsync({ id, cascade });
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

    const getStatesByZone = useCallback(async (zoneId: number) => {
        const queryKey = ['master-data', 'states-by-zone', zoneId, user?.userId, user?.role];
        const cached = queryClient.getQueryData(queryKey);
        if (cached) return cached as State[];

        const response = await masterDataApi.getStatesByZone(zoneId);
        queryClient.setQueryData(queryKey, response.data);
        return response.data;
    }, [user?.userId, user?.role, queryClient]);

    const getDistrictsByState = useCallback(async (stateId: number) => {
        const queryKey = ['master-data', 'districts-by-state', stateId, user?.userId, user?.role];
        const cached = queryClient.getQueryData(queryKey);
        if (cached) return cached as District[];

        const response = await masterDataApi.getDistrictsByState(stateId);
        queryClient.setQueryData(queryKey, response.data);
        return response.data;
    }, [user?.userId, user?.role, queryClient]);

    const getOrganizationsByDistrict = useCallback(async (districtId: number) => {
        const queryKey = ['master-data', 'organizations-by-district', districtId, user?.userId, user?.role];
        const cached = queryClient.getQueryData(queryKey);
        if (cached) return cached as Organization[];

        const response = await masterDataApi.getOrganizationsByDistrict(districtId);
        queryClient.setQueryData(queryKey, response.data);
        return response.data;
    }, [user?.userId, user?.role, queryClient]);

    const getUniversitiesByOrganization = useCallback(async (orgId: number) => {
        const queryKey = ['master-data', 'universities-by-organization', orgId, user?.userId, user?.role];
        const cached = queryClient.getQueryData(queryKey);
        if (cached) return cached as University[];

        const response = await masterDataApi.getUniversitiesByOrganization(orgId);
        queryClient.setQueryData(queryKey, response.data);
        return response.data;
    }, [user?.userId, user?.role, queryClient]);

    // Computed selectors - now using query cache
    const getStatesByZoneFromStore = useCallback((zoneId: number): State[] => {
        const queryKey = ['master-data', 'states-by-zone', zoneId, user?.userId, user?.role];
        return (queryClient.getQueryData(queryKey) as State[]) || [];
    }, [user?.userId, user?.role, queryClient]);

    const getDistrictsByStateFromStore = useCallback((stateId: number): District[] => {
        const queryKey = ['master-data', 'districts-by-state', stateId, user?.userId, user?.role];
        return (queryClient.getQueryData(queryKey) as District[]) || [];
    }, [user?.userId, user?.role, queryClient]);

    const getOrganizationsByDistrictFromStore = useCallback((districtId: number): Organization[] => {
        const queryKey = ['master-data', 'organizations-by-district', districtId, user?.userId, user?.role];
        return (queryClient.getQueryData(queryKey) as Organization[]) || [];
    }, [user?.userId, user?.role, queryClient]);

    const getUniversitiesByOrganizationFromStore = useCallback((orgId: number): University[] => {
        const queryKey = ['master-data', 'universities-by-organization', orgId, user?.userId, user?.role];
        return (queryClient.getQueryData(queryKey) as University[]) || [];
    }, [user?.userId, user?.role, queryClient]);

    return {
        getStatesByZone,
        getDistrictsByState,
        getOrganizationsByDistrict,
        getUniversitiesByOrganization,
        getStatesByZoneFromStore,
        getDistrictsByStateFromStore,
        getOrganizationsByDistrictFromStore,
        getUniversitiesByOrganizationFromStore,
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
