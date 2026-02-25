import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { reportApi } from '../../services/reportApi';
import type { ScopeOption, ReportScope } from '../../types/reportScope';

/**
 * Query keys for report scope queries
 * Centralized for easy cache invalidation and refetching
 */
export const reportScopeKeys = {
    all: ['report-scope'] as const,
    scopeOptions: () => [...reportScopeKeys.all, 'options'] as const,
    filteredChildren: (parentType: string, parentIds: number[]) =>
        [...reportScopeKeys.all, 'children', parentType, parentIds.sort()] as const,
    filteredKvks: (filters: {
        zoneIds?: number[];
        stateIds?: number[];
        districtIds?: number[];
        orgIds?: number[];
    }) => {
        // Create a stable key from filters by sorting arrays
        const key = {
            zoneIds: filters.zoneIds?.sort() || [],
            stateIds: filters.stateIds?.sort() || [],
            districtIds: filters.districtIds?.sort() || [],
            orgIds: filters.orgIds?.sort() || [],
        };
        return [...reportScopeKeys.all, 'kvks', key] as const;
    },
};

/**
 * Hook to fetch scope options for the current user
 * Cached for 10 minutes as this rarely changes
 */
export function useScopeOptions() {
    return useQuery({
        queryKey: reportScopeKeys.scopeOptions(),
        queryFn: async () => {
            const options = await reportApi.getScopeOptions();
            return options;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

/**
 * Hook to fetch filtered children based on parent selection
 * Only enabled when parentIds are provided
 * Cached for 5 minutes
 */
export function useFilteredChildren(
    parentType: 'zones' | 'states' | 'districts' | 'orgs',
    parentIds: number[] | undefined,
    options?: { enabled?: boolean }
) {
    const enabled = (options?.enabled !== false) && !!parentIds && parentIds.length > 0;

    return useQuery({
        queryKey: reportScopeKeys.filteredChildren(parentType, parentIds || []),
        queryFn: async () => {
            if (!parentIds || parentIds.length === 0) {
                return [];
            }
            const children = await reportApi.getFilteredChildren(parentType, parentIds);
            return children;
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

/**
 * Hook to fetch filtered KVKs based on multiple parent filters
 * Only enabled when at least one filter is provided
 * Cached for 5 minutes
 */
export function useFilteredKvks(
    filters: {
        zoneIds?: number[];
        stateIds?: number[];
        districtIds?: number[];
        orgIds?: number[];
    },
    options?: { enabled?: boolean }
) {
    const hasFilters = useMemo(
        () =>
            (filters.zoneIds && filters.zoneIds.length > 0) ||
            (filters.stateIds && filters.stateIds.length > 0) ||
            (filters.districtIds && filters.districtIds.length > 0) ||
            (filters.orgIds && filters.orgIds.length > 0),
        [filters.zoneIds, filters.stateIds, filters.districtIds, filters.orgIds]
    );

    const enabled = (options?.enabled !== false) && hasFilters;

    return useQuery({
        queryKey: reportScopeKeys.filteredKvks(filters),
        queryFn: async () => {
            if (!hasFilters) {
                return [];
            }
            const kvks = await reportApi.getFilteredKvks(filters);
            return kvks;
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

/**
 * Hook to get filtered states based on selected zones
 */
export function useFilteredStates(
    zoneIds: number[] | undefined,
    canSelectStates: boolean,
    fallbackStates: ScopeOption[]
) {
    const query = useFilteredChildren('zones', zoneIds, {
        enabled: canSelectStates && !!zoneIds && zoneIds.length > 0,
    });

    return useMemo(() => {
        if (zoneIds && zoneIds.length > 0 && query.data) {
            return query.data;
        }
        return fallbackStates;
    }, [zoneIds, query.data, fallbackStates]);
}

/**
 * Hook to get filtered districts with cascading logic
 * Simplified: Uses the backend's cascading logic via getFilteredKvks or manual chaining
 * For now, we'll handle the complex cascading in the component using multiple queries
 */
export function useFilteredDistricts(
    selectedScope: ReportScope,
    canSelectDistricts: boolean,
    fallbackDistricts: ScopeOption[]
) {
    // If states are selected, filter districts by states
    const districtsByStatesQuery = useFilteredChildren('states', selectedScope.stateIds, {
        enabled: canSelectDistricts && !!selectedScope.stateIds && selectedScope.stateIds.length > 0,
    });

    return useMemo(() => {
        if (selectedScope.stateIds && selectedScope.stateIds.length > 0) {
            return districtsByStatesQuery.data || fallbackDistricts;
        }
        // For zones -> districts, we need to chain through states
        // This will be handled in the component with a dependent query
        return fallbackDistricts;
    }, [selectedScope.stateIds, districtsByStatesQuery.data, fallbackDistricts]);
}

/**
 * Hook to get filtered orgs
 * Simplified version - complex cascading handled in component
 */
export function useFilteredOrgs(
    selectedScope: ReportScope,
    canSelectOrgs: boolean,
    fallbackOrgs: ScopeOption[]
) {
    // If districts are selected, filter orgs by districts
    const orgsByDistrictsQuery = useFilteredChildren('districts', selectedScope.districtIds, {
        enabled: canSelectOrgs && !!selectedScope.districtIds && selectedScope.districtIds.length > 0,
    });

    return useMemo(() => {
        if (selectedScope.districtIds && selectedScope.districtIds.length > 0) {
            return orgsByDistrictsQuery.data || fallbackOrgs;
        }
        // For cascading from states/zones, handle in component
        return fallbackOrgs;
    }, [selectedScope.districtIds, orgsByDistrictsQuery.data, fallbackOrgs]);
}

/**
 * Hook to fetch report configuration
 * Cached for 10 minutes as this rarely changes
 */
export function useReportConfig() {
    return useQuery({
        queryKey: ['report-config'],
        queryFn: async () => {
            const config = await reportApi.getReportConfig();
            return config;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

/**
 * Main hook that combines all scope-related queries
 * Provides a clean API for components to use
 */
export function useReportScope(selectedScope: ReportScope) {
    const queryClient = useQueryClient();

    // Fetch scope options
    const scopeOptionsQuery = useScopeOptions();

    // Fetch filtered states when zones are selected
    const filteredStatesQuery = useFilteredChildren(
        'zones',
        selectedScope.zoneIds,
        { enabled: scopeOptionsQuery.data?.canSelectStates }
    );

    // Fetch filtered districts when states are selected
    const filteredDistrictsByStatesQuery = useFilteredChildren(
        'states',
        selectedScope.stateIds,
        { enabled: scopeOptionsQuery.data?.canSelectDistricts && !!selectedScope.stateIds?.length }
    );

    // Fetch filtered districts when zones are selected (but states are not)
    const filteredDistrictsByZonesQuery = useFilteredChildren(
        'zones',
        selectedScope.zoneIds,
        {
            enabled:
                scopeOptionsQuery.data?.canSelectDistricts &&
                !!selectedScope.zoneIds?.length &&
                (!selectedScope.stateIds || selectedScope.stateIds.length === 0),
        }
    );

    // For districts, we need to handle the cascading logic:
    // - If states are selected, use states -> districts
    // - If only zones are selected, use zones -> states -> districts
    // This is complex, so we'll handle it in the component

    // Fetch filtered orgs when districts are selected
    const filteredOrgsByDistrictsQuery = useFilteredChildren(
        'districts',
        selectedScope.districtIds,
        { enabled: scopeOptionsQuery.data?.canSelectOrgs && !!selectedScope.districtIds?.length }
    );

    // Fetch filtered KVKs based on all parent filters
    const filteredKvksQuery = useFilteredKvks(
        {
            zoneIds: selectedScope.zoneIds,
            stateIds: selectedScope.stateIds,
            districtIds: selectedScope.districtIds,
            orgIds: selectedScope.orgIds,
        },
        { enabled: scopeOptionsQuery.data?.canSelectKvks }
    );

    /**
     * Invalidate all scope-related queries
     * Useful when scope options might have changed
     */
    const invalidateScopeQueries = () => {
        queryClient.invalidateQueries({ queryKey: reportScopeKeys.all });
    };

    /**
     * Get the effective filtered options for each level
     * Handles cascading filters and fallbacks to available options
     */
    const getFilteredOptions = () => {
        const options = scopeOptionsQuery.data;
        if (!options) {
            return {
                states: [],
                districts: [],
                orgs: [],
                kvks: [],
            };
        }

        // States: filtered by zones if zones selected, otherwise all available
        const states =
            selectedScope.zoneIds && selectedScope.zoneIds.length > 0
                ? filteredStatesQuery.data || []
                : options.availableStates;

        // Districts: filtered by states if states selected, otherwise by zones, otherwise all available
        let districts = options.availableDistricts;
        if (selectedScope.stateIds && selectedScope.stateIds.length > 0) {
            districts = filteredDistrictsByStatesQuery.data || [];
        } else if (selectedScope.zoneIds && selectedScope.zoneIds.length > 0) {
            // Need to fetch states first, then districts
            // This is handled in the component with a dependent query
            districts = options.availableDistricts; // Fallback for now
        }

        // Orgs: filtered by districts if districts selected, otherwise all available
        const orgs =
            selectedScope.districtIds && selectedScope.districtIds.length > 0
                ? filteredOrgsByDistrictsQuery.data || []
                : options.availableOrgs;

        // KVKs: filtered by any parent if any parent selected, otherwise all available
        const hasParentFilters =
            (selectedScope.zoneIds && selectedScope.zoneIds.length > 0) ||
            (selectedScope.stateIds && selectedScope.stateIds.length > 0) ||
            (selectedScope.districtIds && selectedScope.districtIds.length > 0) ||
            (selectedScope.orgIds && selectedScope.orgIds.length > 0);

        const kvks =
            hasParentFilters && filteredKvksQuery.data && filteredKvksQuery.data.length > 0
                ? filteredKvksQuery.data
                : options.availableKvks;

        return {
            states,
            districts,
            orgs,
            kvks,
        };
    };

    // Get filtered options
    const filteredOptions = useMemo(() => getFilteredOptions(), [
        selectedScope,
        scopeOptionsQuery.data,
        filteredStatesQuery.data,
        filteredDistrictsByStatesQuery.data,
        filteredDistrictsByZonesQuery.data,
        filteredOrgsByDistrictsQuery.data,
        filteredKvksQuery.data,
    ]);

    return {
        // Scope options
        scopeOptions: scopeOptionsQuery.data,
        isLoadingScopeOptions: scopeOptionsQuery.isLoading,
        scopeOptionsError: scopeOptionsQuery.error,

        // Filtered options
        filteredOptions,

        // Individual query states
        isLoadingStates: filteredStatesQuery.isLoading,
        isLoadingDistricts: filteredDistrictsByStatesQuery.isLoading || filteredDistrictsByZonesQuery.isLoading,
        isLoadingOrgs: filteredOrgsByDistrictsQuery.isLoading,
        isLoadingKvks: filteredKvksQuery.isLoading,

        // Utility
        invalidateScopeQueries,
    };
}
