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
        'project-tsp-scsp': '/forms/achievements/projects/sub-plan-activity',
        'project-agri-drone': '/forms/achievements/projects/agri-drone',
        'project-agri-drone-demo': '/forms/achievements/projects/agri-drone/demonstrations',
        'project-drmr-details': '/forms/achievements/projects/drmr/details',
        'project-drmr-activity': '/forms/achievements/projects/drmr/activity',
        'project-nicra-basic': '/forms/achievements/projects/nicra/basic',
        'project-nicra-details': '/forms/achievements/projects/nicra/details',
        'project-nicra-training': '/forms/achievements/projects/nicra/training',
        'project-nicra-extension': '/forms/achievements/projects/nicra/extension',
        'project-nicra-intervention': '/forms/achievements/projects/nicra/intervention',
        'project-nicra-revenue': '/forms/achievements/projects/nicra/revenue',
        'project-nicra-custom-hiring': '/forms/achievements/projects/nicra/farm-implement',
        'project-nicra-vcrmc': '/forms/achievements/projects/nicra/vcrmc',
        'project-nicra-soil-health': '/forms/achievements/projects/nicra/soil-health',
        'project-nicra-convergence': '/forms/achievements/projects/nicra/convergence',
        'project-nicra-dignitaries': '/forms/achievements/projects/nicra/dignitaries',
        'project-nicra-pi-copi': '/forms/achievements/projects/nicra/pi-copi',
        'project-cra-details': '/forms/achievements/projects/cra/details',
        'project-cra-extension-activity': '/forms/achievements/projects/cra/extension',
        // NARI
        'project-nari-nutri-garden': '/forms/achievements/projects/nari/nutritional-garden',
        'project-nari-bio-fortified': '/forms/achievements/projects/nari/bio-fortified-crop',
        'project-nari-value-addition': '/forms/achievements/projects/nari/value-addition',
        'project-nari-training': '/forms/achievements/projects/nari/training-programme',
        'project-nari-extension': '/forms/achievements/projects/nari/extension-activity',
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
        'performance-impact-kvk-activities': '/forms/performance/impact/kvk-activities',
        'performance-impact-entrepreneurship': '/forms/performance/impact/entrepreneurship',
        'performance-impact-success-stories': '/forms/performance/impact/success-stories',
        'performance-demonstration-units': '/forms/performance/infrastructure/demonstration-units',
        'performance-instructional-farm-crops': '/forms/performance/infrastructure/instructional-farm-crops',
        'performance-production-units': '/forms/performance/infrastructure/production-units',
        'performance-instructional-farm-livestock': '/forms/performance/infrastructure/instructional-farm-livestock',
        'performance-hostel': '/forms/performance/infrastructure/hostel',
        'performance-staff-quarters': '/forms/performance/infrastructure/staff-quarters',
        'performance-rainwater-harvesting': '/forms/performance/infrastructure/rainwater-harvesting',
        'performance-functional-linkage': '/forms/performance/linkages/functional-linkages',
        'performance-special-programmes': '/forms/performance/linkages/special-programmes',
        'performance-operational-area': '/forms/performance/district-village/operational-areas',
        'performance-village-adoption': '/forms/performance/district-village/village-adoptions',
        'performance-priority-thrust': '/forms/performance/district-village/priority-thrust-areas',
        'performance-budget-details': '/forms/performance/financial/budget-details',
        'performance-revolving-fund': '/forms/performance/financial/revolving-fund',
        'performance-revenue-generation': '/forms/performance/financial/revenue-generation',
        'performance-resource-generation': '/forms/performance/financial/resource-generation',
        // Digital Information
        'misc-digital-mobile-app': '/forms/achievements/digital-information/mobile-app',
        'misc-digital-web-portal': '/forms/achievements/digital-information/web-portal',
        'misc-digital-kisan-sarathi': '/forms/achievements/digital-information/kisan-sarathi',
        'misc-digital-kisan-mobile-advisory': '/forms/achievements/digital-information/kmas',
        'misc-digital-other-channels': '/forms/achievements/digital-information/msg-details',
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
            apiClient.put(`${endpoint}/${id}`, data),
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
