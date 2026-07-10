import { apiClient, ApiError } from './api'

export type AnalyticsMetricKey = 'oft' | 'fld' | 'training' | 'extension'

export interface AnalyticsMeasureMeta {
    key: string
    label: string
    unit: string
    isDefault?: boolean
}

export interface AnalyticsBreakdown {
    key: string
    label: string
    keys: string[]
}

export interface AnalyticsGroupByOption {
    key: string
    label: string
}

export interface AnalyticsMetricMeta {
    key: AnalyticsMetricKey
    label: string
    measures: AnalyticsMeasureMeta[]
    breakdowns: AnalyticsBreakdown[]
    groupBy: AnalyticsGroupByOption[]
}

export interface AnalyticsRow {
    id: number | string
    name: string
    status: string
    primary: number
    secondary: number
    segments: { ongoing: number; completed: number; notStarted: number }
    measures: Record<string, number>
}

export interface AnalyticsResponse {
    metric: AnalyticsMetricKey
    label: string
    groupBy: string
    reportingYear: number | 'all'
    rows: AnalyticsRow[]
    totals: Record<string, number>
    measures: AnalyticsMeasureMeta[]
    breakdowns: AnalyticsBreakdown[]
}

/** One flat row per KVK; every dropdown is derived from this list client-side. */
export interface AnalyticsKvkOption {
    kvkId: number
    kvkName: string
    zoneId: number
    zoneName: string
    stateId: number
    stateName: string
    districtId: number
    districtName: string
    orgId: number
    orgName: string
}

export interface AnalyticsFilterOptions {
    yearOptions: number[]
    kvks: AnalyticsKvkOption[]
    metrics: AnalyticsMetricMeta[]
}

export interface AnalyticsQuery {
    reportingYear?: number | 'all'
    groupBy?: string
    zoneId?: number
    stateId?: number
    districtId?: number
    orgId?: number
    kvkId?: number
}

function buildQueryString(params: AnalyticsQuery): string {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            sp.append(key, String(value))
        }
    })
    const query = sp.toString()
    return query ? `?${query}` : ''
}

function unwrap(error: unknown, fallback: string): never {
    if (error instanceof ApiError) {
        throw new Error(error.data?.error || fallback)
    }
    throw error
}

export const analyticsApi = {
    getFilterOptions: async (): Promise<AnalyticsFilterOptions> => {
        try {
            return await apiClient.get<AnalyticsFilterOptions>(
                '/admin/dashboard/analytics/filters'
            )
        } catch (error) {
            unwrap(error, 'Failed to load analytics filters')
        }
    },

    getMetric: async (
        metric: AnalyticsMetricKey,
        query: AnalyticsQuery
    ): Promise<AnalyticsResponse> => {
        try {
            return await apiClient.get<AnalyticsResponse>(
                `/admin/dashboard/analytics/${metric}${buildQueryString(query)}`
            )
        } catch (error) {
            unwrap(error, 'Failed to load analytics')
        }
    },
}
