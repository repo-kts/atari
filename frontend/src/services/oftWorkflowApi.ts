import { apiClient } from './api'

export interface OftResultPayload {
    finalRecommendation: string
    constraintsFeedback: string
    farmersParticipationProcess: string
    resultText: string
    remark: string
    tables: any[]
}

export const oftWorkflowApi = {
    transferToNextYear: async (id: number | string) => {
        return apiClient.post(`/forms/achievements/oft/${id}/transfer-next-year`)
    },

    getResult: async (id: number | string) => {
        return apiClient.get(`/forms/achievements/oft/${id}/result`)
    },

    createResult: async (id: number | string, payload: OftResultPayload) => {
        return apiClient.post(`/forms/achievements/oft/${id}/result`, payload)
    },

    updateResult: async (id: number | string, payload: OftResultPayload) => {
        return apiClient.put(`/forms/achievements/oft/${id}/result`, payload)
    },

    transferFldToNextYear: async (id: number | string) => {
        return apiClient.post(`/forms/achievements/fld/${id}/transfer-next-year`)
    },

    getFldResult: async (id: number | string) => {
        return apiClient.get(`/forms/achievements/fld/${id}/result`)
    },

    createFldResult: async (id: number | string, payload: any) => {
        return apiClient.post(`/forms/achievements/fld/${id}/result`, payload)
    },

    updateFldResult: async (id: number | string, payload: any) => {
        return apiClient.put(`/forms/achievements/fld/${id}/result`, payload)
    },
}
