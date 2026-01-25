// Controller layer - handles HTTP requests/responses for user management (admin)
const userManagementService = require('../services/userManagementService');
const userRepository = require('../repositories/userRepository');

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
        roleId,
        zoneId,
        stateId,
        districtId,
        orgId,
        kvkId,
        password,
      } = req.body;

      if (!name || !email || !roleId || !password) {
        return res
          .status(400)
          .json({ error: 'Name, email, roleId, and password are required' });
      }

      const createdBy = req.user.userId;

      const user = await userManagementService.createUser(
        { name, email, roleId, zoneId, stateId, districtId, orgId, kvkId },
        password,
        createdBy,
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
      if (req.query.roleId) filters.roleId = parseInt(req.query.roleId, 10);
      if (req.query.search) filters.search = req.query.search;
      if (req.query.zoneId) filters.zoneId = parseInt(req.query.zoneId, 10);
      if (req.query.stateId) filters.stateId = parseInt(req.query.stateId, 10);
      if (req.query.districtId)
        filters.districtId = parseInt(req.query.districtId, 10);
      if (req.query.orgId) filters.orgId = parseInt(req.query.orgId, 10);
      if (req.query.kvkId) filters.kvkId = parseInt(req.query.kvkId, 10);

      const users = await userManagementService.getUsersForAdmin(
        adminUserId,
        filters,
      );

      res.status(200).json(users);
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

      res.status(200).json(user);
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

