import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cfldWorkflowApi } from '../services/cfldWorkflowApi'

export function useTransferCfldTechnicalToNextYear() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number | string) => cfldWorkflowApi.transferTechnicalToNextYear(id),
        onSuccess: () => {
            // Refresh CFLD technical parameter list
            queryClient.invalidateQueries({ queryKey: ['cfld-technical-parameters'] })
        },
    })
}

export function useRevokeCfldTechnicalTransfer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number | string) => cfldWorkflowApi.revokeTechnicalTransfer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cfld-technical-parameters'] })
        },
    })
}

export function useMarkCfldTechnicalCompleted() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number | string) => cfldWorkflowApi.markTechnicalCompleted(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cfld-technical-parameters'] })
        },
    })
}
