/**
 * Centralized role hierarchy constants.
 * Lower number = higher authority. super_admin = 0 (highest).
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 0,
  zone_admin: 1,
  state_admin: 2,
  district_admin: 3,
  org_admin: 4,
  kvk_admin: 5,
  kvk_user: 6,
  state_user: 7,
  district_user: 8,
  org_user: 9,
}

export const ADMIN_ROLES = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk_admin'] as const

export function getRoleLevel(roleName: string): number {
  return ROLE_HIERARCHY[roleName] ?? Infinity
}

export function isAdminRole(roleName: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(roleName)
}

export function outranks(callerRole: string, targetRole: string): boolean {
  return getRoleLevel(callerRole) < getRoleLevel(targetRole)
}

export function outranksOrEqual(callerRole: string, targetRole: string): boolean {
  return getRoleLevel(callerRole) <= getRoleLevel(targetRole)
}

/**
 * Defines which roles each admin role is allowed to create.
 * A KVK admin should only create KVK-level users, not state/district/org users
 * which belong to a higher organizational scope.
 */
const CREATABLE_ROLES_MAP: Record<string, string[]> = {
  super_admin: ['zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk_admin', 'kvk_user', 'state_user', 'district_user', 'org_user'],
  zone_admin: ['state_admin', 'district_admin', 'org_admin', 'kvk_admin', 'state_user', 'district_user', 'org_user', 'kvk_user'],
  state_admin: ['state_user', 'district_user', 'org_user', 'kvk_user'],
  district_admin: ['district_user', 'org_user', 'kvk_user'],
  org_admin: ['org_user', 'kvk_user'],
  kvk_admin: ['kvk_user'],
}

export function getCreatableRoles(callerRole: string): string[] {
  const roles = CREATABLE_ROLES_MAP[callerRole]
  if (!roles) {
    throw new Error(`Unsupported caller role: ${callerRole}`)
  }
  return roles
}

export function getManageableRoles(callerRole: string): string[] {
  const callerLevel = getRoleLevel(callerRole)
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level >= callerLevel)
    .map(([name]) => name)
}

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  super_admin: 'ATARI Super Admin',
  zone_admin: 'Zone Admin',
  state_admin: 'State Admin',
  district_admin: 'District Admin',
  org_admin: 'Organization Admin',
  kvk_admin: 'KVK Admin',
  kvk_user: 'KVK User',
  state_user: 'State User',
  district_user: 'District User',
  org_user: 'Organization User',
}
