import { apiClient } from './api';
import type {
    ReportConfig,
    ReportGenerationRequest,
    ReportDataResponse,
    ReportApiResponse,
} from '../types/reports';
import type { ScopeOption, ScopeOptions } from '../types/reportScope';
import { getCompactDateTime } from '../utils/exportUtils';

/**
 * Report API Service
 * Handles all report-related API calls
 */
class ReportApiService {
    /**
     * Get report configuration (available sections)
     */
    async getReportConfig(): Promise<ReportConfig> {
        const response = await apiClient.get<ReportApiResponse<ReportConfig>>('/reports/kvk/config');
        return response.data;
    }

    /**
     * Get report data for preview
     */
    async getReportData(request: ReportGenerationRequest): Promise<ReportDataResponse> {
        const response = await apiClient.post<ReportApiResponse<ReportDataResponse>>(
            '/reports/kvk/data',
            request
        );
        return response.data;
    }

    /**
     * Generate KVK report in desired format (pdf|excel|docx)
     */
    async generateReport(request: ReportGenerationRequest, format: 'pdf' | 'excel' | 'docx' = 'pdf'): Promise<Blob> {
        return apiClient.postBlob(`/reports/kvk/generate?format=${format}`, request);
    }

    /**
     * Download report as PDF file
     */
    async downloadReport(request: ReportGenerationRequest, fileName?: string, format: 'pdf' | 'excel' | 'docx' = 'pdf'): Promise<void> {
        try {
            const blob = await this.generateReport(request, format);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const ext = format === 'excel' ? 'xlsx' : format === 'docx' ? 'docx' : 'pdf';
            const defaultName = `kvk-report-${getCompactDateTime()}.${ext}`;
            link.download = fileName || defaultName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading report:', error);
            throw error;
        }
    }

    /**
     * Get scope options for current user
     */
    async getScopeOptions(): Promise<ScopeOptions> {
        const response = await apiClient.get<ReportApiResponse<ScopeOptions>>('/reports/scope');
        return response.data;
    }

    /**
     * Get filtered children based on selected parents
     */
    async getFilteredChildren(parentType: string, parentIds: number[]): Promise<ScopeOption[]> {
        const response = await apiClient.post<ReportApiResponse<ScopeOption[]>>(
            '/reports/scope/children',
            { parentType, parentIds }
        );
        return response.data;
    }

    /**
     * Get filtered KVKs based on multiple parent filters
     */
    async getFilteredKvks(filters: {
        zoneIds?: number[];
        stateIds?: number[];
        districtIds?: number[];
        orgIds?: number[];
    }): Promise<ScopeOption[]> {
        const response = await apiClient.post<ReportApiResponse<ScopeOption[]>>(
            '/reports/scope/kvks',
            filters
        );
        return response.data;
    }

    /**
     * Generate aggregated report
     */
    async generateAggregatedReport(request: ReportGenerationRequest, format: 'pdf' | 'excel' | 'docx' = 'pdf'): Promise<Blob> {
        return apiClient.postBlob(`/reports/aggregated/generate?format=${format}`, request);
    }
}

export const reportApi = new ReportApiService();
