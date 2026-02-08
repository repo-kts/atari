const rolePermissionService = require('../services/rolePermissionService.js');

/**
 * Controller for role permission management
 */
const rolePermissionController = {
  /**
   * GET /api/admin/roles/:roleId/permissions
   * Get all modules with permissions for a role
   */
  getRolePermissions: async (req, res) => {
    try {
      const { roleId } = req.params;
      const id = Number(roleId);
      if (Number.isNaN(id) || !Number.isInteger(id)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }

      const data = await rolePermissionService.getRolePermissions(id);
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * PUT /api/admin/roles/:roleId/permissions
   * Update role permissions (bulk update)
   */
  updateRolePermissions: async (req, res) => {
    try {
      const { roleId } = req.params;
      const id = Number(roleId);
      if (Number.isNaN(id) || !Number.isInteger(id)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }

      const { permissionIds } = req.body;
      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ error: 'permissionIds must be an array' });
      }

      const updatedBy = req.user.userId;
      const result = await rolePermissionService.updateRolePermissions(id, permissionIds, updatedBy);

      res.status(200).json({
        message: 'Role permissions updated successfully',
        count: result.count,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = rolePermissionController;
