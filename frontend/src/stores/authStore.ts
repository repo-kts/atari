import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserRole, LoginCredentials } from '../types/auth'
import { authApi, ApiUser } from '../services/authApi'

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (credentials: LoginCredentials) => Promise<boolean>
    logout: () => Promise<void>
    checkAuth: () => Promise<boolean>
    refreshToken: () => Promise<boolean>
    hasRole: (role: UserRole | UserRole[]) => boolean
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
})

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            /**
             * Login with email and password
             */
            login: async (credentials: LoginCredentials): Promise<boolean> => {
                set({ isLoading: true, error: null })

                try {
                    const apiUser = await authApi.login(credentials)
                    const user = mapApiUserToUser(apiUser)

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
                try {
                    await authApi.logout()
                } catch (error) {
                    console.error('Logout error:', error)
                } finally {
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: null,
                    })
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
