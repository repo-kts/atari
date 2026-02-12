const rolePermissionRepository = require('../repositories/rolePermissionRepository.js');
const prisma = require('../config/prisma.js');
const userRepository = require('../repositories/userRepository.js');
const { outranks, outranksOrEqual } = require('../constants/roleHierarchy.js');

/**
 * Service layer for role permission management
 */
const rolePermissionService = {
  /**
   * Get all modules with permissions for a role (annotated with hasPermission).
   * @param {number} roleId - Role ID
   * @param {number} [callerUserId] - User ID of the caller (for hierarchy check)
   * @returns {Promise<object>} { roleId, roleName, modules: [...] }
   * @throws {Error} If role not found or caller lacks access
   */
  getRolePermissions: async (roleId, callerUserId = null) => {
    const role = await prisma.role.findUnique({ where: { roleId } });
    if (!role) {
      throw new Error('Role not found');
    }

    // Enforce hierarchy: caller must outrank or equal the target role
    if (callerUserId) {
      const caller = await userRepository.findById(callerUserId);
      if (!caller) throw new Error('Caller not found');
      const callerRole = caller.role.roleName;
      // Only super_admin can view any role's permissions; others must outrank or equal
      if (callerRole !== 'super_admin') {
        if (!outranksOrEqual(callerRole, role.roleName)) {
          throw new Error('You can only view permissions for roles at your level or below');
        }
      }
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

    // Enforce hierarchy: caller must outrank or equal the target role to edit its permissions
    const caller = await userRepository.findById(updatedBy);
    if (!caller) throw new Error('Caller not found');
    const callerRole = caller.role.roleName;
    // Only super_admin can edit any role's permissions; others must outrank or equal
    if (callerRole !== 'super_admin') {
      if (!outranksOrEqual(callerRole, role.roleName)) {
        throw new Error('You can only edit permissions for roles at your level or below');
      }
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
