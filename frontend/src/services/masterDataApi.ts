import { apiClient } from './api';
import type {
    Zone,
    State,
    District,
    Organization,
    University,
    ApiResponse,
    QueryParams,
    MasterDataStats,
    HierarchyZone,
    CreateZoneDto,
    UpdateZoneDto,
    CreateStateDto,
    UpdateStateDto,
    CreateDistrictDto,
    UpdateDistrictDto,
    CreateOrganizationDto,
    UpdateOrganizationDto,
    CreateUniversityDto,
    UpdateUniversityDto,
} from '../types/masterData';

/**
 * Master Data API Client
 * Type-safe, reusable API client for all master data operations
 */

class MasterDataApi {
    private baseUrl = '/admin';

    /**
     * Build query string from params
     */
    private buildQueryString(params?: QueryParams): string {
        if (!params) return '';

        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        return queryString ? `?${queryString}` : '';
    }

    // ============ ZONES ============

    /**
     * Get all zones
     */
    async getZones(params?: QueryParams): Promise<ApiResponse<Zone[]>> {
        const queryString = this.buildQueryString(params);
        return apiClient.get<ApiResponse<Zone[]>>(`${this.baseUrl}/zones${queryString}`);
    }

    /**
     * Get zone by ID
     */
    async getZoneById(id: number): Promise<ApiResponse<Zone>> {
        return apiClient.get<ApiResponse<Zone>>(`${this.baseUrl}/zones/${id}`);
    }

    /**
     * Create zone
     */
    async createZone(data: CreateZoneDto): Promise<ApiResponse<Zone>> {
        return apiClient.post<ApiResponse<Zone>>(`${this.baseUrl}/zones`, data);
    }

    /**
     * Update zone
     */
    async updateZone(id: number, data: UpdateZoneDto): Promise<ApiResponse<Zone>> {
        return apiClient.put<ApiResponse<Zone>>(`${this.baseUrl}/zones/${id}`, data);
    }

    /**
     * Delete zone
     * @param id - Zone ID
     * @param cascade - If true, delete all related records (cascade delete)
     */
    async deleteZone(id: number, cascade: boolean = false): Promise<ApiResponse<{ message: string }>> {
        const queryString = cascade ? '?cascade=true' : '';
        return apiClient.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/zones/${id}${queryString}`);
    }

    // ============ STATES ============

    /**
     * Get all states
     */
    async getStates(params?: QueryParams): Promise<ApiResponse<State[]>> {
        const queryString = this.buildQueryString(params);
        return apiClient.get<ApiResponse<State[]>>(`${this.baseUrl}/states${queryString}`);
    }

    /**
     * Get state by ID
     */
    async getStateById(id: number): Promise<ApiResponse<State>> {
        return apiClient.get<ApiResponse<State>>(`${this.baseUrl}/states/${id}`);
    }

    /**
     * Get states by zone
     */
    async getStatesByZone(zoneId: number, signal?: AbortSignal): Promise<ApiResponse<State[]>> {
        return apiClient.get<ApiResponse<State[]>>(`${this.baseUrl}/states/zone/${zoneId}`, { signal });
    }

    /**
     * Create state
     */
    async createState(data: CreateStateDto): Promise<ApiResponse<State>> {
        return apiClient.post<ApiResponse<State>>(`${this.baseUrl}/states`, data);
    }

    /**
     * Update state
     */
    async updateState(id: number, data: UpdateStateDto): Promise<ApiResponse<State>> {
        return apiClient.put<ApiResponse<State>>(`${this.baseUrl}/states/${id}`, data);
    }

    /**
     * Delete state
     */
    async deleteState(id: number): Promise<ApiResponse<{ message: string }>> {
        return apiClient.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/states/${id}`);
    }

    // ============ DISTRICTS ============

    /**
     * Get all districts
     */
    async getDistricts(params?: QueryParams): Promise<ApiResponse<District[]>> {
        const queryString = this.buildQueryString(params);
        return apiClient.get<ApiResponse<District[]>>(`${this.baseUrl}/districts${queryString}`);
    }

    /**
     * Get district by ID
     */
    async getDistrictById(id: number): Promise<ApiResponse<District>> {
        return apiClient.get<ApiResponse<District>>(`${this.baseUrl}/districts/${id}`);
    }

    /**
     * Get districts by state
     */
    async getDistrictsByState(stateId: number, signal?: AbortSignal): Promise<ApiResponse<District[]>> {
        return apiClient.get<ApiResponse<District[]>>(`${this.baseUrl}/districts/state/${stateId}`, { signal });
    }

    /**
     * Create district
     */
    async createDistrict(data: CreateDistrictDto): Promise<ApiResponse<District>> {
        return apiClient.post<ApiResponse<District>>(`${this.baseUrl}/districts`, data);
    }

    /**
     * Update district
     */
    async updateDistrict(id: number, data: UpdateDistrictDto): Promise<ApiResponse<District>> {
        return apiClient.put<ApiResponse<District>>(`${this.baseUrl}/districts/${id}`, data);
    }

    /**
     * Delete district
     */
    async deleteDistrict(id: number): Promise<ApiResponse<{ message: string }>> {
        return apiClient.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/districts/${id}`);
    }

    // ============ ORGANIZATIONS ============

    /**
     * Get all organizations
     */
    async getOrganizations(params?: QueryParams): Promise<ApiResponse<Organization[]>> {
        const queryString = this.buildQueryString(params);
        return apiClient.get<ApiResponse<Organization[]>>(`${this.baseUrl}/organizations${queryString}`);
    }

    /**
     * Get organization by ID
     */
    async getOrganizationById(id: number): Promise<ApiResponse<Organization>> {
        return apiClient.get<ApiResponse<Organization>>(`${this.baseUrl}/organizations/${id}`);
    }

    /**
     * Get organizations by district
     */
    async getOrganizationsByDistrict(districtId: number, signal?: AbortSignal): Promise<ApiResponse<Organization[]>> {
        return apiClient.get<ApiResponse<Organization[]>>(`${this.baseUrl}/organizations/district/${districtId}`, { signal });
    }

    /**
     * Create organization
     */
    async createOrganization(data: CreateOrganizationDto): Promise<ApiResponse<Organization>> {
        return apiClient.post<ApiResponse<Organization>>(`${this.baseUrl}/organizations`, data);
    }

    /**
     * Update organization
     */
    async updateOrganization(id: number, data: UpdateOrganizationDto): Promise<ApiResponse<Organization>> {
        return apiClient.put<ApiResponse<Organization>>(`${this.baseUrl}/organizations/${id}`, data);
    }

    /**
     * Delete organization
     * @param id - Organization ID
     * @param cascade - If true, delete all related records (cascade delete)
     */
    async deleteOrganization(id: number, cascade: boolean = false): Promise<ApiResponse<{ message: string }>> {
        const queryString = cascade ? '?cascade=true' : '';
        return apiClient.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/organizations/${id}${queryString}`);
    }

    // ============ UNIVERSITIES ============

    /**
     * Get all universities
     */
    async getUniversities(params?: QueryParams): Promise<ApiResponse<University[]>> {
        const queryString = this.buildQueryString(params);
        return apiClient.get<ApiResponse<University[]>>(`${this.baseUrl}/universities${queryString}`);
    }

    /**
     * Get university by ID
     */
    async getUniversityById(id: number): Promise<ApiResponse<University>> {
        return apiClient.get<ApiResponse<University>>(`${this.baseUrl}/universities/${id}`);
    }

    /**
     * Get universities by organization
     */
    async getUniversitiesByOrganization(orgId: number, signal?: AbortSignal): Promise<ApiResponse<University[]>> {
        return apiClient.get<ApiResponse<University[]>>(`${this.baseUrl}/universities/organization/${orgId}`, { signal });
    }

    /**
     * Create university
     */
    async createUniversity(data: CreateUniversityDto): Promise<ApiResponse<University>> {
        return apiClient.post<ApiResponse<University>>(`${this.baseUrl}/universities`, data);
    }

    /**
     * Update university
     */
    async updateUniversity(id: number, data: UpdateUniversityDto): Promise<ApiResponse<University>> {
        return apiClient.put<ApiResponse<University>>(`${this.baseUrl}/universities/${id}`, data);
    }

    /**
     * Delete university
     */
    async deleteUniversity(id: number): Promise<ApiResponse<{ message: string }>> {
        return apiClient.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/universities/${id}`);
    }

    // ============ UTILITY ============

    /**
     * Get statistics
     */
    async getStats(): Promise<ApiResponse<MasterDataStats>> {
        return apiClient.get<ApiResponse<MasterDataStats>>(`${this.baseUrl}/master-data/stats`);
    }

    /**
     * Get hierarchy
     */
    async getHierarchy(): Promise<ApiResponse<HierarchyZone[]>> {
        return apiClient.get<ApiResponse<HierarchyZone[]>>(`${this.baseUrl}/master-data/hierarchy`);
    }
}

// Export singleton instance
export const masterDataApi = new MasterDataApi();
