import { API_BASE_URL as API_URL, defaultFetchOptions as fetchOptions } from '../../config/api';

const BASE = `${API_URL}/forms/soil-water/world-soil-day`;

export const worldSoilDayApi = {
    getAll: async () => {
        const response = await fetch(BASE, fetchOptions);
        if (!response.ok) throw new Error('Failed to fetch World Soil Day records');
        return response.json();
    },

    getById: async (id: number) => {
        const response = await fetch(`${BASE}/${id}`, fetchOptions);
        if (!response.ok) throw new Error('Failed to fetch record');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(BASE, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create record');
        }
        return response.json();
    },

    update: async (id: number, data: any) => {
        const response = await fetch(`${BASE}/${id}`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update record');
        }
        return response.json();
    },

    delete: async (id: number) => {
        const response = await fetch(`${BASE}/${id}`, {
            ...fetchOptions,
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete record');
        return response.json();
    },
};
