import { apiClient } from './api';

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
        templateKey?: string;
        rawData?: any[] | Record<string, any>;
        isAggregatedReport?: boolean;
    }, pathname?: string): Promise<Blob> {
        const baseUrl = this.getBaseUrl(pathname);
        return apiClient.postBlob(baseUrl, data);
    }
}

export const exportApi = new ExportApi();
