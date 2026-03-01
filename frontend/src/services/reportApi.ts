import { apiClient } from './api';
import { API_BASE_URL } from '../config/api';
import type {
    ReportConfig,
    ReportGenerationRequest,
    ReportDataResponse,
    ReportApiResponse,
} from '../types/reports';
import type { ScopeOption, ScopeOptions } from '../types/reportScope';

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
     * Generate and download KVK report PDF
     */
    async generateReport(request: ReportGenerationRequest): Promise<Blob> {
        const response = await fetch(`${API_BASE_URL}/reports/kvk/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to generate report' }));
            throw new Error(error.error || 'Failed to generate report');
        }

        return await response.blob();
    }

    /**
     * Download report as PDF file
     */
    async downloadReport(request: ReportGenerationRequest, fileName?: string): Promise<void> {
        try {
            const blob = await this.generateReport(request);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || `KVK_Report_${Date.now()}.pdf`;
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
    async generateAggregatedReport(request: ReportGenerationRequest): Promise<Blob> {
        const response = await fetch(`${API_BASE_URL}/reports/aggregated/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to generate aggregated report' }));
            throw new Error(error.error || 'Failed to generate aggregated report');
        }

        return await response.blob();
    }
}

export const reportApi = new ReportApiService();
