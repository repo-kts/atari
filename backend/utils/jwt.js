require('dotenv').config();
const jwt = require('jsonwebtoken');


if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Bitmask encoding for permission actions.
// Reduces JWT size by ~50%: ["VIEW","ADD","EDIT","DELETE"] (30 bytes) → 15 (2 bytes).
const ACTION_BITS = { VIEW: 1, ADD: 2, EDIT: 4, DELETE: 8 };
const BITS_TO_ACTIONS = Object.fromEntries(
  Object.entries(ACTION_BITS).map(([action, bit]) => [bit, action])
);

/**
 * Encode permissionsByModule as bitmask for compact JWT storage.
 *   { "module_code": ["VIEW","ADD","EDIT","DELETE"] }
 *   → { "module_code": 15 }
 * @param {Record<string, string[]>} permissionsByModule
 * @returns {Record<string, number>}
 */
function encodePermissions(permissionsByModule) {
  const encoded = {};
  for (const [moduleCode, actions] of Object.entries(permissionsByModule)) {
    let mask = 0;
    for (const action of actions) {
      mask |= ACTION_BITS[action] || 0;
    }
    if (mask > 0) encoded[moduleCode] = mask;
  }
  return encoded;
}

/**
 * Decode bitmask permissions back to string arrays.
 *   { "module_code": 15 }
 *   → { "module_code": ["VIEW","ADD","EDIT","DELETE"] }
 * Also handles legacy tokens that still have the old string[] format.
 * @param {Record<string, number|string[]>} encoded
 * @returns {Record<string, string[]>}
 */
function decodePermissions(encoded) {
  if (!encoded || typeof encoded !== 'object') return {};
  const decoded = {};
  for (const [moduleCode, value] of Object.entries(encoded)) {
    if (Array.isArray(value)) {
      // Legacy format — already decoded
      decoded[moduleCode] = value;
    } else if (typeof value === 'number') {
      const actions = [];
      for (const [bit, action] of Object.entries(BITS_TO_ACTIONS)) {
        if (value & Number(bit)) actions.push(action);
      }
      decoded[moduleCode] = actions;
    }
  }
  return decoded;
}

/**
 * Generate access token (short-lived, 1 hour).
 *
 * Permissions are embedded in the token as a bitmask so that every subsequent
 * request can be authorised with zero DB queries (see auth.js requirePermission).
 *
 * Bitmask encoding: VIEW=1, ADD=2, EDIT=4, DELETE=8. This cuts the permissions
 * payload by ~50%, keeping even 74-module roles under the ~4 KB cookie limit.
 * super_admin is still bypassed in authService.js (empty map) as an optimisation.
 *
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @param {string} roleName - Role name
 * @param {Record<string, string[]>} permissionsByModule - Effective permissions map
 * @returns {string} JWT access token
 */
function generateAccessToken(userId, roleId, roleName, permissionsByModule = {}) {
  const payload = {
    userId,
    roleId,
    roleName,
    permissions: encodePermissions(permissionsByModule),
    type: 'access',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
}

/**
 * Generate refresh token (long-lived, 7 days)
 * @param {number} userId - User ID
 * @param {number} tokenId - Refresh token ID from database
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(userId, tokenId) {
  const payload = {
    userId,
    tokenId,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token, type = 'access') {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify token type matches
    if (decoded.type !== type) {
      throw new Error(`Invalid token type. Expected ${type}, got ${decoded.type}`);
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
}

/**
 * Decode token without verification (for debugging/logging)
 * @param {string} token - JWT token to decode
 * @returns {object|null} Decoded token payload or null if invalid
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  decodePermissions,
};
