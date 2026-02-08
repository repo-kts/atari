const prisma = require('../config/prisma');

/**
 * Repository for role-based permissions (RolePermission).
 * Maps roles to permissions (modules + actions).
 */
const rolePermissionRepository = {
  /**
   * Get all permission IDs assigned to a role.
   * @param {number} roleId - Role ID
   * @returns {Promise<number[]>} Array of permission IDs
   */
  getRolePermissionIds: async (roleId) => {
    const rows = await prisma.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true },
    });
    return rows.map((r) => r.permissionId);
  },

  /**
   * Set role permissions: replace all existing permissions with the given set.
   * @param {number} roleId - Role ID
   * @param {number[]} permissionIds - New permission IDs
   * @returns {Promise<{ count: number }>} Number of records created
   */
  setRolePermissions: async (roleId, permissionIds) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Delete existing permissions
      await tx.rolePermission.deleteMany({ where: { roleId } });

      // 2. Create new permissions
      if (permissionIds.length === 0) {
        return { count: 0 };
      }

      const data = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      }));

      const result = await tx.rolePermission.createMany({
        data,
        skipDuplicates: true,
      });

      return { count: result.count };
    });
  },

  /**
   * Get all modules with their permissions, annotated with whether the role has each permission.
   * @param {number} roleId - Role ID
   * @returns {Promise<array>} Array of modules with permissions and hasPermission flags
   */
  getRolePermissionsStructured: async (roleId) => {
    // Get all modules with permissions
    const modules = await prisma.module.findMany({
      include: {
        permissions: {
          select: {
            permissionId: true,
            action: true,
          },
          orderBy: { action: 'asc' },
        },
      },
      orderBy: [{ menuName: 'asc' }, { subMenuName: 'asc' }],
    });

    // Get which permissions this role has
    const rolePermissionIds = await rolePermissionRepository.getRolePermissionIds(roleId);
    const rolePermSet = new Set(rolePermissionIds);

    // Annotate each permission with hasPermission flag
    return modules.map((module) => ({
      moduleId: module.moduleId,
      menuName: module.menuName,
      subMenuName: module.subMenuName,
      moduleCode: module.moduleCode,
      permissions: module.permissions.map((p) => ({
        permissionId: p.permissionId,
        action: p.action,
        hasPermission: rolePermSet.has(p.permissionId),
      })),
    }));
  },
};

module.exports = rolePermissionRepository;
