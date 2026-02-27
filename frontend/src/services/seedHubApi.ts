import { apiClient, ApiError } from './api';

export interface SeedHubData {
    id?: number;
    kvkId?: number;
    yearId?: number; // Frontend key
    kvkName?: string;
    reportingYear: number;
    seasonId: number;
    seasonName?: string;
    cropName: string;
    varietyName?: string;
    variety?: string; // Frontend key

    // Numeric fields with aliases
    areaCovered?: number;
    areaCoveredHa?: number;
    area?: number;

    yield?: number;
    yieldQPerHa?: number;

    quantityProduced?: number;
    quantityProducedQ?: number;

    quantitySold?: number;
    quantitySaleOutQ?: number;

    farmersCount?: number;
    farmersPurchased?: number;

    quantitySoldFarmers?: number;
    quantitySaleToFarmersQ?: number;

    villagesCovered?: number;

    quantitySoldOrg?: number;
    quantitySaleToOtherOrgQ?: number;

    amountGenerated?: number;
    amountGeneratedLakh?: number;

    totalAmountPresently?: number;
    totalAmountPresentLakh?: number;
}

export const seedHubApi = {
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
            const endpoint = `/forms/achievements/projects/seed-hub${queryString ? `?${queryString}` : ''}`;
            return await apiClient.get(endpoint);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to fetch Seed Hub records');
            }
            throw error;
        }
    },

    findById: async (id: number) => {
        try {
            return await apiClient.get(`/forms/achievements/projects/seed-hub/${id}`);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to fetch Seed Hub record');
            }
            throw error;
        }
    },

    create: async (data: SeedHubData) => {
        try {
            return await apiClient.post('/forms/achievements/projects/seed-hub', data);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to create Seed Hub record');
            }
            throw error;
        }
    },

    update: async (id: number, data: Partial<SeedHubData>) => {
        try {
            return await apiClient.put(`/forms/achievements/projects/seed-hub/${id}`, data);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to update Seed Hub record');
            }
            throw error;
        }
    },

    delete: async (id: number) => {
        try {
            return await apiClient.delete(`/forms/achievements/projects/seed-hub/${id}`);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.data?.error || 'Failed to delete Seed Hub record');
            }
            throw error;
        }
    }
};
