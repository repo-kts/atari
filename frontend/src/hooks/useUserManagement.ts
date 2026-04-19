import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, UserFilters, CreateUserData, UpdateUserData } from '../services/userApi';

/**
 * Hook to fetch users with optional filters
 */
export function useUsers(filters?: UserFilters) {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: () => userApi.getUsers(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Hook to create a new role
 */
export function useCreateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            roleName,
            description,
            hierarchyLevel,
        }: {
            roleName: string
            description?: string | null
            hierarchyLevel?: number
        }) => userApi.createRole(roleName, description, hierarchyLevel),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });
}

/**
 * Hook to fetch all roles
 */
export function useRoles() {
    return useQuery({
        queryKey: ['roles'],
        queryFn: () => userApi.getRoles(),
        staleTime: 10 * 60 * 1000, // Roles rarely change - 10 minutes
    });
}

/**
 * Hook to fetch role permissions
 */
export function useRolePermissions(roleId: number | null) {
    return useQuery({
        queryKey: ['rolePermissions', roleId],
        queryFn: () => userApi.getRolePermissions(roleId!),
        enabled: roleId != null, // Only fetch when roleId is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: CreateUserData) => userApi.createUser(userData),
        onSuccess: () => {
            // Invalidate users list to refetch
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) =>
            userApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => userApi.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

/**
 * Hook to update role permissions (bulk update)
 */
export function useUpdateRolePermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
            userApi.updateRolePermissions(roleId, permissionIds),
        onSuccess: (_, variables) => {
            // Invalidate the specific role's permissions
            queryClient.invalidateQueries({ queryKey: ['rolePermissions', variables.roleId] });
            // Also refresh the logged-in user's permissions so sidebar/buttons update immediately
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });
}

/**
 * Hook to fetch a user's permission matrix.
 */
export function useUserPermissions(userId: number | null) {
    return useQuery({
        queryKey: ['userPermissions', userId],
        queryFn: () => userApi.getUserPermissions(userId!),
        enabled: userId != null,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook to replace a user's per-module permission grants.
 */
export function useUpdateUserPermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            permissionIds,
            allowEmpty,
        }: {
            userId: number
            permissionIds: number[]
            allowEmpty?: boolean
        }) => userApi.updateUserPermissions(userId, permissionIds, { allowEmpty }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['userPermissions', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            // Refresh current user's permissions in case the admin just edited themselves.
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });
}
