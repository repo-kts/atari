import { apiClient } from './api'
import type {
    ModuleInfo,
    MasterOption,
    FetchResult,
    TransformResult,
    SeedResult,
} from './migrationApi'

/**
 * Super-migration API. Mirrors migrationApi but has no KVK selection — the
 * target KVK is resolved per-row on the backend from a superadmin curl.
 */
export const superMigrationApi = {
    getModules: () => apiClient.get<{ modules: ModuleInfo[] }>('/super-migration/modules'),

    getMasterOptions: (master: string) =>
        apiClient.get<{ options: MasterOption[] }>(
            `/super-migration/master-options/${encodeURIComponent(master)}`,
        ),

    fetchCurl: (curl: string) =>
        apiClient.post<FetchResult>('/super-migration/fetch', { curl }),

    transform: (module: string, raw: unknown) =>
        apiClient.post<TransformResult>('/super-migration/transform', { module, raw }),

    seed: (module: string, records: unknown[]) =>
        apiClient.post<SeedResult>('/super-migration/seed', { module, records }),
}
