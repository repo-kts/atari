const express = require('express');
const router = express.Router();

const userManagementController = require('../controllers/userManagementController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { strictRateLimiter, apiRateLimiter } = require('../middleware/rateLimiter');

// Apply authentication and admin role check to all admin routes
router.use(
  authenticateToken,
  requireRole(['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin']),
);

// List users (with filters)
router.get('/users', apiRateLimiter, userManagementController.getUsers);

// Create user
router.post('/users', strictRateLimiter, userManagementController.createUser);

// Get single user
router.get('/users/:id', apiRateLimiter, userManagementController.getUserById);

// Update user
router.put('/users/:id', strictRateLimiter, userManagementController.updateUser);

// Delete user (soft delete)
router.delete('/users/:id', strictRateLimiter, userManagementController.deleteUser);

module.exports = router;

