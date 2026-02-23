import { API_BASE_URL as API_URL, defaultFetchOptions as fetchOptions } from '../config/api';

const BASE = `${API_URL}/forms/achievements/fld`;
const MASTERS = `${API_URL}/admin/masters`;

export const fldApi = {
    // ─── FLD Introduction CRUD ───────────────────────────────────────────────
    getAll: async () => {
        const res = await fetch(BASE, fetchOptions);
        if (!res.ok) throw new Error('Failed to fetch FLD records');
        return res.json();
    },
    create: async (data: any) => {
        const res = await fetch(BASE, { ...fetchOptions, method: 'POST', body: JSON.stringify(data) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to create FLD record'); }
        return res.json();
    },
    update: async (id: number, data: any) => {
        const res = await fetch(`${BASE}/${id}`, { ...fetchOptions, method: 'PUT', body: JSON.stringify(data) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to update FLD record'); }
        return res.json();
    },
    delete: async (id: number) => {
        const res = await fetch(`${BASE}/${id}`, { ...fetchOptions, method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete FLD record');
        return res.json();
    },

    // ─── Dependent dropdown helpers (used by DependentDropdown.onOptionsLoad) ──
    /** All sectors (top of chain) */
    getSectors: async () => {
        const res = await fetch(`${MASTERS}/fld/sectors`, fetchOptions);
        if (!res.ok) throw new Error('Failed to fetch sectors');
        const json = await res.json();
        const data = json.data || [];
        return data.map((s: any) => ({ value: s.sectorId, label: s.sectorName }));
    },

    /** Categories filtered by sectorId — called by DependentDropdown.onOptionsLoad */
    getCategoriesBySector: async (sectorId: string | number, signal?: AbortSignal) => {
        const res = await fetch(`${MASTERS}/fld/sectors/${sectorId}/categories`, { ...fetchOptions, signal });
        if (!res.ok) throw new Error('Failed to fetch categories');
        const json = await res.json();
        const data = json.data || [];
        return data.map((c: any) => ({ value: c.categoryId, label: c.categoryName }));
    },

    /** Subcategories filtered by categoryId — called by DependentDropdown.onOptionsLoad */
    getSubcategoriesByCategory: async (categoryId: string | number, signal?: AbortSignal) => {
        const res = await fetch(`${MASTERS}/fld/categories/${categoryId}/subcategories`, { ...fetchOptions, signal });
        if (!res.ok) throw new Error('Failed to fetch subcategories');
        const json = await res.json();
        const data = json.data || [];
        return data.map((s: any) => ({ value: s.subCategoryId, label: s.subCategoryName }));
    },

    /** Crops filtered by subcategoryId — called by DependentDropdown.onOptionsLoad */
    getCropsBySubcategory: async (subCategoryId: string | number, signal?: AbortSignal) => {
        const res = await fetch(`${MASTERS}/fld/subcategories/${subCategoryId}/crops`, { ...fetchOptions, signal });
        if (!res.ok) throw new Error('Failed to fetch crops');
        const json = await res.json();
        const data = json.data || [];
        return data.map((c: any) => ({ value: c.cropId, label: c.cropName }));
    },

    /** All seasons */
    getSeasons: async () => {
        const res = await fetch(`${MASTERS}/seasons`, fetchOptions);
        if (!res.ok) throw new Error('Failed to fetch seasons');
        const json = await res.json();
        const data = json.data || [];
        return data.map((s: any) => ({ value: s.seasonId, label: s.seasonName }));
    },
};
