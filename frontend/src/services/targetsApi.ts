import { apiClient, ApiError } from './api'

export interface TargetTypeOption {
  typeName: string
  hasFarmerTarget: boolean
  isCfld: boolean
}

export interface TargetKvkOption {
  kvkId: number
  kvkName: string
}

export interface TargetRow {
  targetId: number
  kvkId: number
  kvkName: string
  reportingYear: number
  typeName: string
  target: number
  farmerTarget: number | null
  season: string | null
  cropName: string | null
  areaTarget: number | null
  createdBy: {
    userId: number
    name: string
    email: string
  } | null
  createdAt: string
}

export interface TargetListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TargetListResponse {
  data: TargetRow[]
  meta: TargetListMeta
}

export interface TargetFilters {
  page?: number
  limit?: number
  reportingYear?: number
  kvkId?: number
  typeName?: string
  search?: string
}

export interface CreateTargetPayload {
  kvkId?: number
  reportingYear: number
  typeName: string
  target: number
  farmerTarget?: number | null
  season?: string | null
  cropName?: string | null
  areaTarget?: number | null
}

export interface UpdateTargetPayload extends CreateTargetPayload {}

function buildQueryString(params?: Record<string, string | number | undefined>): string {
  if (!params) return ''

  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sp.append(key, String(value))
    }
  })
  const query = sp.toString()
  return query ? `?${query}` : ''
}

export const targetsApi = {
  list: async (filters: TargetFilters = {}): Promise<TargetListResponse> => {
    try {
      const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        reportingYear: filters.reportingYear,
        kvkId: filters.kvkId,
        typeName: filters.typeName,
        search: filters.search,
      })
      return await apiClient.get<TargetListResponse>(`/admin/targets${query}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch targets')
      }
      throw error
    }
  },

  listTypes: async (): Promise<TargetTypeOption[]> => {
    try {
      return await apiClient.get<TargetTypeOption[]>('/admin/targets/types')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch target types')
      }
      throw error
    }
  },

  listKvks: async (): Promise<TargetKvkOption[]> => {
    try {
      return await apiClient.get<TargetKvkOption[]>('/admin/targets/kvks')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch KVK options')
      }
      throw error
    }
  },

  create: async (payload: CreateTargetPayload) => {
    try {
      return await apiClient.post('/admin/targets', payload)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to create target')
      }
      throw error
    }
  },

  update: async (targetId: number, payload: UpdateTargetPayload) => {
    try {
      return await apiClient.put(`/admin/targets/${targetId}`, payload)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to update target')
      }
      throw error
    }
  },

  remove: async (targetId: number) => {
    try {
      return await apiClient.delete(`/admin/targets/${targetId}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to delete target')
      }
      throw error
    }
  },
}
