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

    // Fetch user from database to ensure they still exist and are active.
    // roleName and permissionsByModule come from the token (embedded at login/refresh).
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
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
      roleId: decoded.roleId,
      roleName: decoded.roleName,
      permissionsByModule: decoded.permissions || {},
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
 * Permissions are embedded in the JWT at login/refresh — no DB query needed.
 * @param {string} moduleCode - Module code (e.g., 'user_management_users')
 * @param {string} action - Permission action (VIEW, ADD, EDIT, DELETE)
 * @returns {Function} Express middleware function
 */
function requirePermission(moduleCode, action) {
  const normalizedAction = action.toUpperCase();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const modulePerms = req.user.permissionsByModule?.[moduleCode];
    if (!modulePerms?.includes(normalizedAction)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `You don't have permission to ${normalizedAction} in ${moduleCode}`,
      });
    }

    next();
  };
}

/**
 * Like requirePermission, but passes if the user has the given action on ANY
 * of the provided module codes. Useful for aggregated endpoints that span
 * multiple modules (e.g. /stats for OFT + FLD + CFLD).
 * @param {string[]} moduleCodes
 * @param {string} action
 */
function requireAnyPermission(moduleCodes, action) {
  const normalizedAction = action.toUpperCase();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasAny = moduleCodes.some((code) =>
      req.user.permissionsByModule?.[code]?.includes(normalizedAction)
    );

    if (!hasAny) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `${normalizedAction} permission required for at least one of: ${moduleCodes.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireAnyPermission,
};
