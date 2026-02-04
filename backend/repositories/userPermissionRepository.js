const prisma = require('../config/prisma');

/**
 * Repository for user-level permissions (UserPermission).
 * Used when admins create users and assign granular View/Add/Edit/Delete.
 */
const userPermissionRepository = {
  /**
   * Add permission(s) to a user (e.g. after admin creates user with selected actions).
   * @param {number} userId - User ID
   * @param {number[]} permissionIds - Array of permission IDs (VIEW, ADD, EDIT, DELETE for USER_SCOPE module)
   * @returns {Promise<{ count: number }>} Number of records created
   */
  addUserPermissions: async (userId, permissionIds) => {
    if (!permissionIds?.length) {
      return { count: 0 };
    }

    const data = permissionIds.map((permissionId) => ({
      userId,
      permissionId,
    }));

    const result = await prisma.userPermission.createMany({
      data,
      skipDuplicates: true,
    });

    return { count: result.count };
  },

  /**
   * Get the list of permission actions (e.g. VIEW, ADD, EDIT, DELETE) assigned to a user.
   * @param {number} userId - User ID
   * @returns {Promise<string[]>} Array of action names (e.g. ['VIEW', 'EDIT'])
   */
  getUserPermissionActions: async (userId) => {
    const rows = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: {
          select: { action: true },
        },
      },
    });

    return rows.map((r) => r.permission.action);
  },

  /**
   * Remove all user-level permissions for a user (e.g. before reassigning).
   * @param {number} userId - User ID
   * @returns {Promise<{ count: number }>} Number of records deleted
   */
  removeAllUserPermissions: async (userId) => {
    const result = await prisma.userPermission.deleteMany({
      where: { userId },
    });
    return { count: result.count };
  },

  /**
   * Set user permissions: replace existing with the given set.
   * @param {number} userId - User ID
   * @param {number[]} permissionIds - New permission IDs
   * @returns {Promise<{ count: number }>} Number of records created
   */
  setUserPermissions: async (userId, permissionIds) => {
    await userPermissionRepository.removeAllUserPermissions(userId);
    return userPermissionRepository.addUserPermissions(userId, permissionIds);
  },

  /**
   * Get permission actions for multiple users (batch, for list responses).
   * @param {number[]} userIds - User IDs
   * @returns {Promise<Record<number, string[]>>} Map of userId -> ['VIEW', 'EDIT', ...]
   */
  getPermissionsForUserIds: async (userIds) => {
    if (!userIds?.length) return {};
    const rows = await prisma.userPermission.findMany({
      where: { userId: { in: userIds } },
      include: { permission: { select: { action: true } } },
    });
    const map = {};
    for (const uid of userIds) {
      map[uid] = [];
    }
    for (const r of rows) {
      if (!map[r.userId]) map[r.userId] = [];
      map[r.userId].push(r.permission.action);
    }
    return map;
  },
};

module.exports = userPermissionRepository;
