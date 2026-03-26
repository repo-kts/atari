import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { oftWorkflowApi, OftResultPayload } from '@/services/oftWorkflowApi'

export function useTransferOftToNextYear() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number | string) => oftWorkflowApi.transferToNextYear(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-data', 'achievement-oft'] })
        },
    })
}

export function useTransferFldToNextYear() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number | string) => oftWorkflowApi.transferFldToNextYear(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-data', 'achievement-fld'] })
        },
    })
}

export function useFldResult(fldId?: number | string) {
    return useQuery({
        queryKey: ['achievement-fld-result', fldId],
        queryFn: () => oftWorkflowApi.getFldResult(fldId as number | string),
        enabled: Boolean(fldId),
    })
}

export function useCreateFldResult() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: any }) =>
            oftWorkflowApi.createFldResult(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project-data', 'achievement-fld'] })
            queryClient.invalidateQueries({ queryKey: ['achievement-fld-result', variables.id] })
        },
    })
}

export function useUpdateFldResult() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: any }) =>
            oftWorkflowApi.updateFldResult(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project-data', 'achievement-fld'] })
            queryClient.invalidateQueries({ queryKey: ['achievement-fld-result', variables.id] })
        },
    })
}

export function useOftResult(oftId?: number | string) {
    return useQuery({
        queryKey: ['achievement-oft-result', oftId],
        queryFn: () => oftWorkflowApi.getResult(oftId as number | string),
        enabled: Boolean(oftId),
    })
}

export function useCreateOftResult() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: OftResultPayload }) =>
            oftWorkflowApi.createResult(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project-data', 'achievement-oft'] })
            queryClient.invalidateQueries({ queryKey: ['achievement-oft-result', variables.id] })
        },
    })
}

export function useUpdateOftResult() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: OftResultPayload }) =>
            oftWorkflowApi.updateResult(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project-data', 'achievement-oft'] })
            queryClient.invalidateQueries({ queryKey: ['achievement-oft-result', variables.id] })
        },
    })
}
