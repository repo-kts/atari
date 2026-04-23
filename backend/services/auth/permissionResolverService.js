const rolePermissionRepository = require('../../repositories/rolePermissionRepository.js');
const userPermissionRepository = require('../../repositories/userPermissionRepository.js');
const prisma = require('../../config/prisma.js');
const cacheService = require('../cache/redisCacheService.js');

const CACHE_VERSION = 'v1';
const DEFAULT_CACHE_TTL_SECONDS = 3600;
const USER_SCOPE_MODULE_CODE = 'USER_SCOPE';

const USER_PROFILE_FIELDS = {
  userId: true,
  email: true,
  name: true,
  zoneId: true,
  stateId: true,
  districtId: true,
  orgId: true,
  kvkId: true,
  deletedAt: true,
};

function userProfileCacheKey(userId) {
  return `user:profile:${userId}:${CACHE_VERSION}`;
}

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

/**
 * Strict per-module intersection between the role's permissions and the
 * user's per-module grants. A user cannot exceed the role ceiling; a user
 * missing a specific (module, action) pair simply does not get that cell.
 *
 * @param {Record<string, string[]>} rolePermissionsByModule
 * @param {Array<{ moduleCode: string, action: string }>} userModuleGrants
 * @returns {Record<string, string[]>}
 */
function intersectWithUserModuleGrants(rolePermissionsByModule, userModuleGrants) {
  const userKeys = new Set(userModuleGrants.map((g) => `${g.moduleCode}:${g.action}`));
  const result = {};

  for (const [moduleCode, actions] of Object.entries(rolePermissionsByModule)) {
    const filtered = actions.filter((action) => userKeys.has(`${moduleCode}:${action}`));
    if (filtered.length > 0) {
      result[moduleCode] = filtered;
    }
  }

  return result;
}

const permissionResolverService = {
  /**
   * Fetch user profile fields needed by auth middleware.
   * Returns null if user does not exist.
   *
   * @param {number} userId
   * @param {{ bypassCache?: boolean }} [options]
   * @returns {Promise<object|null>}
   */
  getUserProfile: async (userId, options = {}) => {
    const bypassCache = options.bypassCache === true;
    const key = userProfileCacheKey(userId);

    if (!bypassCache) {
      const cached = await cacheService.get(key);
      if (cached !== null) {
        return cached;
      }
    }

    const user = await prisma.user.findUnique({
      where: { userId },
      select: USER_PROFILE_FIELDS,
    });

    if (!user) return null;

    await cacheService.set(key, user, getCacheTtlSeconds());
    return user;
  },

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
    const userPermissionRows = await userPermissionRepository.getUserPermissionsWithModule(userId);

    // Split the user's raw rows into legacy ceiling (USER_SCOPE, flat action
    // list) vs real per-module grants. If any per-module grant exists we
    // switch to strict per-module intersection; otherwise we fall back to the
    // legacy ceiling so pre-existing users keep their current effective access.
    const userScopeActions = [];
    const userModuleGrants = [];
    for (const row of userPermissionRows) {
      if (row.moduleCode === USER_SCOPE_MODULE_CODE) {
        userScopeActions.push(row.action);
      } else {
        userModuleGrants.push({ moduleCode: row.moduleCode, action: row.action });
      }
    }

    let effectivePermissions;
    if (userModuleGrants.length > 0) {
      effectivePermissions = intersectWithUserModuleGrants(rolePermissionsByModule, userModuleGrants);
    } else if (userScopeActions.length > 0) {
      effectivePermissions = intersectWithUserActions(rolePermissionsByModule, userScopeActions);
    } else {
      effectivePermissions = {};
    }

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
    await cacheService.del(userProfileCacheKey(userId));
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
