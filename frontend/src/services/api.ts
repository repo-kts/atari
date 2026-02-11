import { API_BASE_URL, defaultFetchOptions } from '../config/api';

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any,
  ) {
    super(data?.error || statusText);
    this.name = 'ApiError';
  }
}

/**
 * Call refresh endpoint with cookies; used on 401 to get new access token.
 * Uses raw fetch to avoid circular dependency with authApi.
 * A mutex (refreshPromise) ensures only one refresh is in-flight at a time;
 * concurrent 401s will await the same promise instead of racing.
 */
let refreshPromise: Promise<boolean> | null = null;

async function callRefreshEndpoint(baseUrl: string): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const url = `${baseUrl}/auth/refresh`;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Called when a 401 occurs and refresh failed (session expired). Set by app to logout. */
let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(callback: () => void): void {
  onSessionExpired = callback;
}

/**
 * Base API client with error handling, cookie support, and 401 refresh-and-retry
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a request to the API.
   * On 401 (except for auth/refresh and auth/login), attempts to refresh the access token
   * and retries the request once.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...defaultFetchOptions,
      ...options,
      headers: {
        ...defaultFetchOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return null as T;
      }

      // Check response.ok before parsing so we preserve status on error paths
      if (response.ok) {
        try {
          return (await response.json()) as T;
        } catch (parseError) {
          throw new ApiError(
            response.status,
            response.statusText,
            { error: parseError instanceof Error ? parseError.message : 'Invalid JSON response' },
          );
        }
      }

      // 401: try refresh once, then retry this request (except for refresh/login endpoints)
      const isAuthRefresh = endpoint.includes('/auth/refresh');
      const isAuthLogin = endpoint.includes('/auth/login');
      const isAuthMe = endpoint.includes('/auth/me');
      
      if (
        response.status === 401 &&
        !isRetry &&
        !isAuthRefresh &&
        !isAuthLogin
      ) {
        const refreshed = await callRefreshEndpoint(this.baseUrl);
        if (refreshed) {
          return this.request<T>(endpoint, options, true);
        }
        // Refresh failed (e.g. refresh token expired)
        // Only trigger session expired if this is NOT the initial auth check
        // (getCurrentUser on app load should fail silently)
        if (!isAuthMe) {
          onSessionExpired?.();
        }
      }

      // Error response: read body once (text), then parse or use as message
      const text = await response.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { error: text || response.statusText };
      }
      throw new ApiError(response.status, response.statusText, body as { error?: string });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors (e.g. fetch failed or body already consumed)
      throw new ApiError(
        0,
        'Network error',
        { error: error instanceof Error ? error.message : 'Unknown error' },
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
