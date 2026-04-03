import { apiClient, ApiError } from './api'

export interface LogHistoryItem {
  logId: number
  userId: number | null
  kvkId: number | null
  userName: string | null
  userEmail: string | null
  roleName: string | null
  zoneId: number | null
  stateId: number | null
  districtId: number | null
  orgId: number | null
  kvkName: string | null
  activity: string
  ipAddress: string | null
  userAgent: string | null
  eventAt: string
  createdAt: string
}

export interface LogHistoryMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LogHistoryResponse {
  data: LogHistoryItem[]
  meta: LogHistoryMeta
}

export interface LogHistoryFilters {
  page?: number
  limit?: number
  search?: string
  kvkId?: number
  userId?: number
  roleName?: string
  activity?: 'LOGIN' | 'LOGOUT'
  sortBy?: 'eventAt' | 'kvkName' | 'userName' | 'activity' | 'ipAddress'
  sortOrder?: 'asc' | 'desc'
  from?: string
  to?: string
}

export interface LogKvkOption {
  kvkId: number
  kvkName: string
}

export interface LogUserOption {
  userId: number
  userName: string | null
  userEmail: string | null
  roleName: string | null
}

function buildQueryString(params?: Record<string, string | number | undefined>): string {
  if (!params) return ''

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const logHistoryApi = {
  getLogs: async (filters: LogHistoryFilters = {}): Promise<LogHistoryResponse> => {
    try {
      const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        kvkId: filters.kvkId,
        userId: filters.userId,
        roleName: filters.roleName,
        activity: filters.activity,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        from: filters.from,
        to: filters.to,
      })
      return await apiClient.get<LogHistoryResponse>(`/admin/log-history${query}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch log history')
      }
      throw error
    }
  },

  getKvks: async (): Promise<LogKvkOption[]> => {
    try {
      return await apiClient.get<LogKvkOption[]>('/admin/log-history/kvks')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch KVK options')
      }
      throw error
    }
  },

  getUsers: async (): Promise<LogUserOption[]> => {
    try {
      return await apiClient.get<LogUserOption[]>('/admin/log-history/users')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch user options')
      }
      throw error
    }
  },
}
