// Controller layer - handles HTTP requests/responses for user management (admin)
const userManagementService = require('../services/userManagementService.js');
const userRepository = require('../repositories/userRepository.js');
const userPermissionRepository = require('../repositories/userPermissionRepository.js');

const userManagementController = {
  /**
   * POST /api/admin/users
   * Create a new user (admin only)
   */
  createUser: async (req, res) => {
    try {
      const {
        name,
        email,
        phoneNumber,
        roleId,
        zoneId,
        stateId,
        districtId,
        orgId,
        kvkId,
        password,
        permissions,
      } = req.body;

      if (!name || !email || !roleId || !password) {
        return res
          .status(400)
          .json({ error: 'Name, email, roleId, and password are required' });
      }

      const createdBy = req.user.userId;
      const user = await userManagementService.createUser(
        { name, email, phoneNumber, roleId, zoneId, stateId, districtId, orgId, kvkId },
        password,
        createdBy,
        { permissions: Array.isArray(permissions) ? permissions : undefined },
      );

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/users
   * Get users based on admin scope and filters
   */
  getUsers: async (req, res) => {
    try {
      const adminUserId = req.user.userId;

      const filters = {};
      if (req.query.roleId) {
        const roleId = Number(req.query.roleId);
        if (!Number.isInteger(roleId)) {
          return res.status(400).json({ error: 'Invalid roleId' });
        }
        filters.roleId = roleId;
      }
      if (req.query.search) filters.search = req.query.search;
      if (req.query.zoneId) {
        const zoneId = Number(req.query.zoneId);
        if (!Number.isInteger(zoneId)) {
          return res.status(400).json({ error: 'Invalid zoneId' });
        }
        filters.zoneId = zoneId;
      }
      if (req.query.stateId) {
        const stateId = Number(req.query.stateId);
        if (!Number.isInteger(stateId)) {
          return res.status(400).json({ error: 'Invalid stateId' });
        }
        filters.stateId = stateId;
      }
      if (req.query.districtId) {
        const districtId = Number(req.query.districtId);
        if (!Number.isInteger(districtId)) {
          return res.status(400).json({ error: 'Invalid districtId' });
        }
        filters.districtId = districtId;
      }
      if (req.query.orgId) {
        const orgId = Number(req.query.orgId);
        if (!Number.isInteger(orgId)) {
          return res.status(400).json({ error: 'Invalid orgId' });
        }
        filters.orgId = orgId;
      }
      if (req.query.kvkId) {
        const kvkId = Number(req.query.kvkId);
        if (!Number.isInteger(kvkId)) {
          return res.status(400).json({ error: 'Invalid kvkId' });
        }
        filters.kvkId = kvkId;
      }

      const users = await userManagementService.getUsersForAdmin(
        adminUserId,
        filters,
      );

      const userIds = users.map((u) => u.userId);
      const permissionsMap = await userPermissionRepository.getPermissionsForUserIds(userIds);

      // Map to safe response: flat roleName, include phoneNumber and permissions
      const safeUsers = users.map((u) => ({
        userId: u.userId,
        name: u.name,
        email: u.email,
        phoneNumber: u.phoneNumber ?? null,
        roleId: u.roleId,
        roleName: u.role?.roleName ?? null,
        zoneId: u.zoneId,
        stateId: u.stateId,
        districtId: u.districtId,
        orgId: u.orgId,
        kvkId: u.kvkId,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        permissions: permissionsMap[u.userId] ?? [],
      }));

      res.status(200).json(safeUsers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/users/:id
   * Get a single user by ID
   */
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(id);

      if (!user || user.deletedAt) {
        return res.status(404).json({ error: 'User not found' });
      }

      const permissions = await userPermissionRepository.getUserPermissionActions(user.userId);

      const safeUser = {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber ?? null,
        roleId: user.roleId,
        roleName: user.role?.roleName ?? null,
        zoneId: user.zoneId,
        stateId: user.stateId,
        districtId: user.districtId,
        orgId: user.orgId,
        kvkId: user.kvkId,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        permissions,
      };
      res.status(200).json(safeUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * PUT /api/admin/users/:id
   * Update a user
   */
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedBy = req.user.userId;
      const userId = parseInt(id, 10);

      const updatedUser = await userManagementService.updateUser(
        userId,
        req.body,
        updatedBy,
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * DELETE /api/admin/users/:id
   * Soft delete a user
   */
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedBy = req.user.userId;
      const userId = parseInt(id, 10);

      await userManagementService.deleteUser(userId, deletedBy);

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = userManagementController;

