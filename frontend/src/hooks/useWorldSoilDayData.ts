import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { worldSoilDayApi } from '../api/forms/worldSoilDayApi';

export const useWorldSoilDayData = () => {
    const queryClient = useQueryClient();

    const { data: items = [], isLoading, error } = useQuery({
        queryKey: ['world-soil-day'],
        queryFn: worldSoilDayApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: worldSoilDayApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['world-soil-day'] });
        },
        onError: () => {
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => worldSoilDayApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['world-soil-day'] });
        },
        onError: () => {
        },
    });

    const deleteMutation = useMutation({
        mutationFn: worldSoilDayApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['world-soil-day'] });
        },
        onError: () => {
        },
    });

    return {
        data: items,
        isLoading,
        error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
    };
};
