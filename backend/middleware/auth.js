const { verifyToken } = require('../utils/jwt.js');
const prisma = require('../config/prisma.js');

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
 * Middleware to require specific permission
 * @param {string} moduleCode - Module code (e.g., 'user_management')
 * @param {string} action - Permission action (VIEW, ADD, EDIT, DELETE)
 * @returns {Function} Express middleware function
 */
function requirePermission(moduleCode, action) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Find the module
      const module = await prisma.module.findUnique({
        where: { moduleCode },
        include: {
          permissions: {
            where: {
              action: action.toUpperCase(),
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

      // Check if user's role has the required permission
      const hasPermission = module.permissions.some(
        (permission) => permission.rolePermissions.length > 0
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `You don't have permission to ${action} in ${moduleCode}`,
        });
      }

      next();
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
};
