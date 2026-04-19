const prisma = require('../config/prisma.js');
const userRepository = require('../repositories/userRepository.js');
const userPermissionRepository = require('../repositories/userPermissionRepository.js');
const rolePermissionRepository = require('../repositories/rolePermissionRepository.js');
const { outranks } = require('../constants/roleHierarchy.js');
const permissionResolverService = require('./auth/permissionResolverService.js');

const USER_SCOPE_MODULE_CODE = 'USER_SCOPE';

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Build the per-user permission matrix: every module with every action,
 * annotated with whether the user has it granted, and whether the user's
 * role even allows it (the ceiling). The UI uses `roleGrants` to disable
 * cells outside the ceiling.
 *
 * @param {number} userId - Target user ID
 * @param {number} callerUserId - ID of the caller (for hierarchy check)
 * @returns {Promise<object>}
 */
async function getUserPermissionsMatrix(userId, callerUserId) {
  const targetUser = await userRepository.findById(userId);
  if (!targetUser) {
    throw httpError(404, 'User not found');
  }

  const targetRoleName = targetUser.role?.roleName || '';
  if (!targetRoleName.endsWith('_user')) {
    throw httpError(400, 'Per-user permissions are only configurable for *_user roles');
  }

  const caller = await userRepository.findById(callerUserId);
  if (!caller) throw httpError(403, 'Caller not found');
  const callerRoleName = caller.role?.roleName || '';

  if (callerRoleName !== 'super_admin' && !outranks(callerRoleName, targetUser.role)) {
    throw httpError(403, 'You do not have permission to view this user\'s permissions');
  }

  const [roleModules, userRows] = await Promise.all([
    rolePermissionRepository.getRolePermissionsStructured(targetUser.roleId),
    userPermissionRepository.getUserPermissionsWithModule(userId),
  ]);

  const userGrantKeys = new Set();
  const userScopeActions = new Set();
  for (const row of userRows) {
    if (row.moduleCode === USER_SCOPE_MODULE_CODE) {
      userScopeActions.add(row.action);
    } else {
      userGrantKeys.add(`${row.moduleCode}:${row.action}`);
    }
  }

  const hasPerModuleGrants = userGrantKeys.size > 0;

  const modules = roleModules
    .filter((m) => m.moduleCode !== USER_SCOPE_MODULE_CODE)
    .map((m) => ({
      moduleId: m.moduleId,
      menuName: m.menuName,
      subMenuName: m.subMenuName,
      moduleCode: m.moduleCode,
      permissions: m.permissions.map((p) => {
        const roleGrants = p.hasPermission;
        let userHas;
        if (hasPerModuleGrants) {
          userHas = roleGrants && userGrantKeys.has(`${m.moduleCode}:${p.action}`);
        } else {
          userHas = roleGrants && userScopeActions.has(p.action);
        }
        return {
          permissionId: p.permissionId,
          action: p.action,
          roleGrants,
          hasPermission: userHas,
        };
      }),
    }));

  return {
    userId: targetUser.userId,
    name: targetUser.name,
    email: targetUser.email,
    roleId: targetUser.roleId,
    roleName: targetRoleName,
    modules,
  };
}

/**
 * Replace a user's per-module permissions. Silently clears any legacy
 * USER_SCOPE ceiling rows so the resolver switches to strict per-module
 * intersection for this user.
 *
 * Guardrails:
 *   - target user exists and has a *_user role
 *   - caller strictly outranks target (super_admin bypasses)
 *   - every permissionId is a real permission
 *   - every permissionId sits inside the target role's ceiling
 *
 * @param {number} userId - Target user ID
 * @param {number[]} permissionIds - Desired set
 * @param {number} callerUserId - Caller user ID
 */
async function updateUserPermissions(userId, permissionIds, callerUserId, options = {}) {
  if (!Array.isArray(permissionIds)) {
    throw httpError(400, 'permissionIds must be an array');
  }

  // Validate every entry is a positive integer BEFORE dedup, so duplicates
  // don't masquerade as "invalid positive integers".
  for (const id of permissionIds) {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) {
      throw httpError(400, 'permissionIds must contain positive integers');
    }
  }
  const uniqueIds = Array.from(new Set(permissionIds.map((id) => Number(id))));

  const targetUser = await userRepository.findById(userId);
  if (!targetUser) {
    throw httpError(404, 'User not found');
  }

  const targetRoleName = targetUser.role?.roleName || '';
  if (!targetRoleName.endsWith('_user')) {
    throw httpError(400, 'Per-user permissions are only configurable for *_user roles');
  }

  const caller = await userRepository.findById(callerUserId);
  if (!caller) throw httpError(403, 'Caller not found');
  const callerRoleName = caller.role?.roleName || '';

  if (callerRoleName !== 'super_admin' && !outranks(callerRoleName, targetUser.role)) {
    throw httpError(403, 'You do not have permission to edit this user\'s permissions');
  }

  // Safety net: saving an empty set wipes both per-module rows AND legacy
  // USER_SCOPE ceiling rows, leaving the user with zero effective access.
  // Require explicit confirmation so an accidental "save with nothing checked"
  // can't silently strip a user.
  if (uniqueIds.length === 0 && !options.allowEmpty) {
    throw httpError(
      400,
      'Saving zero permissions will strip all access from this user. Pass allowEmpty: true to confirm.'
    );
  }

  if (uniqueIds.length > 0) {
    // Load every requested permission with its module, in one query.
    const rows = await prisma.permission.findMany({
      where: { permissionId: { in: uniqueIds } },
      select: {
        permissionId: true,
        module: { select: { moduleCode: true } },
      },
    });

    if (rows.length !== uniqueIds.length) {
      const known = new Set(rows.map((r) => r.permissionId));
      const invalid = uniqueIds.filter((id) => !known.has(id));
      throw httpError(400, `Invalid permission IDs: ${invalid.join(', ')}`);
    }

    // Disallow USER_SCOPE rows — those belong to the legacy ceiling path.
    const userScopeHit = rows.find((r) => r.module?.moduleCode === USER_SCOPE_MODULE_CODE);
    if (userScopeHit) {
      throw httpError(400, 'USER_SCOPE permissions cannot be set via the per-user editor');
    }

    // Enforce role ceiling.
    const roleCeiling = new Set(
      await rolePermissionRepository.getRolePermissionIds(targetUser.roleId)
    );
    const outside = uniqueIds.filter((id) => !roleCeiling.has(id));
    if (outside.length > 0) {
      throw httpError(
        400,
        `Permission(s) ${outside.join(', ')} are outside the user's role ceiling`
      );
    }
  }

  const result = await userPermissionRepository.setUserModulePermissions(userId, uniqueIds);

  // Best-effort cache invalidation.
  try {
    await permissionResolverService.invalidateUserPermissions(userId);
  } catch (error) {
    console.error('Permission cache invalidation failed after user permission update:', error.message);
  }

  return result;
}

module.exports = {
  getUserPermissionsMatrix,
  updateUserPermissions,
};
