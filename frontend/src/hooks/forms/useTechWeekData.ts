import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techWeekApi } from '../../services/techWeekApi';
import { ENTITY_TYPES } from '../../constants/entityTypes';

export function useTechWeekData() {
    const queryClient = useQueryClient();
    const queryKey = [ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK];

    const { data: response, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await techWeekApi.getAll();
            return res.data || [];
        },
    });

    const data = response || [];

    const createMutation = useMutation({
        mutationFn: (newData: any) => techWeekApi.create(newData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => techWeekApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => techWeekApi.delete(id),
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
