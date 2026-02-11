import { API_BASE_URL } from '../config/api';

class ExportApi {
    private getBaseUrl(pathname?: string): string {
        // If pathname includes '/forms/about-kvk', use the About KVK export route
        // Otherwise, use the admin masters export route
        if (pathname && pathname.includes('/forms/about-kvk')) {
            return '/forms/about-kvk/export';
        }
        return '/admin/masters/exportData';
    }

    async exportData(data: {
        title: string;
        headers: string[];
        rows: any[][];
        format: 'pdf' | 'excel' | 'word';
    }, pathname?: string): Promise<Blob> {
        const baseUrl = this.getBaseUrl(pathname);
        const response = await fetch(`${API_BASE_URL}${baseUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Export failed');
        }

        return await response.blob();
    }
}

export const exportApi = new ExportApi();
