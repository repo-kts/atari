import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { ROUTE_PATHS } from '../constants/routePaths';

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
        'achievement-production-supply': '/forms/achievements/production-supply',
        'achievement-publication-details': '/forms/achievements/publication-details',
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
        'project-arya-current': '/forms/achievements/projects/arya/current',
        'project-arya-evaluation': '/forms/achievements/projects/arya/previous',
        'project-csisa': '/forms/achievements/projects/csisa',
        'project-agri-drone': '/forms/achievements/projects/agri-drone',
        'project-agri-drone-demo': '/forms/achievements/projects/agri-drone',
        'project-drmr-details': '/forms/achievements/projects/drmr/details',
        'project-nicra-basic': '/forms/achievements/projects/nicra/basic',
        'project-nicra-details': '/forms/achievements/projects/nicra/details',
        'project-nicra-training': '/forms/achievements/projects/nicra/training',
        'project-nicra-extension': '/forms/achievements/projects/nicra/extension',
        'project-cra-details': '/forms/achievements/projects/cra/details',
        'project-cra-extension-activity': '/forms/achievements/projects/cra/extension',
        // Natural Farming
        'project-natural-farming-geo': '/forms/achievements/projects/natural-farming/geographical',
        'project-natural-farming-physical': '/forms/achievements/projects/natural-farming/physical',
        'project-natural-farming-demo': '/forms/achievements/projects/natural-farming/demonstration',
        'project-natural-farming-farmers': '/forms/achievements/projects/natural-farming/farmers',
        'project-natural-farming-beneficiaries': '/forms/achievements/projects/natural-farming/beneficiaries',
        'project-natural-farming-soil': '/forms/achievements/projects/natural-farming/soil',
        'project-natural-farming-budget': '/forms/achievements/projects/natural-farming/budget',
        'project-other': '/forms/achievements/other-program',
        'achievement-oft': ROUTE_PATHS.ACHIEVEMENTS.OFT,
        'achievement-fld': ROUTE_PATHS.ACHIEVEMENTS.FLD.BASE,
        'achievement-fld-extension-training': ROUTE_PATHS.ACHIEVEMENTS.FLD.EXTENSION_TRAINING,
        'achievement-fld-technical-feedback': ROUTE_PATHS.ACHIEVEMENTS.FLD.TECHNICAL_FEEDBACK,
        'achievement-training': ROUTE_PATHS.ACHIEVEMENTS.TRAININGS,
        // Miscellaneous
        'misc-prevalent-diseases-crops': '/forms/miscellaneous/prevalent-diseases/crops',
        'misc-prevalent-diseases-livestock': '/forms/miscellaneous/prevalent-diseases/livestock',
        'misc-nyk-training': '/forms/miscellaneous/nyk-training',
        'misc-ppv-fra-training': '/forms/miscellaneous/ppv-fra/training',
        'misc-ppv-fra-plant-varieties': '/forms/miscellaneous/ppv-fra/plant-varieties',
        'misc-rawe-fet': '/forms/miscellaneous/rawe-fet',
        'misc-vip-visitors': '/forms/miscellaneous/vip-visitors',
        'misc-swachhta-sewa': '/forms/miscellaneous/swachhta-bharat/sewa',
        'misc-swachhta-pakhwada': '/forms/miscellaneous/swachhta-bharat/pakhwada',
        'misc-swachhta-budget': '/forms/miscellaneous/swachhta-bharat/budget',
        'misc-meetings-sac': '/forms/miscellaneous/meetings/sac',
        'misc-meetings-other': '/forms/miscellaneous/meetings/other',
    };

    const endpoint = endpointMap[entityType] || `/forms/achievements/${entityType}s`;

    const query = useQuery({
        queryKey: ['project-data', entityType],
        queryFn: async () => {
            try {
                const res = await apiClient.get<any>(endpoint);
                // Handle both { success: true, data: [...] } and direct array responses
                const data = res?.data || (Array.isArray(res) ? res : null);
                return data || EMPTY_ARRAY;
            } catch (err) {
                console.warn(`No API or error for ${entityType}, returning empty array:`, err);
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
        mutationFn: ({ id, data }: { id: number | string; data: any }) =>
            apiClient.patch(`${endpoint}/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-data', entityType] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number | string) => apiClient.delete(`${endpoint}/${id}`),
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
