import { useQuery } from '@tanstack/react-query'
import { formSummaryApi } from '../services/formSummaryApi'
import type { FormSummaryResponse } from '../types/formSummary'

export function useFormSummary(kvkId?: number) {
    return useQuery<FormSummaryResponse>({
        queryKey: ['form-summary', kvkId ?? 'all'],
        queryFn: () => formSummaryApi.getSummary(kvkId),
        staleTime: 60_000,
    })
}
