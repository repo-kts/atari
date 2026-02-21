import React, { createContext, useContext, useRef, useCallback, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, ApiUser } from '../services/authApi'
import { ApiError } from '../services/api'
import { User, UserRole, PermissionAction, LoginCredentials } from '../types/auth'
import { outranksOrEqual } from '../constants/roleHierarchy'

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
    permissionsByModule: apiUser.permissionsByModule,
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
    /** Check permission for an action in a module (from Role Permission Editor). moduleCode is required; omitting it returns false. */
    hasPermission: (action: PermissionAction, moduleCode?: string) => boolean
    /** Whether the current user can act on a target role (hierarchy: lower admins cannot modify higher). */
    canActOnRole: (targetRole: string) => boolean
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
                // 401/403 = not authenticated — return null so the app treats it as logged-out
                if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
                    return null
                }
                // Any other error (network, 500, etc.) — let React Query surface it via queryError
                throw err
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
            // Remove cached data from previous session but keep the currentUser observer intact
            queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'currentUser' })
            isLoggingOutRef.current = false
        },
        onError: () => {
            // Even on error, clear stale session data
            queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'currentUser' })
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

        // Cancel any in-flight currentUser fetch to prevent it from overwriting our null
        queryClient.cancelQueries({ queryKey: ['currentUser'] })
        // Immediately null out user (observer stays intact, no refetch triggered)
        queryClient.setQueryData(['currentUser'], null)

        // Then call logout API (mutation callbacks handle cleanup of other cached data)
        await logoutMutation.mutateAsync()
    }

    const checkAuth = async (): Promise<boolean> => {
        const result = await refetch()
        return result.data != null
    }

    const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
        if (!user) return false

        if (Array.isArray(role)) {
            return role.includes(user.role)
        }
        return user.role === role
    }, [user])

    /**
     * Check if the current user has permission for a given action in a module.
     * Driven by permissionsByModule from Role Permission Editor — the single source of truth.
     * moduleCode is required. Omitting it returns false and emits a warning in development.
     */
    const hasPermission = useCallback((action: PermissionAction, moduleCode?: string): boolean => {
        if (!user) return false

        if (!moduleCode) {
            if (import.meta.env.DEV) {
                console.warn('hasPermission called without moduleCode — returning false. Pass the intended module code.')
            }
            return false
        }

        // super_admin has unrestricted access to every module
        if (user.role === 'super_admin') return true

        const actions = user.permissionsByModule?.[moduleCode]

        if (!actions || !Array.isArray(actions)) return false

        return actions.includes(action)
    }, [user])

    /**
     * Whether the current user can act on a target role (e.g. edit/delete another user).
     * Enforces hierarchy: lower admins cannot modify higher users.
     */
    const canActOnRole = useCallback((targetRole: string): boolean => {
        if (!user) return false
        return outranksOrEqual(user.role, targetRole)
    }, [user])

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
        canActOnRole,
        clearError,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Export a function to get logout for use in API error handler (session expired).
// Coordinates with AuthProvider's logout: only nulls ['currentUser'] via setQueryData
// (keeping the observer intact) and removes other cached data to prevent stale leaks.
export const getLogoutFunction = (queryClient: ReturnType<typeof useQueryClient>) => {
    return () => {
        // Only act if there's a user in the cache (prevent redundant clears)
        const currentUser = queryClient.getQueryData(['currentUser'])
        if (currentUser) {
            // Cancel in-flight currentUser fetch to prevent race with our null
            queryClient.cancelQueries({ queryKey: ['currentUser'] })
            // Null out user (observer stays intact, no refetch triggered)
            queryClient.setQueryData(['currentUser'], null)
            // Remove cached data from previous session (keep currentUser observer intact)
            queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'currentUser' })
        }
    }
}
