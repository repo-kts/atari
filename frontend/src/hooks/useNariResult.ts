import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_TYPES } from '@/constants/entityConstants';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { apiClient } from '../services/api';

const NARI_FORM_API = ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.FORM_API;

/**
 * Hook for managing NARI results across different modules
 */
export function useNariResult(entityType: string, parentId: number | string | null) {
    const queryClient = useQueryClient();

    const endpointMap: Record<string, string> = {
        [ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN]: NARI_FORM_API.NUTRITIONAL_GARDEN,
        [ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED]: NARI_FORM_API.BIO_FORTIFIED_CROP,
        [ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION]: NARI_FORM_API.VALUE_ADDITION,
    };

    const endpoint = endpointMap[entityType];

    const { data: resultData, isLoading, error } = useQuery({
        queryKey: ['nari-result', entityType, parentId],
        queryFn: async () => {
            if (!parentId || !endpoint) return null;
            const res = await apiClient.get<any>(`${endpoint}/${parentId}/result`);
            // Backend uses { success, data }; fall back to raw body if already unwrapped
            const data =
                res && typeof res === 'object' && res !== null && 'data' in res && 'success' in res
                    ? res.data
                    : res ?? null;
            if (data && typeof data === 'object' && data !== null && (data as any).reportingYear) {
                const ry = (data as any).reportingYear;
                if (typeof ry === 'string') {
                    (data as any).reportingYear = ry.split('T')[0];
                }
            }
            return data as any;
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
            // resultData is undefined while the GET is in flight; null means no result row yet
            if (resultData === undefined) {
                return Promise.reject(
                    new Error('Result is still loading. Please wait and try again.'),
                );
            }
            if (resultData !== null) {
                return updateMutation.mutateAsync(data);
            }
            return createMutation.mutateAsync(data);
        },
        isSaving: createMutation.isPending || updateMutation.isPending,
    };
}
