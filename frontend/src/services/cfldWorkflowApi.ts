import { apiClient } from './api'

export const cfldWorkflowApi = {
    transferTechnicalToNextYear: (id: number | string) =>
        apiClient.post(`/forms/achievements/cfld-technical-parameters/${id}/transfer-next-year`),
}

