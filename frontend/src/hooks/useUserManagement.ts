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
        },
    });
}
