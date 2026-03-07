/**
 * Centralized role hierarchy constants.
 * Lower number = higher authority. super_admin = 0 (highest).
 */
const ROLE_HIERARCHY = {
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
};

const ADMIN_ROLES = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk_admin'];

/**
 * Returns the numeric hierarchy level for a role.
 * Lower = more powerful. Returns Infinity for unknown roles.
 * @param {string|{ roleName: string; hierarchyLevel?: number | null }} roleNameOrRole - Role name or role object with hierarchyLevel
 */
function getRoleLevel(roleNameOrRole) {
  if (typeof roleNameOrRole === 'object' && roleNameOrRole !== null) {
    const { roleName, hierarchyLevel } = roleNameOrRole;
    if (hierarchyLevel != null) return hierarchyLevel;
    return ROLE_HIERARCHY[roleName] ?? Infinity;
  }
  return ROLE_HIERARCHY[roleNameOrRole] ?? Infinity;
}

/**
 * Check if a given role is an admin role.
 */
function isAdminRole(roleName) {
  return ADMIN_ROLES.includes(roleName);
}

/**
 * Check if callerRole strictly outranks targetRole (lower level number).
 */
function outranks(callerRole, targetRole) {
  return getRoleLevel(callerRole) < getRoleLevel(targetRole);
}

/**
 * Check if callerRole outranks or equals targetRole.
 */
function outranksOrEqual(callerRole, targetRole) {
  return getRoleLevel(callerRole) <= getRoleLevel(targetRole);
}

/**
 * Get all role names that a given caller role can see/manage
 * (roles at the same level or below).
 */
function getManageableRoles(callerRole) {
  const callerLevel = getRoleLevel(callerRole);
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level >= callerLevel)
    .map(([name]) => name);
}

/**
 * Defines which roles each admin role is allowed to create.
 * A KVK admin should only create KVK-level users, not state/district/org users
 * which belong to a higher organizational scope.
 */
const CREATABLE_ROLES_MAP = {
  super_admin: ['zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk_admin', 'kvk_user', 'state_user', 'district_user', 'org_user'],
  zone_admin: ['state_admin', 'district_admin', 'org_admin', 'kvk_admin', 'state_user', 'district_user', 'org_user', 'kvk_user'],
  state_admin: ['state_user', 'district_user', 'org_user', 'kvk_user'],
  district_admin: ['district_user', 'org_user', 'kvk_user'],
  org_admin: ['org_user', 'kvk_user'],
  kvk_admin: ['kvk_user'],
};

/**
 * Returns the role names that a given creator can assign.
 * Uses an explicit map to ensure admins can only create roles within their organizational scope.
 */
function getCreatableRoles(callerRole) {
  return CREATABLE_ROLES_MAP[callerRole] || [];
}

module.exports = {
  ROLE_HIERARCHY,
  ADMIN_ROLES,
  getRoleLevel,
  isAdminRole,
  outranks,
  outranksOrEqual,
  getManageableRoles,
  getCreatableRoles,
};
