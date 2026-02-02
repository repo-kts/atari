/**
 * Master Data Type Definitions
 */

// ============ Entity Types ============

export interface Zone {
    zoneId: number;
    zoneName: string;
    _count?: {
        states: number;
        districts: number;
        users: number;
    };
}

export interface State {
    stateId: number;
    stateName: string;
    zoneId: number;
    zone?: {
        zoneId: number;
        zoneName: string;
    };
    _count?: {
        districts: number;
        orgs: number;
        users: number;
    };
}

export interface District {
    districtId: number;
    districtName: string;
    stateId: number;
    zoneId: number;
    state?: {
        stateId: number;
        stateName: string;
    };
    zone?: {
        zoneId: number;
        zoneName: string;
    };
    _count?: {
        users: number;
    };
}

export interface Organization {
    orgId: number;
    uniName: string;
    stateId: number;
    state?: {
        stateId: number;
        stateName: string;
        zone?: {
            zoneId: number;
            zoneName: string;
        };
    };
    _count?: {
        users: number;
    };
}

// ============ Union Types ============

export type MasterDataEntity = Zone | State | District | Organization;

export type EntityType = 'zones' | 'states' | 'districts' | 'organizations';

// ============ API Types ============

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: PaginationMeta;
    timestamp: string;
}

export interface ApiError {
    success: false;
    error: {
        message: string;
        code: string;
        field?: string;
    };
    timestamp: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    zoneId?: number;
    stateId?: number;
    [key: string]: any;
}

// ============ Form Types ============

export interface FormField<T> {
    name: keyof T;
    label: string;
    type: 'text' | 'select' | 'number';
    required?: boolean;
    placeholder?: string;
    options?: SelectOption[];
    dependsOn?: keyof T;
    loadOptions?: (value: any) => Promise<SelectOption[]>;
}

export interface SelectOption {
    value: number | string;
    label: string;
}

export interface FormSchema<T> {
    fields: FormField<T>[];
}

// ============ Store Types ============

export interface LoadingState {
    zones: boolean;
    states: boolean;
    districts: boolean;
    organizations: boolean;
}

export interface ErrorState {
    zones: string | null;
    states: string | null;
    districts: string | null;
    organizations: string | null;
}

export interface FilterState {
    search: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
}

export interface FiltersState {
    zones: FilterState;
    states: FilterState;
    districts: FilterState;
    organizations: FilterState;
}

// ============ Statistics Types ============

export interface MasterDataStats {
    zones: number;
    states: number;
    districts: number;
    organizations: number;
}

// ============ Hierarchy Types ============

export interface HierarchyZone extends Zone {
    states: HierarchyState[];
}

export interface HierarchyState extends State {
    districts: District[];
    orgs: Organization[];
}

// ============ Create/Update DTOs ============

export interface CreateZoneDto {
    zoneName: string;
}

export interface UpdateZoneDto {
    zoneName?: string;
}

export interface CreateStateDto {
    stateName: string;
    zoneId: number;
}

export interface UpdateStateDto {
    stateName?: string;
    zoneId?: number;
}

export interface CreateDistrictDto {
    districtName: string;
    stateId: number;
    zoneId: number;
}

export interface UpdateDistrictDto {
    districtName?: string;
    stateId?: number;
    zoneId?: number;
}

export interface CreateOrganizationDto {
    uniName: string;
    stateId: number;
}

export interface UpdateOrganizationDto {
    uniName?: string;
    stateId?: number;
}

// ============ Table Types ============

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

export interface TableAction<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'primary' | 'danger' | 'secondary';
}
