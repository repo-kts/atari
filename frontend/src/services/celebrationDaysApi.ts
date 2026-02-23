import { API_BASE_URL as API_URL, defaultFetchOptions as fetchOptions } from '../config/api';

const BASE = `${API_URL}/forms/achievements/celebration-days`;

export const celebrationDaysApi = {
    getAll: async () => {
        const res = await fetch(BASE, fetchOptions);
        if (!res.ok) throw new Error('Failed to fetch celebration day records');
        return res.json();
    },
    create: async (data: any) => {
        const res = await fetch(BASE, { ...fetchOptions, method: 'POST', body: JSON.stringify(data) });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to create celebration day record');
        }
        return res.json();
    },
    update: async (id: number, data: any) => {
        const res = await fetch(`${BASE}/${id}`, { ...fetchOptions, method: 'PUT', body: JSON.stringify(data) });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to update celebration day record');
        }
        return res.json();
    },
    delete: async (id: number) => {
        const res = await fetch(`${BASE}/${id}`, { ...fetchOptions, method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete celebration day record');
        return res.json();
    },
};
