import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserRole, PermissionAction, LoginCredentials } from '../types/auth'
import { authApi, ApiUser } from '../services/authApi'
import { QueryClient } from '@tanstack/react-query'

// Export queryClient instance for cache invalidation
let queryClientInstance: QueryClient | null = null

export const setQueryClient = (client: QueryClient) => {
    queryClientInstance = client
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    isLoggingOut: boolean
    login: (credentials: LoginCredentials) => Promise<boolean>
    logout: () => Promise<void>
    checkAuth: () => Promise<boolean>
    refreshToken: () => Promise<boolean>
    hasRole: (role: UserRole | UserRole[]) => boolean
    /** Check granular permission (VIEW/ADD/EDIT/DELETE). No permissions array = full access. */
    hasPermission: (action: PermissionAction) => boolean
    clearError: () => void
}

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

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isLoggingOut: false,
            error: null,

            /**
             * Login with email and password
             */
            login: async (credentials: LoginCredentials): Promise<boolean> => {
                set({ isLoading: true, error: null })

                try {
                    const apiUser = await authApi.login(credentials)
                    const user = mapApiUserToUser(apiUser)

                    // Invalidate all queries on login to clear previous user's cache
                    if (queryClientInstance) {
                        queryClientInstance.clear()
                    }

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    })
                    return true
                } catch (error) {
                    const message =
                        error instanceof Error ? error.message : 'Login failed'
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: message,
                    })
                    return false
                }
            },

            /**
             * Logout user and clear session
             */
            logout: async (): Promise<void> => {
                // Prevent duplicate logout calls
                if (get().isLoggingOut) {
                    return
                }

                // Immediately clear state to prevent re-authentication attempts
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    isLoggingOut: true,
                    error: null,
                })

                // Clear all queries on logout
                if (queryClientInstance) {
                    queryClientInstance.clear()
                }

                try {
                    await authApi.logout()
                } catch (error) {
                    console.error('Logout error:', error)
                } finally {
                    set({ isLoggingOut: false })
                }
            },

            /**
             * Check if user is authenticated (on app load)
             * Attempts to get current user from API
             */
            checkAuth: async (): Promise<boolean> => {
                set({ isLoading: true })

                try {
                    const apiUser = await authApi.getCurrentUser()
                    const user = mapApiUserToUser(apiUser)

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                    return true
                } catch (error) {
                    // Not authenticated or token expired - try refresh
                    const refreshed = await get().refreshToken()
                    if (!refreshed) {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                        })
                    }
                    return refreshed
                }
            },

            /**
             * Refresh the access token
             */
            refreshToken: async (): Promise<boolean> => {
                try {
                    await authApi.refreshToken()
                    // After refresh, get updated user info
                    const apiUser = await authApi.getCurrentUser()
                    const user = mapApiUserToUser(apiUser)

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                    return true
                } catch (error) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    })
                    return false
                }
            },

            /**
             * Check if user has specified role(s)
             */
            hasRole: (role: UserRole | UserRole[]): boolean => {
                const { user } = get()
                if (!user) return false

                if (Array.isArray(role)) {
                    return role.includes(user.role)
                }
                return user.role === role
            },

            /**
             * Check granular permission (VIEW/ADD/EDIT/DELETE).
             * Fail closed for empty arrays; treat explicit admin roles as full access.
             */
            hasPermission: (action: PermissionAction): boolean => {
                const { user } = get()
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
            },

            /**
             * Clear error message
             */
            clearError: () => {
                set({ error: null })
            },
        }),
        {
            name: 'atari-auth-storage',
            partialize: (state) => ({
                // Only persist user data, not loading/error states
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
