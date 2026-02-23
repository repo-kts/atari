const crypto = require('crypto');
const prisma = require('../config/prisma.js');

const authRepository = {
    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<object|null>} User object with role or null
     */
    findUserByEmail: async (email) => {

        const result = await prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: {
                role: true,
            },
        });
        return result;
    },

    /**
     * Find user by ID with role
     * @param {number} userId - User ID
     * @returns {Promise<object|null>} User object with role or null
     */
    findUserById: async (userId) => {
        return await prisma.user.findFirst({
            where: { userId, deletedAt: null },
            include: {
                role: true,
            },
        });
    },

    /**
     * Find KVK name by kvkId (raw query — avoids Prisma include issue)
     * @param {number} kvkId - KVK ID
     * @returns {Promise<string|null>} KVK name or null
     */
    findKvkNameById: async (kvkId) => {
        if (!kvkId) return null;
        const rows = await prisma.$queryRawUnsafe(
            `SELECT kvk_name FROM kvk WHERE kvk_id = $1 LIMIT 1`,
            parseInt(String(kvkId))
        );
        return (rows && rows.length > 0) ? rows[0].kvk_name : null;
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
     * Update refresh token value (e.g. after generating JWT with tokenId)
     * @param {number} tokenId - Refresh token ID
     * @param {string} token - JWT refresh token string
     * @returns {Promise<object>} Updated refresh token
     */
    updateRefreshToken: async (tokenId, token) => {
        return await prisma.refreshToken.update({
            where: { tokenId },
            data: { token },
        });
    },

    /**
     * Atomically create a refresh token: insert with temp value, generate JWT
     * containing the tokenId, then update the record — all in one transaction.
     * @param {number} userId - User ID
     * @param {Date} expiresAt - Token expiration date
     * @param {function} generateToken - (userId, tokenId) => JWT string
     * @returns {Promise<{tokenId: number, token: string}>} Created token record
     */
    createRefreshTokenAtomic: async (userId, expiresAt, generateToken) => {
        return await prisma.$transaction(async (tx) => {
            const tempToken = `temp_${userId}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
            const record = await tx.refreshToken.create({
                data: { userId, token: tempToken, expiresAt },
            });
            const jwt = generateToken(userId, record.tokenId);
            await tx.refreshToken.update({
                where: { tokenId: record.tokenId },
                data: { token: jwt },
            });
            return { tokenId: record.tokenId, token: jwt };
        });
    },

    /**
     * Find refresh token by token string
     * @param {string} token - JWT refresh token string
     * @returns {Promise<object|null>} Refresh token with user or null
     */
    findRefreshToken: async (token) => {
        return await prisma.refreshToken.findFirst({
            where: {
                token,
                user: { deletedAt: null },
            },
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
        const refreshToken = await prisma.refreshToken.findFirst({
            where: {
                token,
                revokedAt: null,
                expiresAt: { gt: new Date() },
                user: { deletedAt: null },
            },
        });

        return !!refreshToken;
    },
};

module.exports = authRepository;
