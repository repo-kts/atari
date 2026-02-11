import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, ApiUser } from '../services/authApi'
import { User, UserRole, PermissionAction, LoginCredentials } from '../types/auth'

/**
 * Map API user to frontend User type
 */
const mapApiUserToUser = (apiUser: ApiUser): User => ({
    userId: apiUser.userId,
    name: apiUser.name,
    email: apiUser.email,
    roleId: apiUser.roleId,
    role: apiUser.roleName as UserRole,
    zoneId: apiUser.zoneId,
    stateId: apiUser.stateId,
    districtId: apiUser.districtId,
    orgId: apiUser.orgId,
    kvkId: apiUser.kvkId,
    createdAt: apiUser.createdAt,
    lastLoginAt: apiUser.lastLoginAt,
    permissions: apiUser.permissions,
})

interface AuthContextValue {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (credentials: LoginCredentials) => Promise<boolean>
    logout: () => Promise<void>
    checkAuth: () => Promise<boolean>
    hasRole: (role: UserRole | UserRole[]) => boolean
    hasPermission: (action: PermissionAction) => boolean
    clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const queryClient = useQueryClient()
    const isLoggingOutRef = useRef(false)

    // Query for current user
    const {
        data: currentUser,
        isLoading,
        error: queryError,
        refetch,
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            try {
                const apiUser = await authApi.getCurrentUser()
                return mapApiUserToUser(apiUser)
            } catch (err) {
                // Not authenticated - return null instead of throwing
                return null
            }
        },
        retry: false,
        staleTime: Infinity, // User data doesn't change often
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch on mount if we have cached data
        refetchOnReconnect: false, // Don't refetch on reconnect
    })

    const user = currentUser ?? null
    const isAuthenticated = currentUser != null && !queryError

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const apiUser = await authApi.login(credentials)
            return mapApiUserToUser(apiUser)
        },
        onSuccess: (user) => {
            // Set user data in cache
            queryClient.setQueryData(['currentUser'], user)
        },
    })

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            await authApi.logout()
        },
        onSuccess: () => {
            // Clear all queries and reset cache
            queryClient.clear()
            isLoggingOutRef.current = false
        },
        onError: () => {
            // Even on error, clear the cache
            queryClient.clear()
            isLoggingOutRef.current = false
        },
    })

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            await loginMutation.mutateAsync(credentials)
            return true
        } catch (error) {
            return false
        }
    }

    const logout = async (): Promise<void> => {
        // Prevent duplicate logout calls
        if (isLoggingOutRef.current || logoutMutation.isPending) {
            return
        }

        isLoggingOutRef.current = true

        // Immediately clear user from cache
        queryClient.setQueryData(['currentUser'], null)

        // Then call logout API
        await logoutMutation.mutateAsync()
    }

    const checkAuth = async (): Promise<boolean> => {
        const result = await refetch()
        return result.data != null
    }

    const hasRole = (role: UserRole | UserRole[]): boolean => {
        if (!user) return false

        if (Array.isArray(role)) {
            return role.includes(user.role)
        }
        return user.role === role
    }

    const hasPermission = (action: PermissionAction): boolean => {
        if (!user) return false

        // Explicit admin roles always have full access
        if (
            user.role === 'super_admin' ||
            user.role === 'zone_admin' ||
            user.role === 'state_admin' ||
            user.role === 'district_admin' ||
            user.role === 'org_admin'
        ) {
            return true
        }

        // Non-admins: require explicit permission; empty/undefined = no access
        if (!user.permissions || user.permissions.length === 0) return false
        return user.permissions.includes(action)
    }

    const clearError = () => {
        // Clear login mutation error
        loginMutation.reset()
    }

    const error = loginMutation.error
        ? loginMutation.error instanceof Error
            ? loginMutation.error.message
            : 'An error occurred'
        : null

    const value: AuthContextValue = {
        user,
        isAuthenticated,
        isLoading: isLoading || loginMutation.isPending,
        error,
        login,
        logout,
        checkAuth,
        hasRole,
        hasPermission,
        clearError,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Export a function to get logout for use in API error handler
export const getLogoutFunction = (queryClient: ReturnType<typeof useQueryClient>) => {
    return () => {
        // Only clear if there's a user in the cache (prevent redundant clears)
        const currentUser = queryClient.getQueryData(['currentUser'])
        if (currentUser) {
            // Clear currentUser and all cached data
            queryClient.setQueryData(['currentUser'], null)
            queryClient.clear()
        }
    }
}
