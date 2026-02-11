export type UserRole =
    | 'super_admin'
    | 'zone_admin'
    | 'state_admin'
    | 'district_admin'
    | 'org_admin'
    | 'kvk'
    | 'state_user'
    | 'district_user'
    | 'org_user'

export type PermissionAction = 'VIEW' | 'ADD' | 'EDIT' | 'DELETE'

export interface User {
    userId: number
    name: string
    email: string
    phoneNumber?: string | null
    roleId: number
    role: UserRole
    zoneId?: number | null
    stateId?: number | null
    districtId?: number | null
    orgId?: number | null
    kvkId?: number | null
    createdAt?: string
    lastLoginAt?: string | null
    /** Granular permissions (VIEW/ADD/EDIT/DELETE). Absent = full access for role. */
    permissions?: PermissionAction[]
}

export interface LoginCredentials {
    email: string
    password: string
}
