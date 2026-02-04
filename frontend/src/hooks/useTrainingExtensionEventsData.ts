import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingExtensionEventsApi } from '../services/trainingExtensionEventsApi';
import type {
    TrainingTypeFormData,
    TrainingAreaFormData,
    TrainingThematicAreaFormData,
    ExtensionActivityFormData,
    OtherExtensionActivityFormData,
    EventFormData,
} from '../types/trainingExtensionEvents';

// ============================================
// Training Type Hooks
// ============================================

export function useTrainingTypes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['training-types'],
        queryFn: () => trainingExtensionEventsApi.getTrainingTypes().then((res) => res.data),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const createMutation = useMutation({
        mutationFn: (data: TrainingTypeFormData) => trainingExtensionEventsApi.createTrainingType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-types'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TrainingTypeFormData> }) =>
            trainingExtensionEventsApi.updateTrainingType(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-types'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => trainingExtensionEventsApi.deleteTrainingType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-types'] });
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
// Training Area Hooks
// ============================================

export function useTrainingAreas() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['training-areas'],
        queryFn: () => trainingExtensionEventsApi.getTrainingAreas().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: TrainingAreaFormData) => trainingExtensionEventsApi.createTrainingArea(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-areas'] });
            queryClient.invalidateQueries({ queryKey: ['training-types'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TrainingAreaFormData> }) =>
            trainingExtensionEventsApi.updateTrainingArea(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-areas'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => trainingExtensionEventsApi.deleteTrainingArea(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-areas'] });
            queryClient.invalidateQueries({ queryKey: ['training-types'] });
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
// Training Thematic Area Hooks
// ============================================

export function useTrainingThematicAreas() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['training-thematic-areas'],
        queryFn: () => trainingExtensionEventsApi.getTrainingThematicAreas().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: TrainingThematicAreaFormData) => trainingExtensionEventsApi.createTrainingThematicArea(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-thematic-areas'] });
            queryClient.invalidateQueries({ queryKey: ['training-areas'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TrainingThematicAreaFormData> }) =>
            trainingExtensionEventsApi.updateTrainingThematicArea(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-thematic-areas'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => trainingExtensionEventsApi.deleteTrainingThematicArea(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-thematic-areas'] });
            queryClient.invalidateQueries({ queryKey: ['training-areas'] });
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
// Extension Activity Hooks
// ============================================

export function useExtensionActivities() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['extension-activities'],
        queryFn: () => trainingExtensionEventsApi.getExtensionActivities().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ExtensionActivityFormData) => trainingExtensionEventsApi.createExtensionActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['extension-activities'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ExtensionActivityFormData> }) =>
            trainingExtensionEventsApi.updateExtensionActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['extension-activities'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => trainingExtensionEventsApi.deleteExtensionActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['extension-activities'] });
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
// Other Extension Activity Hooks
// ============================================

export function useOtherExtensionActivities() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['other-extension-activities'],
        queryFn: () => trainingExtensionEventsApi.getOtherExtensionActivities().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: OtherExtensionActivityFormData) => trainingExtensionEventsApi.createOtherExtensionActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['other-extension-activities'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<OtherExtensionActivityFormData> }) =>
            trainingExtensionEventsApi.updateOtherExtensionActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['other-extension-activities'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => trainingExtensionEventsApi.deleteOtherExtensionActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['other-extension-activities'] });
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
// Event Hooks
// ============================================

export function useEvents() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['events'],
        queryFn: () => trainingExtensionEventsApi.getEvents().then((res) => res.data),
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data: EventFormData) => trainingExtensionEventsApi.createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<EventFormData> }) =>
            trainingExtensionEventsApi.updateEvent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => trainingExtensionEventsApi.deleteEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
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
// Statistics Hook
// ============================================

export function useTrainingExtensionEventsStats() {
    return useQuery({
        queryKey: ['training-extension-events-stats'],
        queryFn: () => trainingExtensionEventsApi.getStats().then((res) => res.data),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
