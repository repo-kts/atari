import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cfldApi } from '../services/cfldApi';

const EMPTY_ARRAY: any[] = [];

// ============================================
// CFLD Technical Parameter Hooks
// ============================================

export function useCfldTechnicalParameters() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['cfld-technical-parameters'],
        queryFn: () => cfldApi.getTechnicalParameters().then((res) => res.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => cfldApi.createTechnicalParameter(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cfld-technical-parameters'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            cfldApi.updateTechnicalParameter(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cfld-technical-parameters'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => cfldApi.deleteTechnicalParameter(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cfld-technical-parameters'] });
        },
    });

    return {
        data: query.data?.data || EMPTY_ARRAY,
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
