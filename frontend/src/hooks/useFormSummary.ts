import { useQuery } from '@tanstack/react-query'
import { formSummaryApi } from '../services/formSummaryApi'
import type { FormSummaryResponse } from '../types/formSummary'

export function useFormSummary(kvkId?: number, year?: number) {
    return useQuery<FormSummaryResponse>({
        queryKey: ['form-summary', kvkId ?? 'all', year ?? 'all-years'],
        queryFn: () => formSummaryApi.getSummary(kvkId, year),
        // Summary values are aggregates of every form. Always refresh when the
        // page is opened so saves made through any form hook are reflected.
        staleTime: 0,
        refetchOnMount: 'always',
    })
}
