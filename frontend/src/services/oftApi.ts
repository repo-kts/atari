import { API_BASE_URL as API_URL, defaultFetchOptions as fetchOptions } from '../config/api';

export const oftApi = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/forms/achievements/oft`, fetchOptions);
        if (!response.ok) throw new Error('Failed to fetch OFT');
        return response.json();
    },
    create: async (data: any) => {
        const response = await fetch(`${API_URL}/forms/achievements/oft`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create OFT');
        }
        return response.json();
    },
    update: async (id: number, data: any) => {
        const response = await fetch(`${API_URL}/forms/achievements/oft/${id}`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update OFT');
        }
        return response.json();
    },
    delete: async (id: number) => {
        const response = await fetch(`${API_URL}/forms/achievements/oft/${id}`, {
            ...fetchOptions,
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete OFT');
        return response.json();
    },
};
