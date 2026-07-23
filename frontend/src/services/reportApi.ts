import { apiClient } from './api';
import type {
    ReportConfig,
    ReportGenerationRequest,
    ReportDataResponse,
    ReportApiResponse,
    ReportJob,
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

    async createAggregatedReportJob(request: ReportGenerationRequest): Promise<ReportJob> {
        const response = await apiClient.post<ReportApiResponse<ReportJob>>(
            '/reports/aggregated/jobs',
            request,
        );
        return response.data;
    }

    async getAggregatedReportJob(jobId: string, signal?: AbortSignal): Promise<ReportJob> {
        const response = await apiClient.get<ReportApiResponse<ReportJob>>(
            `/reports/aggregated/jobs/${encodeURIComponent(jobId)}`,
            signal ? { signal } : undefined,
        );
        return response.data;
    }

    async cancelAggregatedReportJob(jobId: string): Promise<ReportJob> {
        const response = await apiClient.post<ReportApiResponse<ReportJob>>(
            `/reports/aggregated/jobs/${encodeURIComponent(jobId)}/cancel`,
            {},
        );
        return response.data;
    }

    async waitForAggregatedReportJob(
        jobId: string,
        options: {
            signal?: AbortSignal;
            onProgress?: (job: ReportJob) => void;
            pollIntervalMs?: number;
            timeoutMs?: number;
        } = {},
    ): Promise<ReportJob> {
        const pollIntervalMs = options.pollIntervalMs ?? 2000;
        const timeoutMs = options.timeoutMs ?? 30 * 60 * 1000;
        const startedAt = Date.now();

        while (Date.now() - startedAt < timeoutMs) {
            const job = await this.getAggregatedReportJob(jobId, options.signal);
            options.onProgress?.(job);
            if (job.status === 'completed') return job;
            if (job.status === 'failed') {
                throw new Error(job.error || 'Report generation failed');
            }
            if (job.status === 'cancelled') {
                const cancelledError = new Error('Report generation cancelled');
                cancelledError.name = 'AbortError';
                throw cancelledError;
            }

            await new Promise<void>((resolve, reject) => {
                const handleAbort = () => {
                    window.clearTimeout(timeout);
                    reject(new DOMException('Report polling was cancelled', 'AbortError'));
                };
                const timeout = window.setTimeout(() => {
                    options.signal?.removeEventListener('abort', handleAbort);
                    resolve();
                }, pollIntervalMs);
                if (options.signal?.aborted) {
                    handleAbort();
                    return;
                }
                options.signal?.addEventListener('abort', handleAbort, { once: true });
            });
        }

        throw new Error('Report generation is taking longer than expected. You can try again shortly.');
    }
}

export const reportApi = new ReportApiService();
