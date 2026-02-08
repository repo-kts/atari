import { API_BASE_URL } from '../config/api';

class ExportApi {
    private baseUrl = '/admin/masters/exportData';

    async exportData(data: {
        title: string;
        headers: string[];
        rows: any[][];
        format: 'pdf' | 'excel' | 'word';
    }): Promise<Blob> {
        const response = await fetch(`${API_BASE_URL}${this.baseUrl}`, {
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
