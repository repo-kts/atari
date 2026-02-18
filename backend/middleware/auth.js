const { verifyToken } = require('../utils/jwt.js');
const prisma = require('../config/prisma.js');
const userPermissionRepository = require('../repositories/userPermissionRepository.js');

/**
 * Middleware to authenticate JWT token from HTTP-only cookie
 * Attaches user info to req.user if token is valid
 */
async function authenticateToken(req, res, next) {
  try {
    // Get token from cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = verifyToken(token, 'access');

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is soft-deleted
    if (user.deletedAt) {
      return res.status(401).json({ error: 'User account has been deleted' });
    }

    // Attach user info to request object
    req.user = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName: user.role.roleName,
      zoneId: user.zoneId,
      stateId: user.stateId,
      districtId: user.districtId,
      orgId: user.orgId,
      kvkId: user.kvkId,
    };

    next();
  } catch (error) {
    if (error.message === 'Token has expired') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to require specific role(s)
 * @param {string|string[]} allowedRoles - Role name(s) allowed to access
 * @returns {Function} Express middleware function
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.roleName;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Middleware to require specific permission.
 * Checks user-level permissions (UserPermission) first; if the user has any user-level
 * permissions, only those actions are allowed. Otherwise falls back to role-based permissions.
 * @param {string} moduleCode - Module code (e.g., 'user_management')
 * @param {string} action - Permission action (VIEW, ADD, EDIT, DELETE)
 * @returns {Function} Express middleware function
 */
function requirePermission(moduleCode, action) {
  const normalizedAction = action.toUpperCase();

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const userId = req.user.userId;

      // 1. Check user-level permissions for *_user roles (intersection with role ceiling)
      const userActions = await userPermissionRepository.getUserPermissionActions(userId);
      const isUserRole = req.user.roleName.endsWith('_user');

      if (isUserRole && userActions.length > 0) {
        // *_user roles: action must be in BOTH the user's own actions AND the role's permissions.
        // First check the user-level gate (fast path).
        if (!userActions.includes(normalizedAction)) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: `You don't have permission to ${normalizedAction} in ${moduleCode}`,
          });
        }
        // Then check the role ceiling for this specific module (fall through to role check below).
        // (If role doesn't have this action for this module, it is denied there.)
      } else if (!isUserRole && userActions.length > 0) {
        // Non-*_user roles with user-level permissions: allow if action is in userActions.
        if (userActions.includes(normalizedAction)) {
          return next();
        }
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `You don't have permission to ${normalizedAction} in ${moduleCode}`,
        });
      }

      // 2. Role-based check (always reached for *_user roles; fallback for others)
      const module = await prisma.module.findUnique({
        where: { moduleCode },
        include: {
          permissions: {
            where: {
              action: normalizedAction,
            },
            include: {
              rolePermissions: {
                where: {
                  roleId: req.user.roleId,
                },
              },
            },
          },
        },
      });

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      const hasPermission = module.permissions.some(
        (permission) => permission.rolePermissions.length > 0
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `You don't have permission to ${normalizedAction} in ${moduleCode}`,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Like requirePermission, but passes if the user has the given action on ANY
 * of the provided module codes. Useful for aggregated endpoints that span
 * multiple modules (e.g. /stats for OFT + FLD + CFLD).
 * Applies the same *_user intersection logic as requirePermission.
 * @param {string[]} moduleCodes
 * @param {string} action
 */
function requireAnyPermission(moduleCodes, action) {
  const normalizedAction = action.toUpperCase();

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const userActions = await userPermissionRepository.getUserPermissionActions(req.user.userId);
      const isUserRole = req.user.roleName.endsWith('_user');

      if (isUserRole && userActions.length > 0) {
        // *_user: user-level gate first, then fall through to role check below
        if (!userActions.includes(normalizedAction)) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: `You don't have permission to ${normalizedAction}`,
          });
        }
      } else if (!isUserRole && userActions.length > 0) {
        if (userActions.includes(normalizedAction)) return next();
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `You don't have permission to ${normalizedAction}`,
        });
      }

      // Role-based check: pass if the role has the action on ANY of the modules
      for (const moduleCode of moduleCodes) {
        const module = await prisma.module.findUnique({
          where: { moduleCode },
          include: {
            permissions: {
              where: { action: normalizedAction },
              include: { rolePermissions: { where: { roleId: req.user.roleId } } },
            },
          },
        });
        if (module && module.permissions.some((p) => p.rolePermissions.length > 0)) {
          return next();
        }
      }

      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `${normalizedAction} permission required for at least one of: ${moduleCodes.join(', ')}`,
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireAnyPermission,
};
