const rolePermissionRepository = require('../repositories/rolePermissionRepository.js');
const prisma = require('../config/prisma.js');

/**
 * Service layer for role permission management
 */
const rolePermissionService = {
  /**
   * Get all modules with permissions for a role (annotated with hasPermission).
   * @param {number} roleId - Role ID
   * @returns {Promise<object>} { roleId, roleName, modules: [...] }
   * @throws {Error} If role not found
   */
  getRolePermissions: async (roleId) => {
    const role = await prisma.role.findUnique({ where: { roleId } });
    if (!role) {
      throw new Error('Role not found');
    }

    const modules = await rolePermissionRepository.getRolePermissionsStructured(roleId);

    return {
      roleId: role.roleId,
      roleName: role.roleName,
      description: role.description,
      modules,
    };
  },

  /**
   * Update role permissions (replace all with the given set).
   * @param {number} roleId - Role ID
   * @param {number[]} permissionIds - Array of permission IDs to assign
   * @param {number} updatedBy - User ID performing the update
   * @returns {Promise<{ count: number }>} Number of permissions set
   * @throws {Error} If validation fails
   */
  updateRolePermissions: async (roleId, permissionIds, updatedBy) => {
    // Validate role exists
    const role = await prisma.role.findUnique({ where: { roleId } });
    if (!role) {
      throw new Error('Role not found');
    }

    // Validate permissionIds exist (all of them)
    if (permissionIds.length > 0) {
      const existingPermissions = await prisma.permission.findMany({
        where: { permissionId: { in: permissionIds } },
        select: { permissionId: true },
      });
      const existingIds = new Set(existingPermissions.map((p) => p.permissionId));
      const invalidIds = permissionIds.filter((id) => !existingIds.has(id));
      if (invalidIds.length > 0) {
        throw new Error(`Invalid permission IDs: ${invalidIds.join(', ')}`);
      }
    }

    // Update permissions
    const result = await rolePermissionRepository.setRolePermissions(roleId, permissionIds);
    return result;
  },
};

module.exports = rolePermissionService;
