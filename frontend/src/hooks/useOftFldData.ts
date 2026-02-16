import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { oftFldApi } from '../services/oftFldApi';
import { invalidateOftFldEntity, invalidateQueriesWithRefetch } from '../utils/queryInvalidation';
import { ENTITY_TYPES } from '../constants/entityTypes';
import type {
    OftSubjectFormData,
    OftThematicAreaFormData,
    SectorFormData,
    FldThematicAreaFormData,
    FldCategoryFormData,
    FldSubcategoryFormData,
    FldCropFormData,
    CfldCropFormData,
} from '../types/oftFld';

// ============================================
// OFT Subject Hooks
// ============================================

export function useOftSubjects() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['oft-subjects'],
        queryFn: () => oftFldApi.getOftSubjects().then((res) => res.data),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const createMutation = useMutation({
        mutationFn: (data: OftSubjectFormData) => oftFldApi.createOftSubject(data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.OFT_SUBJECTS);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<OftSubjectFormData> }) =>
            oftFldApi.updateOftSubject(id, data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.OFT_SUBJECTS);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteOftSubject(id),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.OFT_SUBJECTS);
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
// OFT Thematic Area Hooks
// ============================================

export function useOftThematicAreas() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['oft-thematic-areas'],
        queryFn: () => oftFldApi.getOftThematicAreas().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: OftThematicAreaFormData) => oftFldApi.createOftThematicArea(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['oft-thematic-areas'] });
            queryClient.invalidateQueries({ queryKey: ['oft-subjects'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<OftThematicAreaFormData> }) =>
            oftFldApi.updateOftThematicArea(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['oft-thematic-areas'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteOftThematicArea(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['oft-thematic-areas'] });
            queryClient.invalidateQueries({ queryKey: ['oft-subjects'] });
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
// FLD Sector Hooks
// ============================================

export function useSectors() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['fld-sectors'],
        queryFn: () => oftFldApi.getSectors().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: SectorFormData) => oftFldApi.createSector(data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SECTORS);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SectorFormData> }) =>
            oftFldApi.updateSector(id, data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SECTORS);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteSector(id),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SECTORS);
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
// FLD Thematic Area Hooks
// ============================================

export function useFldThematicAreas() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['fld-thematic-areas'],
        queryFn: () => oftFldApi.getFldThematicAreas().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: FldThematicAreaFormData) => oftFldApi.createFldThematicArea(data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_THEMATIC_AREAS);
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SECTORS);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<FldThematicAreaFormData> }) =>
            oftFldApi.updateFldThematicArea(id, data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_THEMATIC_AREAS);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteFldThematicArea(id),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_THEMATIC_AREAS);
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SECTORS);
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
// FLD Category Hooks
// ============================================

export function useFldCategories() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['fld-categories'],
        queryFn: () => oftFldApi.getFldCategories().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: FldCategoryFormData) => oftFldApi.createFldCategory(data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_CATEGORIES);
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SECTORS);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<FldCategoryFormData> }) =>
            oftFldApi.updateFldCategory(id, data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_CATEGORIES);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteFldCategory(id),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_CATEGORIES);
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SECTORS);
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
// FLD Subcategory Hooks
// ============================================

export function useFldSubcategories() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['fld-subcategories'],
        queryFn: () => oftFldApi.getFldSubcategories().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: FldSubcategoryFormData) => oftFldApi.createFldSubcategory(data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SUBCATEGORIES);
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_CATEGORIES);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<FldSubcategoryFormData> }) =>
            oftFldApi.updateFldSubcategory(id, data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SUBCATEGORIES);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteFldSubcategory(id),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SUBCATEGORIES);
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_CATEGORIES);
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
// FLD Crop Hooks
// ============================================

export function useFldCrops() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['fld-crops'],
        queryFn: () => oftFldApi.getFldCrops().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: FldCropFormData) => oftFldApi.createFldCrop(data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_CROPS);
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SUBCATEGORIES);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<FldCropFormData> }) =>
            oftFldApi.updateFldCrop(id, data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_CROPS);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteFldCrop(id),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_CROPS);
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.FLD_SUBCATEGORIES);
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
// Season Hooks
// ============================================

export function useSeasons() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['seasons'],
        queryFn: () => oftFldApi.getSeasons().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => oftFldApi.createSeason(data),
        onSuccess: () => {
            invalidateQueriesWithRefetch(queryClient, ['seasons']);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            oftFldApi.updateSeason(id, data),
        onSuccess: () => {
            invalidateQueriesWithRefetch(queryClient, ['seasons']);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteSeason(id),
        onSuccess: () => {
            invalidateQueriesWithRefetch(queryClient, ['seasons']);
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
// CropType Hooks
// ============================================

export function useCropTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['crop-types'],
        queryFn: () => oftFldApi.getCropTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => oftFldApi.createCropType(data),
        onSuccess: () => {
            invalidateQueriesWithRefetch(queryClient, ['crop-types']);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            oftFldApi.updateCropType(id, data),
        onSuccess: () => {
            invalidateQueriesWithRefetch(queryClient, ['crop-types']);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteCropType(id),
        onSuccess: () => {
            invalidateQueriesWithRefetch(queryClient, ['crop-types']);
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
// CFLD Crop Hooks
// ============================================

export function useCfldCrops() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['cfld-crops'],
        queryFn: () => oftFldApi.getCfldCrops().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: CfldCropFormData) => oftFldApi.createCfldCrop(data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.CFLD_CROPS);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CfldCropFormData> }) =>
            oftFldApi.updateCfldCrop(id, data),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.CFLD_CROPS);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => oftFldApi.deleteCfldCrop(id),
        onSuccess: () => {
            invalidateOftFldEntity(queryClient, ENTITY_TYPES.CFLD_CROPS);
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

export function useCfldCropsBySeasonAndType(seasonId: number | null, typeId: number | null) {
    return useQuery({
        queryKey: ['cfld-crops', seasonId, typeId],
        queryFn: () => oftFldApi.getCfldCropsBySeasonAndType(seasonId!, typeId!).then((res) => res.data),
        enabled: !!seasonId && !!typeId,
        staleTime: 5 * 60 * 1000,
    });
}

// ============================================
// Statistics Hook
// ============================================

export function useOftFldStats() {
    return useQuery({
        queryKey: ['oft-fld-stats'],
        queryFn: () => oftFldApi.getStats().then((res) => res.data),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
