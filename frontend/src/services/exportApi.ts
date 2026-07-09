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
        templateKey?: string;
        rawData?: any[] | Record<string, any>;
        isAggregatedReport?: boolean;
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

    /**
     * Server-side Trainings export. The browser sends only the format; the server
     * fetches the (scoped) data itself and generates the file. Small files stream
     * back as a Blob; large ones (e.g. the full PDF) come back as an S3 download
     * URL so they never hit the serverless response-size limit.
     */
    async exportTrainings(
        format: 'pdf' | 'excel' | 'word',
    ): Promise<{ blob?: Blob; url?: string; fileName: string }> {
        const res = await fetch(
            `${API_BASE_URL}/forms/achievements/trainings/export?format=${format}`,
            { method: 'GET', credentials: 'include' },
        );
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || err.message || 'Export failed');
        }
        const ext = format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : 'pdf';
        const fileName = `trainings-report.${ext}`;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await res.json();
            return { url: data.url, fileName: data.fileName || fileName };
        }
        return { blob: await res.blob(), fileName };
    }
}

export const exportApi = new ExportApi();
