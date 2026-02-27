import { apiClient, ApiError } from './api';

export interface FpoManagementData {
    id?: number;
    kvkId?: number;
    yearId?: number; // Frontend key
    kvkName?: string;
    reportingYear: number;
    fpoName: string;
    address?: string;
    fpoAddress?: string; // Frontend key
    registrationNumber?: string;
    registrationNo?: string; // Frontend key
    registrationDate: string | Date;
    proposedActivity: string;
    commodityIdentified: string;
    totalBomMembers?: number;
    bomMembersCount?: number; // Frontend key
    totalFarmersAttached?: number;
    farmersAttachedCount?: number; // Frontend key
    financialPositionLakh?: number;
    financialPosition?: number; // Frontend key
    successIndicator: string;
}

export interface FpoDetailsData {
    id?: number;
    kvkId?: number;
    yearId?: number; // Frontend key
    kvkName?: string;
    reportingYear: number;
    blocksAllocated: number;
    fposRegisteredAsCbbo: number;
    avgMembersPerFpo: number;
    fposReceivedManagementCost?: number;
    fposReceivedMgmtCost?: number; // Frontend key
    fposReceivedEquityGrant: number;
    techBackstoppingProvided?: number;
    techBackstoppingFpos?: number; // Frontend key
    trainingProgrammeOrganized?: number;
    trainingProgsOrganized?: number; // Frontend key
    trainingReceivedByMembers: boolean | string;
    assistanceInEconomicActivities?: number;
    assistanceEconomicActivities?: number; // Frontend key
    businessPlanPreparedWithCbbo?: boolean;
    businessPlanCbbo?: string | boolean; // Frontend key
    businessPlanPreparedWithoutCbbo?: boolean;
    businessPlanWithoutCbbo?: string | boolean; // Frontend key
    fposDoingBusiness: number;
}

export const fpoDetailsApi = {
    findAll: async (filters: any = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, String(value));
                    }
                });
            }
            const queryString = queryParams.toString();
            const endpoint = `/forms/achievements/projects/fpo/details${queryString ? `?${queryString}` : ''}`;
            return await apiClient.get(endpoint);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to fetch FPO Details records');
            }
            throw error;
        }
    },

    findById: async (id: number) => {
        try {
            return await apiClient.get(`/forms/achievements/projects/fpo/details/${id}`);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to fetch FPO Details record');
            }
            throw error;
        }
    },

    create: async (data: FpoDetailsData) => {
        try {
            return await apiClient.post('/forms/achievements/projects/fpo/details', data);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to create FPO Details record');
            }
            throw error;
        }
    },

    update: async (id: number, data: Partial<FpoDetailsData>) => {
        try {
            return await apiClient.put(`/forms/achievements/projects/fpo/details/${id}`, data);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to update FPO Details record');
            }
            throw error;
        }
    },

    delete: async (id: number) => {
        try {
            return await apiClient.delete(`/forms/achievements/projects/fpo/details/${id}`);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to delete FPO Details record');
            }
            throw error;
        }
    }
};

const fpoManagementApi = {
    findAll: async (filters: any = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, String(value));
                    }
                });
            }
            const queryString = queryParams.toString();
            const endpoint = `/forms/achievements/projects/fpo/management${queryString ? `?${queryString}` : ''}`;
            return await apiClient.get(endpoint);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to fetch FPO Management records');
            }
            throw error;
        }
    },

    findById: async (id: number) => {
        try {
            return await apiClient.get(`/forms/achievements/projects/fpo/management/${id}`);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to fetch FPO Management record');
            }
            throw error;
        }
    },

    create: async (data: FpoManagementData) => {
        try {
            // Ensure registrationDate is a string for the API call
            const payload = {
                ...data,
                registrationDate: data.registrationDate instanceof Date
                    ? data.registrationDate.toISOString()
                    : data.registrationDate
            };
            return await apiClient.post('/forms/achievements/projects/fpo/management', payload);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to create FPO Management record');
            }
            throw error;
        }
    },

    update: async (id: number, data: Partial<FpoManagementData>) => {
        try {
            const payload = { ...data };
            if (payload.registrationDate instanceof Date) {
                payload.registrationDate = payload.registrationDate.toISOString();
            }
            return await apiClient.put(`/forms/achievements/projects/fpo/management/${id}`, payload);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to update FPO Management record');
            }
            throw error;
        }
    },

    delete: async (id: number) => {
        try {
            return await apiClient.delete(`/forms/achievements/projects/fpo/management/${id}`);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to delete FPO Management record');
            }
            throw error;
        }
    }
};

export { fpoManagementApi };
export default fpoManagementApi;
