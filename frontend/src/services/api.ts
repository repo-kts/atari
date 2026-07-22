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
    // Extract error message from API response structure
    // Common shapes: { error: "..." }, { error: { message } }, { message: "..." }
    let errorMessage = statusText;
    if (data?.error && typeof data.error === 'object' && data.error.message) {
      errorMessage = data.error.message;
    } else if (typeof data?.error === 'string') {
      errorMessage = data.error;
    } else if (typeof data?.message === 'string' && data.message.trim() !== '') {
      errorMessage = data.message;
    }
    super(errorMessage);
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

  private async fetchWithAuth(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...defaultFetchOptions,
      ...options,
      headers: {
        ...defaultFetchOptions.headers,
        ...options.headers,
      },
      // Support AbortSignal from options
      signal: options.signal,
    };

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (error) {
      throw new ApiError(
        0,
        'Network error',
        { error: error instanceof Error ? error.message : 'Unknown error' },
      );
    }

    // 401: try refresh once, then retry this request (except for refresh/login endpoints).
    // This is shared by JSON and binary report/export requests.
    const isAuthRefresh = endpoint.includes('/auth/refresh');
    const isAuthLogin = endpoint.includes('/auth/login');
    const isAuthMe = endpoint.includes('/auth/me');

    if (
      response.status === 401 &&
      !isRetry &&
      !isAuthRefresh &&
      !isAuthLogin
    ) {
      let refreshed = false;
      try {
        refreshed = await callRefreshEndpoint(this.baseUrl);
        if (refreshed) {
          return this.fetchWithAuth(endpoint, options, true);
        }
      } catch {
        // Preserve the original 401 response below; it contains the most useful error.
      }
      // Refresh failed (e.g. refresh token expired). Only trigger session expiry
      // when this is not the silent initial auth check.
      if (!refreshed && !isAuthMe) onSessionExpired?.();
    }

    return response;
  }

  private async createApiError(response: Response): Promise<ApiError> {
    const text = await response.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { error: text || response.statusText };
    }
    return new ApiError(response.status, response.statusText, body);
  }

  /**
   * Make a JSON request to the API with cookie support and one auth refresh retry.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await this.fetchWithAuth(endpoint, options);

    if (response.status === 204) return null as T;
    if (!response.ok) throw await this.createApiError(response);

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

  /**
   * Make a binary request (PDF/Excel/Word) with the same auth refresh retry.
   */
  private async requestBlob(endpoint: string, options: RequestInit = {}): Promise<Blob> {
    const response = await this.fetchWithAuth(endpoint, options);
    if (!response.ok) throw await this.createApiError(response);
    return response.blob();
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

  async postBlob(endpoint: string, data?: any, options?: RequestInit): Promise<Blob> {
    return this.requestBlob(endpoint, {
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
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
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
