import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { soilEquipmentApi } from '../../services/soilEquipmentApi';
import { ENTITY_TYPES } from '../../constants/entityTypes';

export function useSoilEquipmentData() {
    const queryClient = useQueryClient();
    const queryKey = [ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT];

    const { data: response, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await soilEquipmentApi.getAll();
            return res.data || [];
        },
    });

    const data = response || [];

    const createMutation = useMutation({
        mutationFn: (newData: any) => soilEquipmentApi.create(newData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => soilEquipmentApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => soilEquipmentApi.delete(id),
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
