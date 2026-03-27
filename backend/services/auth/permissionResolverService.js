const rolePermissionRepository = require('../../repositories/rolePermissionRepository.js');
const userPermissionRepository = require('../../repositories/userPermissionRepository.js');
const cacheService = require('../cache/redisCacheService.js');

const CACHE_VERSION = 'v1';
const DEFAULT_CACHE_TTL_SECONDS = 3600;

function getCacheTtlSeconds() {
  const parsed = Number(process.env.PERMISSION_CACHE_TTL_SECONDS);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return DEFAULT_CACHE_TTL_SECONDS;
  }
  return parsed;
}

function roleCacheKey(roleId) {
  return `perm:role:${roleId}:${CACHE_VERSION}`;
}

function userRoleCacheKey(userId, roleId) {
  return `perm:user:${userId}:role:${roleId}:${CACHE_VERSION}`;
}

function clonePermissionsMap(map) {
  if (!map || typeof map !== 'object') return {};
  return Object.fromEntries(
    Object.entries(map).map(([moduleCode, actions]) => [
      moduleCode,
      Array.isArray(actions) ? [...actions] : [],
    ]),
  );
}

function intersectWithUserActions(rolePermissionsByModule, userActions) {
  const userActionSet = new Set(userActions);
  const result = {};

  for (const [moduleCode, actions] of Object.entries(rolePermissionsByModule)) {
    const filtered = actions.filter((action) => userActionSet.has(action));
    if (filtered.length > 0) {
      result[moduleCode] = filtered;
    }
  }

  return result;
}

const permissionResolverService = {
  /**
   * Resolve role-level permissions grouped by module.
   * Cache-backed with DB fallback.
   *
   * @param {number} roleId
   * @param {{ bypassCache?: boolean }} [options]
   * @returns {Promise<Record<string, string[]>>}
   */
  getRolePermissions: async (roleId, options = {}) => {
    const bypassCache = options.bypassCache === true;
    const key = roleCacheKey(roleId);

    if (!bypassCache) {
      const cached = await cacheService.get(key);
      if (cached && typeof cached === 'object') {
        return clonePermissionsMap(cached);
      }
    }

    const permissionsByModule = await rolePermissionRepository.getRolePermissionsByModule(roleId);
    await cacheService.set(key, permissionsByModule, getCacheTtlSeconds());
    return clonePermissionsMap(permissionsByModule);
  },

  /**
   * Resolve effective permissions for a user.
   * For *_user roles: role permissions ∩ user-level actions.
   * For other roles: role permissions as-is.
   *
   * @param {{ userId: number, roleId: number, roleName: string }} params
   * @param {{ bypassCache?: boolean }} [options]
   * @returns {Promise<Record<string, string[]>>}
   */
  getEffectivePermissions: async (params, options = {}) => {
    const { userId, roleId, roleName } = params || {};
    const bypassCache = options.bypassCache === true;

    if (!roleId || !roleName) {
      throw new Error('roleId and roleName are required to resolve permissions');
    }

    const isUserRole = String(roleName).endsWith('_user');
    if (!isUserRole) {
      return permissionResolverService.getRolePermissions(roleId, options);
    }

    if (!userId) {
      throw new Error('userId is required to resolve permissions for *_user roles');
    }

    const key = userRoleCacheKey(userId, roleId);
    if (!bypassCache) {
      const cached = await cacheService.get(key);
      if (cached && typeof cached === 'object') {
        return clonePermissionsMap(cached);
      }
    }

    const rolePermissionsByModule = await permissionResolverService.getRolePermissions(roleId, options);
    const userActions = await userPermissionRepository.getUserPermissionActions(userId);

    const effectivePermissions =
      userActions.length > 0
        ? intersectWithUserActions(rolePermissionsByModule, userActions)
        : rolePermissionsByModule;

    await cacheService.set(key, effectivePermissions, getCacheTtlSeconds());
    return clonePermissionsMap(effectivePermissions);
  },

  /**
   * Invalidate cached role permissions and derived user-role entries.
   *
   * @param {number} roleId
   * @returns {Promise<void>}
   */
  invalidateRolePermissions: async (roleId) => {
    if (!roleId) return;
    await cacheService.del(roleCacheKey(roleId));
    await cacheService.delPattern(`perm:user:*:role:${roleId}:${CACHE_VERSION}`);
  },

  /**
   * Invalidate cached permissions for a specific user.
   *
   * @param {number} userId
   * @returns {Promise<void>}
   */
  invalidateUserPermissions: async (userId) => {
    if (!userId) return;
    await cacheService.delPattern(`perm:user:${userId}:*`);
  },

  /**
   * Invalidate all cached user-role entries for a role.
   * Useful after bulk role permission updates.
   *
   * @param {number} roleId
   * @returns {Promise<void>}
   */
  invalidateUsersByRole: async (roleId) => {
    if (!roleId) return;
    await cacheService.delPattern(`perm:user:*:role:${roleId}:${CACHE_VERSION}`);
  },
};

module.exports = permissionResolverService;
