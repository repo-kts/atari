import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { awardApi } from '../../services/awardApi';
import { ENTITY_TYPES } from '../../constants/entityTypes';
import { ExtendedEntityType } from '../../utils/masterUtils';

export function useAwardData(entityType: ExtendedEntityType) {
    const queryClient = useQueryClient();

    // Query Key based on entity type
    const queryKey = [entityType];

    // Fetch Data
    const { data: response, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK) {
                const res = await awardApi.getKvkAwards();
                return res.data; // This is the array
            }
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST) {
                const res = await awardApi.getScientistAwards();
                return res.data;
            }
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER) {
                const res = await awardApi.getFarmerAwards();
                return res.data;
            }
            return []; // Fallback as array
        },
        enabled: !!entityType,
    });

    const data = response || [];

    // Mutations
    const createMutation = useMutation({
        mutationFn: (newData: any) => {
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK) {
                return awardApi.createKvkAward(newData);
            }
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST) {
                return awardApi.createScientistAward(newData);
            }
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER) {
                return awardApi.createFarmerAward(newData);
            }
            throw new Error('Unknown award type');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => {
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK) {
                return awardApi.updateKvkAward(id, data);
            }
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST) {
                return awardApi.updateScientistAward(id, data);
            }
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER) {
                return awardApi.updateFarmerAward(id, data);
            }
            throw new Error('Unknown award type');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => {
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK) {
                return awardApi.deleteKvkAward(id);
            }
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST) {
                return awardApi.deleteScientistAward(id);
            }
            if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER) {
                return awardApi.deleteFarmerAward(id);
            }
            throw new Error('Unknown award type');
        },
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
