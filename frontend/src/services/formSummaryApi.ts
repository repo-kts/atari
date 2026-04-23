import { apiClient } from './api'
import type { FormSummaryResponse } from '../types/formSummary'

export const formSummaryApi = {
    getSummary: (kvkId?: number): Promise<FormSummaryResponse> => {
        const qs = kvkId != null ? `?kvkId=${kvkId}` : ''
        return apiClient.get<FormSummaryResponse>(`/forms/summary${qs}`)
    },
}
