import { useCallback, useEffect } from 'react';
import { useMasterDataStore } from '../stores/masterDataStore';
import { masterDataApi } from '../services/masterDataApi';
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

/**
 * Generic hook for master data CRUD operations
 * Provides type-safe, reusable functionality for all entities
 */
export function useMasterData<T extends EntityData>(entityType: EntityType) {
    const store = useMasterDataStore();

    // Get entity-specific data from store
    const data = store[entityType] as T[];
    const loading = store.loading[entityType];
    const error = store.errors[entityType];
    const filters = store.filters[entityType];

    /**
     * Fetch all entities
     */
    const fetchAll = useCallback(
        async (params?: QueryParams) => {
            store.setLoading(entityType, true);
            store.setError(entityType, null);

            try {
                const queryParams = { ...filters, ...params };
                let response;

                switch (entityType) {
                    case 'zones':
                        response = await masterDataApi.getZones(queryParams);
                        store.setZones(response.data as Zone[]);
                        break;
                    case 'states':
                        response = await masterDataApi.getStates(queryParams);
                        store.setStates(response.data as State[]);
                        break;
                    case 'districts':
                        response = await masterDataApi.getDistricts(queryParams);
                        store.setDistricts(response.data as District[]);
                        break;
                    case 'organizations':
                        response = await masterDataApi.getOrganizations(queryParams);
                        store.setOrganizations(response.data as Organization[]);
                        break;
                }

                return response.data;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch data';
                store.setError(entityType, message);
                throw err;
            } finally {
                store.setLoading(entityType, false);
            }
        },
        [entityType, filters, store]
    );

    /**
     * Create entity
     */
    const create = useCallback(
        async (data: CreateDto) => {
            store.setLoading(entityType, true);
            store.setError(entityType, null);

            try {
                let response;

                switch (entityType) {
                    case 'zones':
                        response = await masterDataApi.createZone(data as CreateZoneDto);
                        store.addZone(response.data);
                        break;
                    case 'states':
                        response = await masterDataApi.createState(data as CreateStateDto);
                        store.addState(response.data);
                        break;
                    case 'districts':
                        response = await masterDataApi.createDistrict(data as CreateDistrictDto);
                        store.addDistrict(response.data);
                        break;
                    case 'organizations':
                        response = await masterDataApi.createOrganization(data as CreateOrganizationDto);
                        store.addOrganization(response.data);
                        break;
                }

                return response.data;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to create';
                store.setError(entityType, message);
                throw err;
            } finally {
                store.setLoading(entityType, false);
            }
        },
        [entityType, store]
    );

    /**
     * Update entity
     */
    const update = useCallback(
        async (id: number, data: UpdateDto) => {
            store.setLoading(entityType, true);
            store.setError(entityType, null);

            try {
                let response;

                switch (entityType) {
                    case 'zones':
                        response = await masterDataApi.updateZone(id, data as UpdateZoneDto);
                        store.updateZone(id, response.data);
                        break;
                    case 'states':
                        response = await masterDataApi.updateState(id, data as UpdateStateDto);
                        store.updateState(id, response.data);
                        break;
                    case 'districts':
                        response = await masterDataApi.updateDistrict(id, data as UpdateDistrictDto);
                        store.updateDistrict(id, response.data);
                        break;
                    case 'organizations':
                        response = await masterDataApi.updateOrganization(id, data as UpdateOrganizationDto);
                        store.updateOrganization(id, response.data);
                        break;
                }

                return response.data;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to update';
                store.setError(entityType, message);
                throw err;
            } finally {
                store.setLoading(entityType, false);
            }
        },
        [entityType, store]
    );

    /**
     * Delete entity
     */
    const remove = useCallback(
        async (id: number) => {
            store.setLoading(entityType, true);
            store.setError(entityType, null);

            try {
                switch (entityType) {
                    case 'zones':
                        await masterDataApi.deleteZone(id);
                        store.deleteZone(id);
                        break;
                    case 'states':
                        await masterDataApi.deleteState(id);
                        store.deleteState(id);
                        break;
                    case 'districts':
                        await masterDataApi.deleteDistrict(id);
                        store.deleteDistrict(id);
                        break;
                    case 'organizations':
                        await masterDataApi.deleteOrganization(id);
                        store.deleteOrganization(id);
                        break;
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to delete';
                store.setError(entityType, message);
                throw err;
            } finally {
                store.setLoading(entityType, false);
            }
        },
        [entityType, store]
    );

    /**
     * Set filters
     */
    const setFilters = useCallback(
        (newFilters: Partial<typeof filters>) => {
            store.setFilter(entityType, newFilters);
        },
        [entityType, store]
    );

    /**
     * Reset filters
     */
    const resetFilters = useCallback(() => {
        store.resetFilters(entityType);
    }, [entityType, store]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        store.setError(entityType, null);
    }, [entityType, store]);

    // Auto-fetch on mount and when entity type changes
    useEffect(() => {
        if (data.length === 0 && !loading && !error) {
            fetchAll();
        }
    }, [entityType]); // Refetch when entity type changes (tab switch)

    return {
        data,
        loading,
        error,
        filters,
        fetchAll,
        create,
        update,
        remove,
        setFilters,
        resetFilters,
        clearError,
    };
}

/**
 * Hook for fetching related entities
 */
export function useRelatedData() {
    const store = useMasterDataStore();

    const getStatesByZone = useCallback(
        async (zoneId: number) => {
            try {
                const response = await masterDataApi.getStatesByZone(zoneId);
                return response.data;
            } catch (err) {
                console.error('Error fetching states by zone:', err);
                throw err;
            }
        },
        []
    );

    const getDistrictsByState = useCallback(
        async (stateId: number) => {
            try {
                const response = await masterDataApi.getDistrictsByState(stateId);
                return response.data;
            } catch (err) {
                console.error('Error fetching districts by state:', err);
                throw err;
            }
        },
        []
    );

    const getOrganizationsByState = useCallback(
        async (stateId: number) => {
            try {
                const response = await masterDataApi.getOrganizationsByState(stateId);
                return response.data;
            } catch (err) {
                console.error('Error fetching organizations by state:', err);
                throw err;
            }
        },
        []
    );

    return {
        getStatesByZone,
        getDistrictsByState,
        getOrganizationsByState,
        // Computed selectors from store
        getStatesByZoneFromStore: store.getStatesByZone,
        getDistrictsByStateFromStore: store.getDistrictsByState,
        getOrganizationsByStateFromStore: store.getOrganizationsByState,
    };
}

/**
 * Hook for statistics
 */
export function useMasterDataStats() {
    const fetchStats = useCallback(async () => {
        try {
            const response = await masterDataApi.getStats();
            return response.data;
        } catch (err) {
            console.error('Error fetching stats:', err);
            throw err;
        }
    }, []);

    return { fetchStats };
}
