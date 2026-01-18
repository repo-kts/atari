import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserRole, LoginCredentials } from '../types/auth'

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    login: (credentials: LoginCredentials) => Promise<boolean>
    logout: () => void
    hasRole: (role: UserRole | UserRole[]) => boolean
}

// Mock users database
const MOCK_USERS: Record<string, { user: User; password: string }> = {
    'superadmin@atari.gov.in': {
        user: {
            id: '1',
            name: 'Super Admin',
            email: 'superadmin@atari.gov.in',
            role: 'super_admin',
        },
        password: 'superadmin123',
    },
    'admin@atari.gov.in': {
        user: {
            id: '2',
            name: 'Admin User',
            email: 'admin@atari.gov.in',
            role: 'admin',
        },
        password: 'admin123',
    },
    'kvk@atari.gov.in': {
        user: {
            id: '3',
            name: 'KVK User',
            email: 'kvk@atari.gov.in',
            role: 'kvk',
            kvk_id: 13, // Links to KVK Patna
        },
        password: 'kvk123',
    },
    'kvk.patna@atari.gov.in': {
        user: {
            id: '3',
            name: 'KVK Patna User',
            email: 'kvk.patna@atari.gov.in',
            role: 'kvk',
            kvk_id: 13, // Links to KVK Patna
        },
        password: 'kvk123',
    },
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            login: async (credentials: LoginCredentials): Promise<boolean> => {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500))

                const userData = MOCK_USERS[credentials.email.toLowerCase()]

                if (userData && userData.password === credentials.password) {
                    set({
                        user: userData.user,
                        isAuthenticated: true,
                    })
                    return true
                }

                return false
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                })
            },

            hasRole: (role: UserRole | UserRole[]): boolean => {
                const { user } = get()
                if (!user) return false

                if (Array.isArray(role)) {
                    return role.includes(user.role)
                }
                return user.role === role
            },
        }),
        {
            name: 'atari-auth-storage',
        }
    )
)
