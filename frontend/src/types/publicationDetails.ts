/**
 * Publication Details Types
 */

export interface PublicationDetails {
    publicationDetailsId: string;
    id: string;
    kvkId: number;
    reportingYearId?: number;
    yearId?: number;
    publicationId?: number;
    title: string;
    authorName: string;
    journalName: string;
    createdAt: string;
    updatedAt: string;
    // Display fields
    'KVK Name'?: string;
    'Reporting Year'?: string | number;
    reportingYear?: string | number;
    'Publication'?: string;
    'Title'?: string;
    'Author Name'?: string;
    'Journal Name'?: string;
    // Frontend format
    year?: string | number;
    publication?: string | number;
    // Relations
    kvk?: {
        kvkName: string;
    };
    reportingYearRelation?: {
        yearName: string;
        yearId: number;
    };
    publicationRelation?: {
        publicationName: string;
        publicationId: number;
    };
}

export interface PublicationDetailsFormData {
    kvkId?: number;
    reportingYearId?: number;
    reportingYear?: string | number;
    yearId?: number;
    year?: string | number;
    publicationId?: number;
    publication?: string | number;
    title: string;
    authorName: string;
    journalName: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    count?: number;
}
