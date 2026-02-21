import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { otherMastersApi } from '../services/otherMastersApi';
import { invalidateEntityType } from '../utils/queryInvalidation';
import { ENTITY_TYPES } from '../constants/entityTypes';
import { useAuth } from '../contexts/AuthContext';
import type {
    SeasonFormData,
    SanctionedPostFormData,
    YearFormData,
    StaffCategoryFormData,
    PayLevelFormData,
    DisciplineFormData,
    ExtensionActivityTypeFormData,
    OtherExtensionActivityTypeFormData,
    ImportantDayFormData,
    TrainingClienteleFormData,
    FundingSourceFormData,
    CropTypeFormData,
    InfrastructureMasterFormData,
} from '../services/otherMastersApi';

// ============================================
// Season Hooks
// ============================================

export function useSeasons(options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();
    const { hasPermission } = useAuth();

    const enabled =
        options?.enabled !== undefined
            ? options.enabled
            : hasPermission('VIEW', 'all_masters_season_master');

    const query = useQuery({
        queryKey: ['seasons'],
        queryFn: () => otherMastersApi.getSeasons().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
        enabled,
    });

    const createMutation = useMutation({
        mutationFn: (data: SeasonFormData) => otherMastersApi.createSeason(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SEASON);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SeasonFormData> }) =>
            otherMastersApi.updateSeason(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SEASON);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteSeason(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SEASON);
        },
    });

    return {
        data: query.data || [],
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

// ============================================
// Sanctioned Post Hooks
// ============================================

export function useSanctionedPosts() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['sanctioned-posts'],
        queryFn: () => otherMastersApi.getSanctionedPosts().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: SanctionedPostFormData) => otherMastersApi.createSanctionedPost(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SANCTIONED_POST);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SanctionedPostFormData> }) =>
            otherMastersApi.updateSanctionedPost(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SANCTIONED_POST);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteSanctionedPost(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SANCTIONED_POST);
        },
    });

    return {
        data: query.data || [],
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

// ============================================
// Year Hooks
// ============================================

export function useYears() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['years'],
        queryFn: () => otherMastersApi.getYears().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: YearFormData) => otherMastersApi.createYear(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.YEAR);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<YearFormData> }) =>
            otherMastersApi.updateYear(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.YEAR);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteYear(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.YEAR);
        },
    });

    return {
        data: query.data || [],
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

// ============================================
// Employee Masters Hooks
// ============================================

export function useStaffCategories() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['staff-categories'],
        queryFn: () => otherMastersApi.getStaffCategories().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: StaffCategoryFormData) => otherMastersApi.createStaffCategory(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.STAFF_CATEGORY);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<StaffCategoryFormData> }) =>
            otherMastersApi.updateStaffCategory(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.STAFF_CATEGORY);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteStaffCategory(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.STAFF_CATEGORY);
        },
    });

    return {
        data: query.data || [],
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

export function usePayLevels() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['pay-levels'],
        queryFn: () => otherMastersApi.getPayLevels().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: PayLevelFormData) => otherMastersApi.createPayLevel(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PAY_LEVEL);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<PayLevelFormData> }) =>
            otherMastersApi.updatePayLevel(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PAY_LEVEL);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deletePayLevel(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PAY_LEVEL);
        },
    });

    return {
        data: query.data || [],
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

export function useDisciplines() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['disciplines'],
        queryFn: () => otherMastersApi.getDisciplines().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: DisciplineFormData) => otherMastersApi.createDiscipline(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.DISCIPLINE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<DisciplineFormData> }) =>
            otherMastersApi.updateDiscipline(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.DISCIPLINE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteDiscipline(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.DISCIPLINE);
        },
    });

    return {
        data: query.data || [],
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

// ============================================
// Extension Masters Hooks
// ============================================

export function useExtensionActivityTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['extension-activity-types'],
        queryFn: () => otherMastersApi.getExtensionActivityTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ExtensionActivityTypeFormData) => otherMastersApi.createExtensionActivityType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.EXTENSION_ACTIVITY_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ExtensionActivityTypeFormData> }) =>
            otherMastersApi.updateExtensionActivityType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.EXTENSION_ACTIVITY_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteExtensionActivityType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.EXTENSION_ACTIVITY_TYPE);
        },
    });

    return {
        data: query.data || [],
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

export function useOtherExtensionActivityTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['other-extension-activity-types'],
        queryFn: () => otherMastersApi.getOtherExtensionActivityTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: OtherExtensionActivityTypeFormData) => otherMastersApi.createOtherExtensionActivityType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.OTHER_EXTENSION_ACTIVITY_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<OtherExtensionActivityTypeFormData> }) =>
            otherMastersApi.updateOtherExtensionActivityType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.OTHER_EXTENSION_ACTIVITY_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteOtherExtensionActivityType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.OTHER_EXTENSION_ACTIVITY_TYPE);
        },
    });

    return {
        data: query.data || [],
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

export function useImportantDays() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['important-days'],
        queryFn: () => otherMastersApi.getImportantDays().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ImportantDayFormData) => otherMastersApi.createImportantDay(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.IMPORTANT_DAY);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ImportantDayFormData> }) =>
            otherMastersApi.updateImportantDay(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.IMPORTANT_DAY);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteImportantDay(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.IMPORTANT_DAY);
        },
    });

    return {
        data: query.data || [],
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

// ============================================
// Training Masters Hooks
// ============================================

export function useTrainingClientele() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['training-clientele'],
        queryFn: () => otherMastersApi.getTrainingClientele().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: TrainingClienteleFormData) => otherMastersApi.createTrainingClientele(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.TRAINING_CLIENTELE);
            queryClient.invalidateQueries({ queryKey: ['training-clientele'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TrainingClienteleFormData> }) =>
            otherMastersApi.updateTrainingClientele(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.TRAINING_CLIENTELE);
            queryClient.invalidateQueries({ queryKey: ['training-clientele'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteTrainingClientele(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.TRAINING_CLIENTELE);
            queryClient.invalidateQueries({ queryKey: ['training-clientele'] });
        },
    });

    return {
        data: query.data || [],
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

export function useFundingSources() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['funding-sources'],
        queryFn: () => otherMastersApi.getFundingSources().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: FundingSourceFormData) => otherMastersApi.createFundingSource(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.FUNDING_SOURCE);
            queryClient.invalidateQueries({ queryKey: ['funding-sources'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<FundingSourceFormData> }) =>
            otherMastersApi.updateFundingSource(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.FUNDING_SOURCE);
            queryClient.invalidateQueries({ queryKey: ['funding-sources'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteFundingSource(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.FUNDING_SOURCE);
            queryClient.invalidateQueries({ queryKey: ['funding-sources'] });
        },
    });

    return {
        data: query.data || [],
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

// ============================================
// Other Masters Hooks (continued)
// ============================================

export function useCropTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['crop-types'],
        queryFn: () => otherMastersApi.getCropTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: CropTypeFormData) => otherMastersApi.createCropType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.CROP_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CropTypeFormData> }) =>
            otherMastersApi.updateCropType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.CROP_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteCropType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.CROP_TYPE);
        },
    });

    return {
        data: query.data || [],
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

export function useInfrastructureMasters() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['infrastructure-masters'],
        queryFn: () => otherMastersApi.getInfrastructureMasters().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: InfrastructureMasterFormData) => otherMastersApi.createInfrastructureMaster(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.INFRASTRUCTURE_MASTER);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<InfrastructureMasterFormData> }) =>
            otherMastersApi.updateInfrastructureMaster(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.INFRASTRUCTURE_MASTER);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteInfrastructureMaster(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.INFRASTRUCTURE_MASTER);
        },
    });

    return {
        data: query.data || [],
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
