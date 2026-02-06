import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationApi } from '../services/publicationApi';
import type { PublicationItemFormData } from '../types/publication';

// ============================================
// Publication Item Hooks
// ============================================

export function usePublicationItems() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['publication-items'],
        queryFn: () => publicationApi.getPublicationItems().then((res: any) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: PublicationItemFormData) => publicationApi.createPublicationItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publication-items'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<PublicationItemFormData> }) =>
            publicationApi.updatePublicationItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publication-items'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => publicationApi.deletePublicationItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publication-items'] });
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
