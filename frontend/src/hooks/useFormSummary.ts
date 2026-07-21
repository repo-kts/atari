import { useQuery } from '@tanstack/react-query'
import { formSummaryApi } from '../services/formSummaryApi'
import type { FormSummaryResponse } from '../types/formSummary'

export function useFormSummary(kvkId?: number, fromDate?: string, toDate?: string) {
    return useQuery<FormSummaryResponse>({
        queryKey: [
            'form-summary',
            kvkId ?? 'all',
            fromDate ?? 'open-start',
            toDate ?? 'open-end',
        ],
        queryFn: () => formSummaryApi.getSummary(kvkId, fromDate, toDate),
        // Summary values are aggregates of every form. Always refresh when the
        // page is opened so saves made through any form hook are reflected.
        staleTime: 0,
        refetchOnMount: 'always',
    })
}
