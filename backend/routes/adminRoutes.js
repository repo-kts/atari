const express = require('express');
const router = express.Router();

const userManagementController = require('../controllers/userManagementController.js');
const rolePermissionController = require('../controllers/rolePermissionController.js');
const prisma = require('../config/prisma.js');
const { authenticateToken, requireRole, requirePermission } = require('../middleware/auth.js');
const { strictRateLimiter, apiRateLimiter } = require('../middleware/rateLimiter.js');
const { getRoleLevel } = require('../constants/roleHierarchy.js');

// Module codes (must match seed data and frontend module codes)
const USER_MANAGEMENT_MODULE = 'user_management_users';
const ROLE_MANAGEMENT_MODULE = 'role_management_roles';

// Apply authentication and role check to all admin routes.
// kvk_admin is included as an admin role that can manage users within its KVK scope.
// kvk_user does NOT have access here — it relies on granular permissions only.
router.use(
  authenticateToken,
  requireRole(['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk_admin']),
);

// List users (with filters) – requires VIEW
router.get('/users', apiRateLimiter, requirePermission(USER_MANAGEMENT_MODULE, 'VIEW'), userManagementController.getUsers);

// Create user – requires ADD
router.post('/users', strictRateLimiter, requirePermission(USER_MANAGEMENT_MODULE, 'ADD'), userManagementController.createUser);

// Get single user – requires VIEW
router.get('/users/:id', apiRateLimiter, requirePermission(USER_MANAGEMENT_MODULE, 'VIEW'), userManagementController.getUserById);

// Update user – requires EDIT
router.put('/users/:id', strictRateLimiter, requirePermission(USER_MANAGEMENT_MODULE, 'EDIT'), userManagementController.updateUser);

// Delete user (soft delete) – requires DELETE
router.delete('/users/:id', strictRateLimiter, requirePermission(USER_MANAGEMENT_MODULE, 'DELETE'), userManagementController.deleteUser);

// Create role – super_admin only (must be before /roles/:roleId)
router.post(
  '/roles',
  strictRateLimiter,
  requireRole(['super_admin']),
  rolePermissionController.createRole,
);

// Get all roles (for dropdowns)
router.get(
  '/roles',
  apiRateLimiter,
  requirePermission(USER_MANAGEMENT_MODULE, 'VIEW'),
  async (req, res) => {
    try {
      const callerRole = req.user.roleName;
      const callerLevel = getRoleLevel(callerRole);

      const roles = await prisma.role.findMany({
        select: { roleId: true, roleName: true, description: true, hierarchyLevel: true },
        orderBy: { roleId: 'asc' },
      });

      // Super admin sees all roles; others see roles at their level or below
      const filtered =
        callerRole === 'super_admin'
          ? roles
          : roles.filter((r) => {
              const roleLevel = r.hierarchyLevel ?? getRoleLevel(r.roleName);
              return roleLevel >= callerLevel;
            });

      res.json(filtered.map(({ hierarchyLevel: _, ...r }) => r));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  },
);

// Get role permissions (all modules with hasPermission flags) – requires VIEW on role_management_roles
router.get(
  '/roles/:roleId/permissions',
  apiRateLimiter,
  requirePermission(ROLE_MANAGEMENT_MODULE, 'VIEW'),
  rolePermissionController.getRolePermissions,
);

// Update role permissions (bulk update) – requires EDIT on role_management_roles
router.put(
  '/roles/:roleId/permissions',
  strictRateLimiter,
  requirePermission(ROLE_MANAGEMENT_MODULE, 'EDIT'),
  rolePermissionController.updateRolePermissions,
);

module.exports = router;

