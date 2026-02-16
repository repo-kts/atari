import { apiClient } from './api';
import type { ApiResponse } from '../types/masterData';

// Paginated response type
interface PaginatedResponse<T> {
    data: T[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const BASE_URL = '/admin/masters';

/**
 * API client for Other Masters (Season, Sanctioned Post, Year)
 */

// ============================================
// Type Definitions
// ============================================

export interface Season {
    seasonId: number;
    seasonName: string;
    _count?: {
        cfldCrops: number;
        craCropingSystems: number;
        craFarmingSystems: number;
    };
}

export interface SanctionedPost {
    sanctionedPostId: number;
    postName: string;
    _count?: {
        staff: number;
    };
}

export interface Year {
    yearId: number;
    yearName: string;
}

// Form Data Types
export interface SeasonFormData {
    seasonName: string;
}

export interface SanctionedPostFormData {
    postName: string;
}

export interface YearFormData {
    yearName: string;
}

// ============================================
// Season APIs
// ============================================

export const otherMastersApi = {
    // Seasons
    getSeasons: () =>
        apiClient.get<PaginatedResponse<Season>>(`${BASE_URL}/seasons`),

    getSeasonById: (id: number) =>
        apiClient.get<ApiResponse<Season>>(`${BASE_URL}/seasons/${id}`),

    createSeason: (data: SeasonFormData) =>
        apiClient.post<ApiResponse<Season>>(`${BASE_URL}/seasons`, data),

    updateSeason: (id: number, data: Partial<SeasonFormData>) =>
        apiClient.put<ApiResponse<Season>>(`${BASE_URL}/seasons/${id}`, data),

    deleteSeason: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/seasons/${id}`),

    // Sanctioned Posts
    getSanctionedPosts: () =>
        apiClient.get<PaginatedResponse<SanctionedPost>>(`${BASE_URL}/sanctioned-posts`),

    getSanctionedPostById: (id: number) =>
        apiClient.get<ApiResponse<SanctionedPost>>(`${BASE_URL}/sanctioned-posts/${id}`),

    createSanctionedPost: (data: SanctionedPostFormData) =>
        apiClient.post<ApiResponse<SanctionedPost>>(`${BASE_URL}/sanctioned-posts`, data),

    updateSanctionedPost: (id: number, data: Partial<SanctionedPostFormData>) =>
        apiClient.put<ApiResponse<SanctionedPost>>(`${BASE_URL}/sanctioned-posts/${id}`, data),

    deleteSanctionedPost: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/sanctioned-posts/${id}`),

    // Years
    getYears: () =>
        apiClient.get<PaginatedResponse<Year>>(`${BASE_URL}/years`),

    getYearById: (id: number) =>
        apiClient.get<ApiResponse<Year>>(`${BASE_URL}/years/${id}`),

    createYear: (data: YearFormData) =>
        apiClient.post<ApiResponse<Year>>(`${BASE_URL}/years`, data),

    updateYear: (id: number, data: Partial<YearFormData>) =>
        apiClient.put<ApiResponse<Year>>(`${BASE_URL}/years/${id}`, data),

    deleteYear: (id: number) =>
        apiClient.delete<ApiResponse<void>>(`${BASE_URL}/years/${id}`),
};
