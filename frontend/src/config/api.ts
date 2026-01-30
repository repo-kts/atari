/**
 * API Configuration
 * Base URL for backend API.
 * When unset, uses /api so Vite dev proxy keeps requests same-origin (cookies work).
 * Set VITE_API_URL in production (e.g. https://api.example.com/api).
 */
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || '/api';

/**
 * Default fetch options
 */
export const defaultFetchOptions: RequestInit = {
  credentials: 'include', // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
};
