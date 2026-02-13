/**
 * Utility functions for building API query strings with filters
 * Optimized and reusable for all API endpoints that use the filter pattern
 */

/**
 * Standard pagination/search parameters that go directly in query string
 */
const STANDARD_QUERY_PARAMS = ['page', 'limit', 'search', 'sortBy', 'sortOrder'] as const;

type StandardQueryParam = typeof STANDARD_QUERY_PARAMS[number];

/**
 * Parameters object that can contain both standard query params and filters
 */
export interface QueryParams {
    [key: string]: any;
}

/**
 * Builds a query string from params, separating standard query params from filters
 * Filters are JSON-stringified and passed as a single 'filters' query parameter
 *
 * @param params - Object containing query parameters and filters
 * @returns Query string (without leading '?')
 *
 * @example
 * buildQueryString({ page: 1, limit: 10, universityId: 5, stateId: 2 })
 * // Returns: "page=1&limit=10&filters=%7B%22universityId%22%3A5%2C%22stateId%22%3A2%7D"
 */
export function buildQueryString(params?: QueryParams): string {
    if (!params || Object.keys(params).length === 0) {
        return '';
    }

    const queryParams = new URLSearchParams();
    const filters: Record<string, any> = {};

    // Separate standard params from filters
    Object.entries(params).forEach(([key, value]) => {
        // Skip null, undefined, and empty string values
        if (value === null || value === undefined || value === '') {
            return;
        }

        if (STANDARD_QUERY_PARAMS.includes(key as StandardQueryParam)) {
            queryParams.append(key, String(value));
        } else {
            // All other params go into filters
            filters[key] = value;
        }
    });

    // Add filters as JSON string if there are any
    if (Object.keys(filters).length > 0) {
        queryParams.append('filters', JSON.stringify(filters));
    }

    return queryParams.toString();
}

/**
 * Builds a full URL with query string from base path and params
 *
 * @param basePath - Base URL path (e.g., '/api/endpoint')
 * @param params - Query parameters object
 * @returns Full URL with query string
 *
 * @example
 * buildUrlWithQuery('/api/kvks', { page: 1, universityId: 5 })
 * // Returns: "/api/kvks?page=1&filters=%7B%22universityId%22%3A5%7D"
 */
export function buildUrlWithQuery(basePath: string, params?: QueryParams): string {
    const queryString = buildQueryString(params);
    return queryString ? `${basePath}?${queryString}` : basePath;
}
