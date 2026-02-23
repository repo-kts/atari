import { API_BASE_URL as API_URL, defaultFetchOptions as fetchOptions } from '../config/api';

export const hrdApi = {
    // Get all HRD programs
    getAll: async () => {
        const response = await fetch(`${API_URL}/forms/hrd`, fetchOptions);
        if (!response.ok) throw new Error('Failed to fetch HRD programs');
        return response.json();
    },

    // Create a new HRD program
    create: async (data: any) => {
        const response = await fetch(`${API_URL}/forms/hrd`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create HRD program');
        }
        return response.json();
    },

    // Update an HRD program
    update: async (id: number, data: any) => {
        const response = await fetch(`${API_URL}/forms/hrd/${id}`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update HRD program');
        }
        return response.json();
    },

    // Delete an HRD program
    delete: async (id: number) => {
        const response = await fetch(`${API_URL}/forms/hrd/${id}`, {
            ...fetchOptions,
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete HRD program');
        return response.json();
    },
};
