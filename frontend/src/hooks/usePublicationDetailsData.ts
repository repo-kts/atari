import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationDetailsApi } from '../services/publicationDetailsApi';
import type { PublicationDetailsFormData } from '../types/publicationDetails';
import { invalidateEntityType } from '../utils/queryInvalidation';
import { ENTITY_TYPES } from '../constants/entityConstants';

/**
 * Hook for fetching all publication details records
 * @param {object} filters - Optional filters
 * @returns {object} Query result with data, loading state, and error
 */
export function usePublicationDetails(filters?: Record<string, any>) {
    const query = useQuery({
        queryKey: ['publication-details', filters],
        queryFn: () => publicationDetailsApi.getPublicationDetails(filters).then((res) => res.data),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    };
}

/**
 * Hook for fetching a single publication details record by ID
 * @param {string} id - Publication details UUID
 * @param {boolean} enabled - Whether the query should run
 * @returns {object} Query result with data, loading state, and error
 */
export function usePublicationDetailsById(id: string | null | undefined, enabled: boolean = true) {
    const query = useQuery({
        queryKey: ['publication-detail', id],
        queryFn: () => publicationDetailsApi.getPublicationDetailsById(id!).then((res) => res.data),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

/**
 * Hook for publication details CRUD operations
 * @returns {object} Mutations and query client
 */
export function usePublicationDetailsMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: PublicationDetailsFormData) => publicationDetailsApi.createPublicationDetails(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<PublicationDetailsFormData> }) =>
            publicationDetailsApi.updatePublicationDetails(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => publicationDetailsApi.deletePublicationDetails(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS);
        },
    });

    return {
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
