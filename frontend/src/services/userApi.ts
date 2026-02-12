import { apiClient, ApiError } from './api';

/**
 * User data for creation/update
 */
/** Granular permission actions (when creator is not Super Admin) */
export type PermissionAction = 'VIEW' | 'ADD' | 'EDIT' | 'DELETE';

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
  universityId?: number | null;
  kvkId?: number | null;
  /** Required when creator is not Super Admin; at least one action */
  permissions?: PermissionAction[];
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

export interface RoleInfo {
  roleId: number;
  roleName: string;
  description: string | null;
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
/** Display labels for known role names */
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  zone_admin: 'Zone Admin',
  state_admin: 'State Admin',
  district_admin: 'District Admin',
  org_admin: 'Org Admin',
  kvk: 'KVK',
  state_user: 'State User',
  district_user: 'District User',
  org_user: 'Org User',
};

export const getRoleLabel = (roleName: string): string =>
  ROLE_LABELS[roleName] ?? roleName;

export interface ModulePermission {
  permissionId: number;
  action: 'VIEW' | 'ADD' | 'EDIT' | 'DELETE';
  hasPermission: boolean;
}

export interface ModuleWithPermissions {
  moduleId: number;
  menuName: string;
  subMenuName: string;
  moduleCode: string;
  permissions: ModulePermission[];
}

export interface RolePermissionsResponse {
  roleId: number;
  roleName: string;
  description: string | null;
  modules: ModuleWithPermissions[];
}

export const userApi = {
  /**
   * Get all roles from the backend
   */
  getRoles: async (): Promise<RoleInfo[]> => {
    try {
      return await apiClient.get<RoleInfo[]>('/admin/roles');
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch roles');
      }
      throw error;
    }
  },

  /**
   * Get role permissions (all modules with hasPermission flags)
   */
  getRolePermissions: async (roleId: number): Promise<RolePermissionsResponse> => {
    try {
      return await apiClient.get<RolePermissionsResponse>(`/admin/roles/${roleId}/permissions`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch role permissions');
      }
      throw error;
    }
  },

  /**
   * Update role permissions (bulk update)
   * @param roleId - Role ID
   * @param permissionIds - Array of permission IDs to assign to this role
   */
  updateRolePermissions: async (roleId: number, permissionIds: number[]): Promise<void> => {
    try {
      await apiClient.put(`/admin/roles/${roleId}/permissions`, { permissionIds });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to update role permissions');
      }
      throw error;
    }
  },

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
