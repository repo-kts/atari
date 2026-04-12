import { apiClient, ApiError } from './api'

export interface DashboardKvkOption {
  kvkId: number
  kvkName: string
}

export interface DashboardPerKvkRow {
  kvkId: number
  kvkName: string
  oft: { completed: number; created: number; status: string }
  fld: { completed: number; created: number; status: string }
  training: { count: number; status: string }
  extension: { count: number; status: string }
}

export interface DashboardStaffPost {
  postId: number | null
  postName: string
  count: number
}

export interface DashboardRecentLog {
  kvkName: string | null
  userName: string | null
  activity: string
  ipAddress: string | null
  eventAt: string
}

export interface DashboardData {
  reportingYear: number | 'all'
  filterKvkId: number | null
  canFilterByKvk: boolean
  yearOptions: number[]
  kvkOptions: DashboardKvkOption[]
  primaryKvkName: string | null
  kpis: {
    organizationCount: number
    kvkCount: number
    totalOft: number
    totalFld: number
    training: number
    extension: number
    totalStaff: number
  }
  perKvk: DashboardPerKvkRow[]
  staffByPost: DashboardStaffPost[]
  recentLogs: DashboardRecentLog[]
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

export const dashboardApi = {
  getDashboard: async (params: { reportingYear: number | 'all'; kvkId?: number }): Promise<DashboardData> => {
    const query = buildQueryString({
      reportingYear: params.reportingYear === 'all' ? 'all' : params.reportingYear,
      kvkId: params.kvkId,
    })
    try {
      return await apiClient.get<DashboardData>(`/admin/dashboard${query}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to load dashboard')
      }
      throw error
    }
  },
}
