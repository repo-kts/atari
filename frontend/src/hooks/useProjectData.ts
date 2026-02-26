import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

const EMPTY_ARRAY: any[] = [];

/**
 * Generic hook for project data when specific hooks are not yet implemented.
 * This allows the DataManagementView to render even if data is empty.
 */
export function useProjectData(entityType: string) {
    const queryClient = useQueryClient();
    // Map entity types to their specific backend endpoints
    const endpointMap: Record<string, string> = {
        'achievement-award-kvk': '/forms/achievements/kvk-awards',
        'achievement-award-scientist': '/forms/achievements/scientist-awards',
        'achievement-award-farmer': '/forms/achievements/farmer-awards',
        'achievement-extension': '/forms/achievements/extension-activities',
        'achievement-other-extension': '/forms/achievements/other-extension-activities',
        'achievement-technology-week': '/forms/achievements/technology-week',
        'achievement-celebration-days': '/forms/achievements/celebration-days',
        'project-cfld-technical-param': '/forms/achievements/cfld-technical-parameters',
        'project-cfld-extension-activity': '/forms/achievements/cfld-extension-activities',
        'project-cfld-budget': '/forms/achievements/cfld-budget-utilizations',
        'achievement-soil-equipment': '/forms/achievements/soil-water/equipments',
        'achievement-soil-analysis': '/forms/achievements/soil-water/analysis',
        'achievement-world-soil-day': '/forms/achievements/soil-water/world-soil-day',
        'achievement-hrd': '/forms/achievements/hrd',
        'project-fpo-details': '/forms/achievements/projects/fpo/details',
        'project-fpo-management': '/forms/achievements/projects/fpo/management',
        'project-seed-hub': '/forms/achievements/projects/seed-hub',
    };

    const endpoint = endpointMap[entityType] || `/forms/achievements/${entityType}s`;

    const query = useQuery({
        queryKey: ['project-data', entityType],
        queryFn: async () => {
            try {
                const res = await apiClient.get<any>(endpoint);
                return res.data || EMPTY_ARRAY;
            } catch (err) {
                console.warn(`No API for ${entityType}, returning empty array`);
                return EMPTY_ARRAY;
            }
        },
        retry: false,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.post(endpoint, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-data', entityType] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            apiClient.patch(`${endpoint}/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-data', entityType] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiClient.delete(`${endpoint}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-data', entityType] });
        },
    });

    return {
        data: query.data || EMPTY_ARRAY,
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
