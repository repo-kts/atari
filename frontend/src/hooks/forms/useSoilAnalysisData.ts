import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { soilAnalysisApi } from '../../services/soilAnalysisApi';
import { ENTITY_TYPES } from '../../constants/entityTypes';

export function useSoilAnalysisData() {
    const queryClient = useQueryClient();
    const queryKey = [ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS];

    const { data: response, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await soilAnalysisApi.getAll();
            return res.data || [];
        },
    });

    const data = response || [];

    const createMutation = useMutation({
        mutationFn: (newData: any) => soilAnalysisApi.create(newData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => soilAnalysisApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => soilAnalysisApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    return {
        data,
        isLoading,
        error,
        refetch,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
