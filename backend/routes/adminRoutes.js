const express = require('express');
const router = express.Router();

const userManagementController = require('../controllers/userManagementController.js');
const rolePermissionController = require('../controllers/rolePermissionController.js');
const logHistoryController = require('../controllers/logHistoryController.js');
const notificationController = require('../controllers/notificationController.js');
const moduleImageController = require('../controllers/moduleImageController.js');
const targetController = require('../controllers/targetController.js');
const technicalAchievementSummaryController = require('../controllers/technicalAchievementSummaryController.js');
const prisma = require('../config/prisma.js');
const { authenticateToken, requirePermission } = require('../middleware/auth.js');
const { strictRateLimiter, apiRateLimiter } = require('../middleware/rateLimiter.js');
const { getRoleLevel } = require('../constants/roleHierarchy.js');

// Module codes (must match seed data and frontend module codes)
const USER_MANAGEMENT_MODULE = 'user_management_users';
const ROLE_MANAGEMENT_MODULE = 'role_management_roles';
const LOG_HISTORY_MODULE = 'log_history';
const NOTIFICATIONS_MODULE = 'notifications';
const MODULE_IMAGES_MODULE = 'module_images';
const TARGETS_MODULE = 'targets';
const TECHNICAL_SUMMARY_MODULE = 'achievements_technical_achievement_summary';
const HIDDEN_ROLE_NAMES = new Set(['zone_admin']);

// Apply authentication to all admin routes.
// Individual routes use requirePermission for granular access control
// driven by the Role Permission Editor — no blanket role gate needed.
router.use(authenticateToken);

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

// Login activity logs – requires VIEW
router.get('/log-history', apiRateLimiter, requirePermission(LOG_HISTORY_MODULE, 'VIEW'), logHistoryController.getLogHistory);

// Distinct KVK options for log-history filter – requires VIEW
router.get('/log-history/kvks', apiRateLimiter, requirePermission(LOG_HISTORY_MODULE, 'VIEW'), logHistoryController.getKvkOptions);

// Distinct user options for log-history filter – requires VIEW
router.get('/log-history/users', apiRateLimiter, requirePermission(LOG_HISTORY_MODULE, 'VIEW'), logHistoryController.getUserOptions);

// Notifications
router.get('/notifications', apiRateLimiter, requirePermission(NOTIFICATIONS_MODULE, 'VIEW'), notificationController.listForCurrentUser);
router.get('/notifications/recent', apiRateLimiter, requirePermission(NOTIFICATIONS_MODULE, 'VIEW'), notificationController.getRecentForCurrentUser);
router.get('/notifications/unread-count', apiRateLimiter, requirePermission(NOTIFICATIONS_MODULE, 'VIEW'), notificationController.getUnreadCountForCurrentUser);
router.get('/notifications/users', apiRateLimiter, requirePermission(NOTIFICATIONS_MODULE, 'VIEW'), notificationController.getRecipientUsers);
router.post('/notifications', strictRateLimiter, requirePermission(NOTIFICATIONS_MODULE, 'ADD'), notificationController.createNotification);
router.patch('/notifications/read-all', strictRateLimiter, requirePermission(NOTIFICATIONS_MODULE, 'VIEW'), notificationController.markAllAsRead);
router.patch('/notifications/:userNotificationId/read', strictRateLimiter, requirePermission(NOTIFICATIONS_MODULE, 'VIEW'), notificationController.markAsRead);

// Module Images
router.get('/module-images/categories', apiRateLimiter, requirePermission(MODULE_IMAGES_MODULE, 'VIEW'), moduleImageController.getCategories);
router.get('/module-images/kvks', apiRateLimiter, requirePermission(MODULE_IMAGES_MODULE, 'VIEW'), moduleImageController.getKvkOptions);
router.get('/module-images', apiRateLimiter, requirePermission(MODULE_IMAGES_MODULE, 'VIEW'), moduleImageController.list);
router.post('/module-images', strictRateLimiter, requirePermission(MODULE_IMAGES_MODULE, 'ADD'), moduleImageController.create);
router.get('/module-images/:imageId/file', apiRateLimiter, requirePermission(MODULE_IMAGES_MODULE, 'VIEW'), moduleImageController.getFile);

// Targets
router.get('/targets/types', apiRateLimiter, requirePermission(TARGETS_MODULE, 'VIEW'), targetController.getTypeOptions);
router.get('/targets/kvks', apiRateLimiter, requirePermission(TARGETS_MODULE, 'VIEW'), targetController.getKvkOptions);
router.get('/targets', apiRateLimiter, requirePermission(TARGETS_MODULE, 'VIEW'), targetController.list);
router.post('/targets', strictRateLimiter, requirePermission(TARGETS_MODULE, 'ADD'), targetController.create);
router.put('/targets/:targetId', strictRateLimiter, requirePermission(TARGETS_MODULE, 'EDIT'), targetController.update);
router.delete('/targets/:targetId', strictRateLimiter, requirePermission(TARGETS_MODULE, 'DELETE'), targetController.remove);

// Technical Achievement Summary
router.get(
  '/technical-achievement-summary/options',
  apiRateLimiter,
  requirePermission(TECHNICAL_SUMMARY_MODULE, 'VIEW'),
  technicalAchievementSummaryController.getFilterOptions,
);
router.get(
  '/technical-achievement-summary',
  apiRateLimiter,
  requirePermission(TECHNICAL_SUMMARY_MODULE, 'VIEW'),
  technicalAchievementSummaryController.getSummary,
);

// Create role – requires ADD on role management (must be before /roles/:roleId)
router.post(
  '/roles',
  strictRateLimiter,
  requirePermission(ROLE_MANAGEMENT_MODULE, 'ADD'),
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

      const visibleRoles = filtered.filter((r) => !HIDDEN_ROLE_NAMES.has(r.roleName));
      res.json(visibleRoles.map(({ hierarchyLevel: _, ...r }) => r));
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
