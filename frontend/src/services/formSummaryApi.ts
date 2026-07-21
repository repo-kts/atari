import { apiClient } from './api'
import type { FormSummaryResponse } from '../types/formSummary'

export const formSummaryApi = {
    getSummary: (
        kvkId?: number,
        fromDate?: string,
        toDate?: string,
    ): Promise<FormSummaryResponse> => {
        const params = new URLSearchParams()
        if (kvkId != null) params.set('kvkId', String(kvkId))
        if (fromDate) params.set('fromDate', fromDate)
        if (toDate) params.set('toDate', toDate)
        const qs = params.toString()
        return apiClient.get<FormSummaryResponse>(`/forms/summary${qs ? `?${qs}` : ''}`)
    },
}
