import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { otherMastersApi } from '../services/otherMastersApi';
import { invalidateEntityType } from '../utils/queryInvalidation';
import { ENTITY_TYPES } from '../constants/entityTypes';
import type {
    SeasonFormData,
    SanctionedPostFormData,
    YearFormData,
} from '../services/otherMastersApi';

// ============================================
// Season Hooks
// ============================================

export function useSeasons() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['seasons'],
        queryFn: () => otherMastersApi.getSeasons().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: SeasonFormData) => otherMastersApi.createSeason(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SEASON);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SeasonFormData> }) =>
            otherMastersApi.updateSeason(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SEASON);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteSeason(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SEASON);
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// Sanctioned Post Hooks
// ============================================

export function useSanctionedPosts() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['sanctioned-posts'],
        queryFn: () => otherMastersApi.getSanctionedPosts().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: SanctionedPostFormData) => otherMastersApi.createSanctionedPost(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SANCTIONED_POST);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SanctionedPostFormData> }) =>
            otherMastersApi.updateSanctionedPost(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SANCTIONED_POST);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteSanctionedPost(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SANCTIONED_POST);
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ============================================
// Year Hooks
// ============================================

export function useYears() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['years'],
        queryFn: () => otherMastersApi.getYears().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: YearFormData) => otherMastersApi.createYear(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.YEAR);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<YearFormData> }) =>
            otherMastersApi.updateYear(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.YEAR);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteYear(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.YEAR);
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
