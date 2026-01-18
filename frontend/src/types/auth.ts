export type UserRole = 'super_admin' | 'admin' | 'kvk'

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    avatar?: string
    kvk_id?: number // For KVK users, links to their KVK ID
}

export interface LoginCredentials {
    email: string
    password: string
}
