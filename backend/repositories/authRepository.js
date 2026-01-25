const prisma = require('../config/prisma');

const authRepository = {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<object|null>} User object with role or null
   */
  findUserByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  },

  /**
   * Find user by ID with role
   * @param {number} userId - User ID
   * @returns {Promise<object|null>} User object with role or null
   */
  findUserById: async (userId) => {
    return await prisma.user.findUnique({
      where: { userId },
      include: {
        role: true,
      },
    });
  },

  /**
   * Create a new refresh token
   * @param {number} userId - User ID
   * @param {string} token - JWT refresh token string
   * @param {Date} expiresAt - Token expiration date
   * @returns {Promise<object>} Created refresh token
   */
  createRefreshToken: async (userId, token, expiresAt) => {
    return await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  /**
   * Find refresh token by token string
   * @param {string} token - JWT refresh token string
   * @returns {Promise<object|null>} Refresh token with user or null
   */
  findRefreshToken: async (token) => {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  /**
   * Revoke a refresh token (mark as revoked)
   * @param {string} token - JWT refresh token string
   * @returns {Promise<object>} Updated refresh token
   */
  revokeRefreshToken: async (token) => {
    return await prisma.refreshToken.update({
      where: { token },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  /**
   * Revoke all refresh tokens for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Number of tokens revoked
   */
  revokeAllUserTokens: async (userId) => {
    const result = await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null, // Only revoke tokens that aren't already revoked
      },
      data: {
        revokedAt: new Date(),
      },
    });
    return result.count;
  },

  /**
   * Update user's last login timestamp
   * @param {number} userId - User ID
   * @returns {Promise<object>} Updated user
   */
  updateLastLogin: async (userId) => {
    return await prisma.user.update({
      where: { userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  },

  /**
   * Delete expired refresh tokens (cleanup)
   * @returns {Promise<number>} Number of tokens deleted
   */
  deleteExpiredTokens: async () => {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Less than current date
        },
      },
    });
    return result.count;
  },

  /**
   * Check if refresh token is valid (not revoked and not expired)
   * @param {string} token - JWT refresh token string
   * @returns {Promise<boolean>} True if token is valid
   */
  isRefreshTokenValid: async (token) => {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      return false;
    }

    // Check if revoked
    if (refreshToken.revokedAt) {
      return false;
    }

    // Check if expired
    if (refreshToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  },
};

module.exports = authRepository;
