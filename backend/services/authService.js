const crypto = require('crypto');
const authRepository = require('../repositories/authRepository.js');
const userPermissionRepository = require('../repositories/userPermissionRepository.js');
const { comparePassword } = require('../utils/password.js');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt.js');
const { validateEmail } = require('../utils/validation.js');

/**
 * Service layer for authentication operations
 */
const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} { user, accessToken, refreshToken }
   * @throws {Error} If credentials are invalid
   */
  login: async (email, password) => {
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Find user by email
    const user = await authRepository.findUserByEmail(email);

    if (!user || user.deletedAt) {
      // Always run bcrypt even when user not found to prevent timing attacks
      await comparePassword(password, '$2b$10$invalidhashfortimingatttack000000000000000000');
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate access token
    const accessToken = generateAccessToken(user.userId, user.roleId);

    // Calculate refresh token expiration (7 days from now)
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    // Create refresh token with unique temporary value, then update with real JWT
    const tempToken = `temp_${user.userId}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;

    const refreshTokenRecord = await authRepository.createRefreshToken(
      user.userId,
      tempToken,
      refreshExpiresAt
    );
    const refreshToken = generateRefreshToken(user.userId, refreshTokenRecord.tokenId);
    await authRepository.updateRefreshToken(refreshTokenRecord.tokenId, refreshToken);

    // Update last login timestamp
    await authRepository.updateLastLogin(user.userId);

    // User-level permissions (granular VIEW/ADD/EDIT/DELETE for admin-created users)
    const permissionActions = await userPermissionRepository.getUserPermissionActions(user.userId);

    // Return user data (without password hash) and tokens
    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.roleName,
        zoneId: user.zoneId,
        stateId: user.stateId,
        districtId: user.districtId,
        orgId: user.orgId,
        kvkId: user.kvkId,
        permissions: permissionActions.length ? permissionActions : undefined,
      },
      accessToken,
      refreshToken,
    };
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - JWT refresh token
   * @returns {Promise<object>} { accessToken, refreshToken }
   * @throws {Error} If refresh token is invalid
   */
  refreshAccessToken: async (refreshToken) => {
    // Verify refresh token JWT
    let decoded;
    try {
      decoded = verifyToken(refreshToken, 'refresh');
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // Find refresh token in database
    const tokenRecord = await authRepository.findRefreshToken(refreshToken);
    if (!tokenRecord) {
      throw new Error('Refresh token not found');
    }

    // Check if token is valid (not revoked, not expired)
    const isValid = await authRepository.isRefreshTokenValid(refreshToken);
    if (!isValid) {
      throw new Error('Refresh token has been revoked or expired');
    }

    // Verify token matches user
    if (tokenRecord.userId !== decoded.userId || tokenRecord.tokenId !== decoded.tokenId) {
      throw new Error('Token mismatch');
    }

    // Check if user still exists and is active
    if (tokenRecord.user.deletedAt) {
      throw new Error('User account has been deleted');
    }

    // Generate new access token
    const accessToken = generateAccessToken(tokenRecord.userId, tokenRecord.user.roleId);

    // Rotate refresh token: revoke old, create new
    await authRepository.revokeRefreshToken(refreshToken);

    const newRefreshExpiresAt = new Date();
    newRefreshExpiresAt.setDate(newRefreshExpiresAt.getDate() + 7);

    const tempToken = `temp_${tokenRecord.userId}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    const newTokenRecord = await authRepository.createRefreshToken(
      tokenRecord.userId,
      tempToken,
      newRefreshExpiresAt
    );
    const newRefreshToken = generateRefreshToken(tokenRecord.userId, newTokenRecord.tokenId);
    await authRepository.updateRefreshToken(newTokenRecord.tokenId, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },

  /**
   * Logout user by revoking refresh token
   * @param {string} refreshToken - JWT refresh token to revoke
   * @returns {Promise<boolean>} True if logout successful
   */
  logout: async (refreshToken) => {
    try {
      // Verify token format first
      verifyToken(refreshToken, 'refresh');

      // Revoke the token — use findFirst to avoid throwing if already revoked/missing
      const tokenRecord = await authRepository.findRefreshToken(refreshToken);
      if (tokenRecord && !tokenRecord.revokedAt) {
        await authRepository.revokeRefreshToken(refreshToken);
      }
      return true;
    } catch (error) {
      // If token is invalid/expired, consider logout successful
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return true;
      }
      throw error;
    }
  },

  /**
   * Validate user credentials (internal use)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object|null>} User object if valid, null otherwise
   */
  validateUserCredentials: async (email, password) => {
    try {
      const user = await authRepository.findUserByEmail(email);
      if (!user || user.deletedAt) {
        return null;
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return null;
      }

      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        roleName: user.role.roleName,
      };
    } catch (error) {
      console.error('Error validating credentials:', error);
      return null;
    }
  },

  /**
   * Get current user info (for /me endpoint)
   * @param {number} userId - User ID
   * @returns {Promise<object>} User object
   * @throws {Error} If user not found
   */
  getCurrentUser: async (userId) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.deletedAt) {
      throw new Error('User account has been deleted');
    }

    const permissionActions = await userPermissionRepository.getUserPermissionActions(user.userId);

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.roleName,
      zoneId: user.zoneId,
      stateId: user.stateId,
      districtId: user.districtId,
      orgId: user.orgId,
      kvkId: user.kvkId,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      permissions: permissionActions.length ? permissionActions : undefined,
    };
  },
};

module.exports = authService;
