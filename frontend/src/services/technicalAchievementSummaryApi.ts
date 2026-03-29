import { apiClient, ApiError } from './api'

export interface KvkOption {
  kvkId: number
  kvkName: string
}

export interface TechnicalSummaryFilters {
  years: number[]
  defaultReportingYear: number
  kvks: KvkOption[]
  canFilterByKvk: boolean
}

export interface CasteBreakdown {
  m: number
  f: number
}

export interface TotalsBreakdown extends CasteBreakdown {
  t: number
}

export interface ParticipantAchievement {
  general: CasteBreakdown
  obc: CasteBreakdown
  sc: CasteBreakdown
  st: CasteBreakdown
  total: TotalsBreakdown
}

export interface TechnicalAchievementSummaryData {
  reportingYear: number
  kvkId: number | null
  sections: {
    oft: {
      target: number
      achievement: number
      noOfLocation: number
      noOfTrials: number
      farmers: {
        target: number
        achievement: ParticipantAchievement
      }
    }
    fld: {
      target: number
      achievement: number
      area: number
      farmers: {
        target: number
        achievement: ParticipantAchievement
      }
    }
    training: {
      target: number
      achievement: number
      participants: {
        target: number
        achievement: ParticipantAchievement
      }
    }
    extension: {
      target: number
      achievement: number
      participants: {
        target: number
        achievement: ParticipantAchievement
      }
    }
    seedProduction: {
      target: number
      quantity: number
      value: number
      participants: ParticipantAchievement
    }
    plantingMaterial: {
      target: number
      quantity: number
      value: number
      participants: ParticipantAchievement
    }
    livestock: {
      target: number
      quantity: number
      value: number
      participants: ParticipantAchievement
    }
    soilWater: {
      target: number
      achievement: number
      participants: ParticipantAchievement
    }
  }
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sp.append(key, String(value))
    }
  })
  const query = sp.toString()
  return query ? `?${query}` : ''
}

export const technicalAchievementSummaryApi = {
  getFilterOptions: async (): Promise<TechnicalSummaryFilters> => {
    try {
      return await apiClient.get<TechnicalSummaryFilters>('/admin/technical-achievement-summary/options')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to load summary filters')
      }
      throw error
    }
  },

  getSummary: async (params: { reportingYear: number; kvkId?: number }): Promise<TechnicalAchievementSummaryData> => {
    const query = buildQueryString({
      reportingYear: params.reportingYear,
      kvkId: params.kvkId,
    })

    try {
      return await apiClient.get<TechnicalAchievementSummaryData>(`/admin/technical-achievement-summary${query}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to load technical achievement summary')
      }
      throw error
    }
  },
}
