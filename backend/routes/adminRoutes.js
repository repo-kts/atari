const express = require('express');
const router = express.Router();

const userManagementController = require('../controllers/userManagementController.js');
const rolePermissionController = require('../controllers/rolePermissionController.js');
const prisma = require('../config/prisma.js');
const { authenticateToken, requireRole, requirePermission } = require('../middleware/auth.js');
const { strictRateLimiter, apiRateLimiter } = require('../middleware/rateLimiter.js');
const { getRoleLevel } = require('../constants/roleHierarchy.js');

// Module code for user management (same as USER_SCOPE for role-based permission fallback)
const USER_MANAGEMENT_MODULE = 'USER_SCOPE';

// Apply authentication and role check to all admin routes.
// Note: 'kvk' is included here intentionally so KVK users can access specific
// admin-scoped endpoints where their scope is enforced in the service layer.
// See:
//   - seedRoles.js for role definitions (kvk is a non-admin, scoped role)
//   - userManagementService.js for per-role hierarchy validations and access checks
router.use(
  authenticateToken,
  requireRole(['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk']),
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

// Get role permissions (all modules with hasPermission flags) – requires VIEW
router.get(
  '/roles/:roleId/permissions',
  apiRateLimiter,
  requirePermission(USER_MANAGEMENT_MODULE, 'VIEW'),
  rolePermissionController.getRolePermissions,
);

// Update role permissions (bulk update) – requires EDIT
router.put(
  '/roles/:roleId/permissions',
  strictRateLimiter,
  requirePermission(USER_MANAGEMENT_MODULE, 'EDIT'),
  rolePermissionController.updateRolePermissions,
);

module.exports = router;

