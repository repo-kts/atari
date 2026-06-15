/**
 * Publication Details Types
 */

export interface PublicationDetails {
    publicationDetailsId: string;
    id: string;
    kvkId: number;
    publicationId?: number;
    title: string;
    authorName: string;
    journalName?: string | null;
    naasRating?: number | null;
    publisherName?: string | null;
    venue?: string | null;
    isbnNumber?: string | null;
    publicationName?: string;
    createdAt: string;
    updatedAt: string;
    reportingYear?: string | number;
    year?: string | number;
    publication?: string | number;
    // Relations
    kvk?: {
        kvkName: string;
    };
    reportingYearRelation?: {
        yearName: string;
    };
    publicationRelation?: {
        publicationName: string;
        publicationId: number;
    };
}

export interface PublicationDetailsFormData {
    kvkId?: number;
    reportingYear?: string | number;
    year?: string | number;
    publicationId?: number;
    publication?: string | number;
    title: string;
    authorName: string;
    journalName?: string;
    naasRating?: string | number;
    publisherName?: string;
    venue?: string;
    isbnNumber?: string;
    publicationName?: string;
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
