/**
 * Report Types
 * Type definitions for KVK report generation
 */

export interface ReportSection {
    id: string;
    title: string;
    description: string;
    subsection: boolean;
    parentSectionId?: string;
}

export interface ReportConfig {
    sections: ReportSection[];
}

export interface ReportFilters {
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
    year?: number;
}

export interface ReportGenerationRequest {
    kvkId?: number; // Optional, will use user's KVK if not provided
    sectionIds?: string[];
    filters?: ReportFilters;
    scope?: {
        zoneIds?: number[];
        stateIds?: number[];
        districtIds?: number[];
        orgIds?: number[];
        kvkIds?: number[];
    }; // Optional scope for aggregated reports
}

export interface ReportDataResponse {
    kvkInfo: {
        kvkId: number;
        kvkName: string;
        address: string;
        email: string;
        mobile: string;
        zone: string;
        state: string;
        district: string;
        organization: string;
        university?: string | null;
        hostOrg: string;
        yearOfSanction: number;
    };
    sectionsData: Record<string, {
        data: any;
        error?: string;
    }>;
}

export interface ReportApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}
