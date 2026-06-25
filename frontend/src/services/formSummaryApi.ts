import { apiClient } from './api'
import type { FormSummaryResponse } from '../types/formSummary'

export const formSummaryApi = {
    // `year` = calendar year (e.g. 2024); omit for all years. Sent as `summaryYear`
    // so the reportingYear normalizer middleware doesn't treat it as a date.
    getSummary: (kvkId?: number, year?: number): Promise<FormSummaryResponse> => {
        const params = new URLSearchParams()
        if (kvkId != null) params.set('kvkId', String(kvkId))
        if (year != null) params.set('summaryYear', String(year))
        const qs = params.toString()
        return apiClient.get<FormSummaryResponse>(`/forms/summary${qs ? `?${qs}` : ''}`)
    },
}
