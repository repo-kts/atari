import { create } from 'zustand';
import type {
    Zone,
    State,
    District,
    Organization,
    EntityType,
    LoadingState,
    ErrorState,
    FiltersState,
    FilterState,
} from '../types/masterData';

/**
 * Master Data Store
 * Ultra-fast, minimal re-render state management with Zustand
 */

interface MasterDataState {
    // Data
    zones: Zone[];
    states: State[];
    districts: District[];
    organizations: Organization[];

    // Loading states
    loading: LoadingState;

    // Error states
    errors: ErrorState;

    // Filters and pagination
    filters: FiltersState;

    // Actions - Zones
    setZones: (zones: Zone[]) => void;
    addZone: (zone: Zone) => void;
    updateZone: (id: number, zone: Partial<Zone>) => void;
    deleteZone: (id: number) => void;

    // Actions - States
    setStates: (states: State[]) => void;
    addState: (state: State) => void;
    updateState: (id: number, state: Partial<State>) => void;
    deleteState: (id: number) => void;

    // Actions - Districts
    setDistricts: (districts: District[]) => void;
    addDistrict: (district: District) => void;
    updateDistrict: (id: number, district: Partial<District>) => void;
    deleteDistrict: (id: number) => void;

    // Actions - Organizations
    setOrganizations: (organizations: Organization[]) => void;
    addOrganization: (organization: Organization) => void;
    updateOrganization: (id: number, organization: Partial<Organization>) => void;
    deleteOrganization: (id: number) => void;

    // Generic actions
    setLoading: (entityType: EntityType, loading: boolean) => void;
    setError: (entityType: EntityType, error: string | null) => void;
    setFilter: (entityType: EntityType, filter: Partial<FilterState>) => void;
    resetFilters: (entityType: EntityType) => void;
    clearErrors: () => void;

    // Computed selectors
    getZoneById: (id: number) => Zone | undefined;
    getStateById: (id: number) => State | undefined;
    getDistrictById: (id: number) => District | undefined;
    getOrganizationById: (id: number) => Organization | undefined;
    getStatesByZone: (zoneId: number) => State[];
    getDistrictsByState: (stateId: number) => District[];
    getOrganizationsByState: (stateId: number) => Organization[];
}

const defaultFilterState: FilterState = {
    search: '',
    page: 1,
    limit: 20,
    sortOrder: 'asc',
};

export const useMasterDataStore = create<MasterDataState>((set, get) => ({
    // Initial data
    zones: [],
    states: [],
    districts: [],
    organizations: [],

    // Initial loading states
    loading: {
        zones: false,
        states: false,
        districts: false,
        organizations: false,
    },

    // Initial error states
    errors: {
        zones: null,
        states: null,
        districts: null,
        organizations: null,
    },

    // Initial filters
    filters: {
        zones: { ...defaultFilterState },
        states: { ...defaultFilterState },
        districts: { ...defaultFilterState },
        organizations: { ...defaultFilterState },
    },

    // ============ ZONE ACTIONS ============

    setZones: (zones) => set({ zones }),

    addZone: (zone) =>
        set((state) => ({
            zones: [...state.zones, zone],
        })),

    updateZone: (id, updatedZone) =>
        set((state) => ({
            zones: state.zones.map((zone) =>
                zone.zoneId === id ? { ...zone, ...updatedZone } : zone
            ),
        })),

    deleteZone: (id) =>
        set((state) => ({
            zones: state.zones.filter((zone) => zone.zoneId !== id),
        })),

    // ============ STATE ACTIONS ============

    setStates: (states) => set({ states }),

    addState: (state) =>
        set((prevState) => ({
            states: [...prevState.states, state],
        })),

    updateState: (id, updatedState) =>
        set((state) => ({
            states: state.states.map((s) =>
                s.stateId === id ? { ...s, ...updatedState } : s
            ),
        })),

    deleteState: (id) =>
        set((state) => ({
            states: state.states.filter((s) => s.stateId !== id),
        })),

    // ============ DISTRICT ACTIONS ============

    setDistricts: (districts) => set({ districts }),

    addDistrict: (district) =>
        set((state) => ({
            districts: [...state.districts, district],
        })),

    updateDistrict: (id, updatedDistrict) =>
        set((state) => ({
            districts: state.districts.map((district) =>
                district.districtId === id ? { ...district, ...updatedDistrict } : district
            ),
        })),

    deleteDistrict: (id) =>
        set((state) => ({
            districts: state.districts.filter((district) => district.districtId !== id),
        })),

    // ============ ORGANIZATION ACTIONS ============

    setOrganizations: (organizations) => set({ organizations }),

    addOrganization: (organization) =>
        set((state) => ({
            organizations: [...state.organizations, organization],
        })),

    updateOrganization: (id, updatedOrganization) =>
        set((state) => ({
            organizations: state.organizations.map((org) =>
                org.orgId === id ? { ...org, ...updatedOrganization } : org
            ),
        })),

    deleteOrganization: (id) =>
        set((state) => ({
            organizations: state.organizations.filter((org) => org.orgId !== id),
        })),

    // ============ GENERIC ACTIONS ============

    setLoading: (entityType, loading) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [entityType]: loading,
            },
        })),

    setError: (entityType, error) =>
        set((state) => ({
            errors: {
                ...state.errors,
                [entityType]: error,
            },
        })),

    setFilter: (entityType, filter) =>
        set((state) => ({
            filters: {
                ...state.filters,
                [entityType]: {
                    ...state.filters[entityType],
                    ...filter,
                },
            },
        })),

    resetFilters: (entityType) =>
        set((state) => ({
            filters: {
                ...state.filters,
                [entityType]: { ...defaultFilterState },
            },
        })),

    clearErrors: () =>
        set({
            errors: {
                zones: null,
                states: null,
                districts: null,
                organizations: null,
            },
        }),

    // ============ COMPUTED SELECTORS ============

    getZoneById: (id) => {
        const state = get();
        return state.zones.find((zone) => zone.zoneId === id);
    },

    getStateById: (id) => {
        const state = get();
        return state.states.find((s) => s.stateId === id);
    },

    getDistrictById: (id) => {
        const state = get();
        return state.districts.find((district) => district.districtId === id);
    },

    getOrganizationById: (id) => {
        const state = get();
        return state.organizations.find((org) => org.orgId === id);
    },

    getStatesByZone: (zoneId) => {
        const state = get();
        return state.states.filter((s) => s.zoneId === zoneId);
    },

    getDistrictsByState: (stateId) => {
        const state = get();
        return state.districts.filter((district) => district.stateId === stateId);
    },

    getOrganizationsByState: (stateId) => {
        const state = get();
        return state.organizations.filter((org) => org.stateId === stateId);
    },
}));
