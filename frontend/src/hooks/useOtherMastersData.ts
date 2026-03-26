import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { otherMastersApi } from '../services/otherMastersApi';
import { invalidateEntityType } from '../utils/queryInvalidation';
import { ENTITY_TYPES } from '../constants/entityConstants';
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
    SoilWaterAnalysisFormData,
    NariCropCategoryFormData,
    NariActivityFormData,
    NariNutritionGardenTypeFormData,
    NicraCategoryFormData,
    NicraSubCategoryFormData,
    NicraSeedBankFodderBankFormData,
    NicraDignitaryTypeFormData,
    NicraPiTypeFormData,
    ImpactSpecificAreaFormData,
    EnterpriseTypeFormData,
    AccountTypeFormData,
    ProgrammeTypeFormData,
    PpvFraTrainingTypeFormData,
    DignitaryTypeFormData,
} from '../services/otherMastersApi';

// ============================================
// Season Hooks
// ============================================

export function useSeasons(options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const enabled = options?.enabled !== undefined ? options.enabled : true;

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

// CFLD-specific extension activity types (from extension_activity table, not fld_activity)
export function useCfldExtensionActivityTypes() {
    const query = useQuery({
        queryKey: ['cfld-extension-activity-types'],
        queryFn: async () => {
            const { apiClient } = await import('../services/api');
            const res = await apiClient.get('/forms/achievements/cfld-extension-activities/activity-types') as any;
            return res.data || [];
        },
        staleTime: 10 * 60 * 1000,
    });
    return {
        data: (query.data || []) as Array<{ extensionActivityId: number; extensionName: string }>,
        isLoading: query.isLoading,
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

export function useSoilWaterAnalyses() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['soil-water-analyses'],
        queryFn: () => otherMastersApi.getSoilWaterAnalyses().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: SoilWaterAnalysisFormData) => otherMastersApi.createSoilWaterAnalysis(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SOIL_WATER_ANALYSIS);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SoilWaterAnalysisFormData> }) =>
            otherMastersApi.updateSoilWaterAnalysis(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SOIL_WATER_ANALYSIS);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteSoilWaterAnalysis(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.SOIL_WATER_ANALYSIS);
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
// NARI Masters Hooks
// ============================================

export function useNariCropCategories() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nari-crop-categories'],
        queryFn: () => otherMastersApi.getNariCropCategories().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: NariCropCategoryFormData) => otherMastersApi.createNariCropCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-crop-categories'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NariCropCategoryFormData> }) =>
            otherMastersApi.updateNariCropCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-crop-categories'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteNariCropCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-crop-categories'] });
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

export function useNariActivities() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nari-activities'],
        queryFn: () => otherMastersApi.getNariActivities().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: NariActivityFormData) => otherMastersApi.createNariActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-activities'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NariActivityFormData> }) =>
            otherMastersApi.updateNariActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-activities'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteNariActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-activities'] });
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

export function useNariNutritionGardenTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nari-nutrition-garden-types'],
        queryFn: () => otherMastersApi.getNariNutritionGardenTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: NariNutritionGardenTypeFormData) => otherMastersApi.createNariNutritionGardenType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-nutrition-garden-types'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NariNutritionGardenTypeFormData> }) =>
            otherMastersApi.updateNariNutritionGardenType(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-nutrition-garden-types'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteNariNutritionGardenType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nari-nutrition-garden-types'] });
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

export function useNicraCategories() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nicra-categories'],
        queryFn: () => otherMastersApi.getNicraCategories().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: NicraCategoryFormData) => otherMastersApi.createNicraCategory(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_CATEGORY);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NicraCategoryFormData> }) =>
            otherMastersApi.updateNicraCategory(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_CATEGORY);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteNicraCategory(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_CATEGORY);
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_SUB_CATEGORY);
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

export function useNicraSubCategories() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nicra-sub-categories'],
        queryFn: () => otherMastersApi.getNicraSubCategories().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: NicraSubCategoryFormData) => otherMastersApi.createNicraSubCategory(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_SUB_CATEGORY);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NicraSubCategoryFormData> }) =>
            otherMastersApi.updateNicraSubCategory(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_SUB_CATEGORY);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteNicraSubCategory(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_SUB_CATEGORY);
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

export function useNicraSeedBankFodderBanks() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nicra-seed-bank-fodder-banks'],
        queryFn: () => otherMastersApi.getNicraSeedBankFodderBanks().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: NicraSeedBankFodderBankFormData) => otherMastersApi.createNicraSeedBankFodderBank(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_SEED_BANK_FODDER_BANK);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NicraSeedBankFodderBankFormData> }) =>
            otherMastersApi.updateNicraSeedBankFodderBank(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_SEED_BANK_FODDER_BANK);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteNicraSeedBankFodderBank(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_SEED_BANK_FODDER_BANK);
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

export function useNicraDignitaryTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nicra-dignitary-types'],
        queryFn: () => otherMastersApi.getNicraDignitaryTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: NicraDignitaryTypeFormData) => otherMastersApi.createNicraDignitaryType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_DIGNITARY_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NicraDignitaryTypeFormData> }) =>
            otherMastersApi.updateNicraDignitaryType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_DIGNITARY_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteNicraDignitaryType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_DIGNITARY_TYPE);
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

export function useNicraPiTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nicra-pi-types'],
        queryFn: () => otherMastersApi.getNicraPiTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: NicraPiTypeFormData) => otherMastersApi.createNicraPiType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_PI_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NicraPiTypeFormData> }) =>
            otherMastersApi.updateNicraPiType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_PI_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteNicraPiType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.NICRA_PI_TYPE);
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
// Impact Specific Area Hooks
// ============================================

export function useImpactSpecificAreas() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['impact-specific-areas'],
        queryFn: () => otherMastersApi.getImpactSpecificAreas().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ImpactSpecificAreaFormData) => otherMastersApi.createImpactSpecificArea(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.IMPACT_SPECIFIC_AREA);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ImpactSpecificAreaFormData> }) =>
            otherMastersApi.updateImpactSpecificArea(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.IMPACT_SPECIFIC_AREA);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteImpactSpecificArea(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.IMPACT_SPECIFIC_AREA);
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
// Enterprise Type Hooks
// ============================================

export function useEnterpriseTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['enterprise-types'],
        queryFn: () => otherMastersApi.getEnterpriseTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: EnterpriseTypeFormData) => otherMastersApi.createEnterpriseType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ENTERPRISE_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<EnterpriseTypeFormData> }) =>
            otherMastersApi.updateEnterpriseType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ENTERPRISE_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteEnterpriseType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ENTERPRISE_TYPE);
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

export function useAccountTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['account-types'],
        queryFn: () => otherMastersApi.getAccountTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: AccountTypeFormData) => otherMastersApi.createAccountType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ACCOUNT_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<AccountTypeFormData> }) =>
            otherMastersApi.updateAccountType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ACCOUNT_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteAccountType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.ACCOUNT_TYPE);
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

export function useProgrammeTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['programme-types'],
        queryFn: () => otherMastersApi.getProgrammeTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ProgrammeTypeFormData) => otherMastersApi.createProgrammeType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PROGRAMME_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ProgrammeTypeFormData> }) =>
            otherMastersApi.updateProgrammeType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PROGRAMME_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteProgrammeType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PROGRAMME_TYPE);
        },
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

export function usePpvFraTrainingTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['ppv-fra-training-types'],
        queryFn: () => otherMastersApi.getPpvFraTrainingTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: PpvFraTrainingTypeFormData) =>
            otherMastersApi.createPpvFraTrainingType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PPV_FRA_TRAINING_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<PpvFraTrainingTypeFormData> }) =>
            otherMastersApi.updatePpvFraTrainingType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PPV_FRA_TRAINING_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deletePpvFraTrainingType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.PPV_FRA_TRAINING_TYPE);
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

export function useDignitaryTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['dignitary-types'],
        queryFn: () => otherMastersApi.getDignitaryTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: DignitaryTypeFormData) =>
            otherMastersApi.createDignitaryType(data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.DIGNITARY_TYPE);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<DignitaryTypeFormData> }) =>
            otherMastersApi.updateDignitaryType(id, data),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.DIGNITARY_TYPE);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => otherMastersApi.deleteDignitaryType(id),
        onSuccess: () => {
            invalidateEntityType(queryClient, ENTITY_TYPES.DIGNITARY_TYPE);
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
