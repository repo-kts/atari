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
        queryFn: async () => {
            const res = await cfldApi.getTechnicalParameters();
            // Backend returns { success: true, data: [...] }
            // axios wraps it in { data: { success: true, data: [...] } }
            const responseData = res.data;
            if (responseData?.success && Array.isArray(responseData.data)) {
                return responseData.data;
            }
            // Fallback: if data is directly an array
            if (Array.isArray(responseData)) {
                return responseData;
            }
            // Fallback: if data.data exists
            if (Array.isArray(responseData?.data)) {
                return responseData.data;
            }
            return EMPTY_ARRAY;
        },
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
        data: Array.isArray(query.data) ? query.data : EMPTY_ARRAY,
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
