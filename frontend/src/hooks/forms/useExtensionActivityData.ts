import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extensionActivityApi } from '../../services/extensionActivityApi';
import { ENTITY_TYPES } from '../../constants/entityTypes';

export function useExtensionActivityData() {
    const queryClient = useQueryClient();
    const queryKey = [ENTITY_TYPES.ACHIEVEMENT_EXTENSION];

    const { data: response, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await extensionActivityApi.getAll();
            return res.data;
        },
    });

    const data = response || [];

    const createMutation = useMutation({
        mutationFn: (newData: any) => extensionActivityApi.create(newData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => extensionActivityApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => extensionActivityApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
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
