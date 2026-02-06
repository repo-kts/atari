import { PaginationMeta, QueryParams, ApiResponse } from './masterData';

/**
 * Publication Master Data Types
 */

// ============================================
// Entity Definitions
// ============================================

export interface PublicationItem {
    publicationId: number;
    publicationName: string;
}

// ============================================
// Form Data Types
// ============================================

export interface PublicationItemFormData {
    publicationName: string;
}

// ============================================
// Statistics Types
// ============================================

export interface PublicationStats {
    publications: {
        items: number;
    };
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: PaginationMeta;
}
