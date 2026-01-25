export type UserRole =
    | 'super_admin'
    | 'zone_admin'
    | 'state_admin'
    | 'district_admin'
    | 'org_admin'
    | 'kvk'

export interface User {
    userId: number
    name: string
    email: string
    roleId: number
    role: UserRole // Derived from roleName
    zoneId?: number | null
    stateId?: number | null
    districtId?: number | null
    orgId?: number | null
    kvkId?: number | null
    createdAt?: string
    lastLoginAt?: string | null
}

export interface LoginCredentials {
    email: string
    password: string
}
