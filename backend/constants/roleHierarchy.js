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
  kvk: 5,
  state_user: 6,
  district_user: 7,
  org_user: 8,
};

const ADMIN_ROLES = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * Returns the numeric hierarchy level for a role name.
 * Lower = more powerful. Returns Infinity for unknown roles.
 */
function getRoleLevel(roleName) {
  return ROLE_HIERARCHY[roleName] ?? Infinity;
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

module.exports = {
  ROLE_HIERARCHY,
  ADMIN_ROLES,
  getRoleLevel,
  isAdminRole,
  outranks,
  outranksOrEqual,
  getManageableRoles,
};
