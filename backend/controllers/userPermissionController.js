const userPermissionService = require('../services/userPermissionService.js');

const userPermissionController = {
  /**
   * GET /api/admin/users/:id/permissions
   * Return the per-user permission matrix (role ceiling + user grants).
   */
  getUserPermissions: async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const data = await userPermissionService.getUserPermissionsMatrix(id, req.user.userId);
      res.status(200).json(data);
    } catch (error) {
      res.status(error.statusCode || 400).json({ error: error.message });
    }
  },

  /**
   * PUT /api/admin/users/:id/permissions
   * Replace the user's per-module permission grants.
   */
  updateUserPermissions: async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { permissionIds, allowEmpty } = req.body;
      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ error: 'permissionIds must be an array' });
      }

      const result = await userPermissionService.updateUserPermissions(
        id,
        permissionIds,
        req.user.userId,
        { allowEmpty: allowEmpty === true }
      );

      res.status(200).json({
        message: 'User permissions updated successfully',
        count: result.count,
      });
    } catch (error) {
      res.status(error.statusCode || 400).json({ error: error.message });
    }
  },
};

module.exports = userPermissionController;
