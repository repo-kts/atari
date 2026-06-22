import { apiClient } from './api'

export interface MigrationKvk {
    kvkId: number
    kvkName: string
}

export interface ForeignKeyMeta {
    master: string
    otherField?: string
}

export interface ModuleInfo {
    key: string
    label: string
    model: string
    foreignKeys: Record<string, ForeignKeyMeta>
}

export interface MasterOption {
    id: number
    label: string
}

export interface FetchResult {
    raw: unknown
    rowCount: number
    // True when per-row edit-page enrichment hit its wall-clock budget and was
    // cut short — affected rows fall back to inline list fields (some detail
    // columns may be incomplete). Re-run those KVKs via the per-KVK tool.
    enrichTruncated?: boolean
}

export type IssueSeverity = 'error' | 'warn'

export interface Issue {
    field: string
    message: string
    severity: IssueSeverity
}

export interface RowReport {
    index: number
    issues: Issue[]
}

export interface TransformReport {
    total: number
    mapped: number
    errorCount: number
    warnCount: number
    seedable: boolean
    rows: RowReport[]
}

export interface TransformResult {
    records: Array<Record<string, unknown> | null>
    report: TransformReport
}

export type RowAction = 'created' | 'updated' | 'skipped' | 'failed'

export interface SeedResult {
    created: number
    updated: number
    skipped: number
    failed: Array<{ index: number; message: string }>
    actions: RowAction[]
}

export const migrationApi = {
    getKvks: () => apiClient.get<{ kvks: MigrationKvk[] }>('/migration/kvks'),

    getModules: () => apiClient.get<{ modules: ModuleInfo[] }>('/migration/modules'),

    getMasterOptions: (master: string) =>
        apiClient.get<{ options: MasterOption[] }>(
            `/migration/master-options/${encodeURIComponent(master)}`,
        ),

    fetchCurl: (curl: string) =>
        apiClient.post<FetchResult>('/migration/fetch', { curl }),

    transform: (module: string, kvkId: number, raw: unknown) =>
        apiClient.post<TransformResult>('/migration/transform', {
            module,
            kvkId,
            raw,
        }),

    seed: (module: string, kvkId: number, records: unknown[]) =>
        apiClient.post<SeedResult>('/migration/seed', { module, kvkId, records }),
}
