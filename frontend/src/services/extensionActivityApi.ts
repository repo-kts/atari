import { API_BASE_URL as API_URL, defaultFetchOptions as fetchOptions } from '../config/api';

export const extensionActivityApi = {
    // Get all extension activities
    getAll: async () => {
        const response = await fetch(`${API_URL}/forms/achievements/extension-activities`, fetchOptions);
        if (!response.ok) throw new Error('Failed to fetch extension activities');
        return response.json();
    },

    // Create a new extension activity
    create: async (data: any) => {
        const response = await fetch(`${API_URL}/forms/achievements/extension-activities`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create extension activity');
        }
        return response.json();
    },

    // Update an extension activity
    update: async (id: number, data: any) => {
        const response = await fetch(`${API_URL}/forms/achievements/extension-activities/${id}`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update extension activity');
        }
        return response.json();
    },

    // Delete an extension activity
    delete: async (id: number) => {
        const response = await fetch(`${API_URL}/forms/achievements/extension-activities/${id}`, {
            ...fetchOptions,
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete extension activity');
        return response.json();
    },
};
