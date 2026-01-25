/**
 * API Configuration
 * Base URL for backend API
 */
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Default fetch options
 */
export const defaultFetchOptions: RequestInit = {
  credentials: 'include', // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
};
