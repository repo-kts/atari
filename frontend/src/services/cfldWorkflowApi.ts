import { apiClient } from './api'

export const cfldWorkflowApi = {
    transferTechnicalToNextYear: (id: number | string) =>
        apiClient.post(`/forms/achievements/cfld-technical-parameters/${id}/transfer-next-year`),

    revokeTechnicalTransfer: (id: number | string) =>
        apiClient.post(`/forms/achievements/cfld-technical-parameters/${id}/revoke-transfer`),

    markTechnicalCompleted: (id: number | string) =>
        apiClient.post(`/forms/achievements/cfld-technical-parameters/${id}/mark-completed`),
}
