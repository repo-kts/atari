/**
 * Aligns with backend `constants/masterListPagination.js`.
 * Admin master "list all" endpoints default to a large page size when `limit` is omitted;
 * passing it explicitly keeps behavior obvious and stable across API versions.
 */

export const MAX_MASTER_LIST_PAGE_SIZE = 10000;
export const DEFAULT_MASTER_LIST_PAGE_SIZE = 5000;

/**
 * Query string for full master list fetches (single page up to DEFAULT_MASTER_LIST_PAGE_SIZE).
 */
export function masterListQuery(extra?: Record<string, string | number | undefined>): string {
    const params = new URLSearchParams({ limit: String(DEFAULT_MASTER_LIST_PAGE_SIZE) });
    if (extra) {
        for (const [k, v] of Object.entries(extra)) {
            if (v !== undefined && v !== '') {
                params.set(k, String(v));
            }
        }
    }
    return `?${params.toString()}`;
}
