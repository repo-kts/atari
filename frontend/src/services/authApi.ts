import { apiClient, ApiError } from './api';

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Granular permission actions (user management)
 */
export type PermissionAction = 'VIEW' | 'ADD' | 'EDIT' | 'DELETE';

/**
 * User data returned from API
 */
export interface ApiUser {
  userId: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  zoneId?: number | null;
  stateId?: number | null;
  districtId?: number | null;
  orgId?: number | null;
  kvkId?: number | null;
  createdAt?: string;
  lastLoginAt?: string | null;
  /** Granular permissions; absent = full access for role */
  permissions?: PermissionAction[];
  /** Role (and user-level) permissions by module code from Role Permission Editor */
  permissionsByModule?: Record<string, PermissionAction[]>;
}

/**
 * Login response
 */
export interface LoginResponse {
  message: string;
  user: ApiUser;
}

/**
 * Auth API service
 */
export const authApi = {
  /**
   * Login user
   * @param credentials - Email and password
   * @returns User data (tokens are set in HTTP-only cookies)
   */
  login: async (credentials: LoginCredentials): Promise<ApiUser> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        credentials,
      );
      return response.user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Login failed');
      }
      throw error;
    }
  },

  /**
   * Refresh access token
   * @returns Success message (new token is set in HTTP-only cookie)
   */
  refreshToken: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/refresh');
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Token refresh failed');
      }
      throw error;
    }
  },

  /**
   * Logout user
   * Clears HTTP-only cookies
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
    }
  },

  /**
   * Get current authenticated user
   * @returns Current user data
   */
  getCurrentUser: async (): Promise<ApiUser> => {
    return await apiClient.get<ApiUser>('/auth/me');
  },
};
