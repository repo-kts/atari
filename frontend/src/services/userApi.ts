import { apiClient, ApiError } from './api';

/**
 * User data for creation/update
 */
export interface CreateUserData {
  name: string;
  email: string;
  phoneNumber?: string | null;
  roleId: number;
  password: string;
  zoneId?: number | null;
  stateId?: number | null;
  districtId?: number | null;
  orgId?: number | null;
  kvkId?: number | null;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string | null;
  roleId?: number;
  zoneId?: number | null;
  stateId?: number | null;
  districtId?: number | null;
  orgId?: number | null;
  kvkId?: number | null;
}

/**
 * User filters for listing
 */
export interface UserFilters {
  roleId?: number;
  search?: string;
  zoneId?: number;
  stateId?: number;
  districtId?: number;
  orgId?: number;
  kvkId?: number;
}

/**
 * User API service
 */
export const userApi = {
  /**
   * Create a new user (admin only)
   * @param userData - User data including password
   * @returns Created user (without password)
   */
  createUser: async (userData: CreateUserData) => {
    try {
      return await apiClient.post('/admin/users', userData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to create user');
      }
      throw error;
    }
  },

  /**
   * Get users with filters (admin only)
   * @param filters - Optional filters (roleId, search, hierarchy)
   * @returns Array of users
   */
  getUsers: async (filters?: UserFilters) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;

      return await apiClient.get(endpoint);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to get users');
      }
      throw error;
    }
  },

  /**
   * Get a single user by ID
   * @param id - User ID
   * @returns User data
   */
  getUser: async (id: number) => {
    try {
      return await apiClient.get(`/admin/users/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to get user');
      }
      throw error;
    }
  },

  /**
   * Update a user (admin only)
   * @param id - User ID
   * @param userData - Updated user data
   * @returns Updated user
   */
  updateUser: async (id: number, userData: UpdateUserData) => {
    try {
      return await apiClient.put(`/admin/users/${id}`, userData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to update user');
      }
      throw error;
    }
  },

  /**
   * Delete a user (soft delete, admin only)
   * @param id - User ID
   */
  deleteUser: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to delete user');
      }
      throw error;
    }
  },
};
