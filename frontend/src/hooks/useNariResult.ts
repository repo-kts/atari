import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

/**
 * Hook for managing NARI results across different modules
 */
export function useNariResult(entityType: string, parentId: number | string | null) {
    const queryClient = useQueryClient();

    const endpointMap: Record<string, string> = {
        'project-nari-nutri-garden': '/forms/achievements/projects/nari/nutritional-garden',
        'project-nari-bio-fortified': '/forms/achievements/projects/nari/bio-fortified-crop',
        'project-nari-value-addition': '/forms/achievements/projects/nari/value-addition',
    };

    const endpoint = endpointMap[entityType];

    const { data: resultData, isLoading, error } = useQuery({
        queryKey: ['nari-result', entityType, parentId],
        queryFn: async () => {
            if (!parentId || !endpoint) return null;
            const res = await apiClient.get<any>(`${endpoint}/${parentId}/result`);
            const data = res.data || null;
            if (data && data.reportingYear) {
                // Ensure the date is in YYYY-MM-DD format for the DatePicker
                data.reportingYear = data.reportingYear.split('T')[0];
            }
            return data;
        },
        enabled: !!parentId && !!endpoint,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.post(`${endpoint}/${parentId}/result`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-result', entityType, parentId] });
            queryClient.invalidateQueries({ queryKey: ['project-data', entityType] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => apiClient.put(`${endpoint}/${parentId}/result`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-result', entityType, parentId] });
            queryClient.invalidateQueries({ queryKey: ['project-data', entityType] });
        },
    });

    return {
        resultData,
        isLoading,
        error,
        saveResult: (data: any) => {
            if (resultData) {
                return updateMutation.mutateAsync(data);
            }
            return createMutation.mutateAsync(data);
        },
        isSaving: createMutation.isPending || updateMutation.isPending,
    };
}
