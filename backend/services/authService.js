const authRepository = require('../repositories/authRepository.js');
const logHistoryService = require('./logHistoryService.js');
const permissionResolverService = require('./auth/permissionResolverService.js');
const { comparePassword } = require('../utils/password.js');
const { generateAccessToken, generateRefreshToken, verifyToken, decodeToken } = require('../utils/jwt.js');
const { validateEmail } = require('../utils/validation.js');

/**
 * Resolve the permissionsByModule map for the login / /me response.
 *
 * Single source of truth: permissionResolverService.getEffectivePermissions.
 * Same function the authenticateToken middleware uses on every request, so
 * the frontend's cached permissions always match what the backend enforces.
 *
 * For *_user roles the resolver handles both per-module rows (strict
 * intersection) and legacy USER_SCOPE rows (flat ceiling fallback). Admin
 * roles return their role permissions as-is.
 *
 * The flat `userActions` field is preserved for backward compatibility
 * with older login response consumers, but is derived from the effective
 * module map rather than from raw UserPermission rows — previously it was
 * "user has some row carrying action X" which silently widened access to
 * every module in the role's ceiling.
 *
 * @param {number} roleId
 * @param {string} roleName
 * @param {number} userId
 * @returns {Promise<{ permissionsByModule: Record<string, string[]>, userActions: string[] }>}
 */
async function resolvePermissionsForResponse(roleId, roleName, userId) {
    const permissionsByModule = await permissionResolverService.getEffectivePermissions({
        userId,
        roleId,
        roleName,
    });
    const userActions = Array.from(
        new Set(Object.values(permissionsByModule).flat()),
    );
    return { permissionsByModule, userActions };
}

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
    login: async (email, password, context = {}) => {
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

        // Build permissions via the shared resolver so the login response
        // reflects exactly what the authenticateToken middleware will enforce
        // on subsequent requests.
        const { permissionsByModule, userActions } = await resolvePermissionsForResponse(
            user.roleId,
            user.role.roleName,
            user.userId,
        );

        // Generate compact access token (identity claims only).
        const accessToken = generateAccessToken(user.userId, user.roleId, user.role.roleName);

        // Calculate refresh token expiration (7 days from now)
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

        // Create refresh token atomically (temp value → JWT update in one transaction)
        const { token: refreshToken } = await authRepository.createRefreshTokenAtomic(
            user.userId,
            refreshExpiresAt,
            generateRefreshToken
        );

        // Update last login timestamp
        await authRepository.updateLastLogin(user.userId);

        // Activity log (best-effort; should not block login).
        try {
            await logHistoryService.recordAuthActivity({
                userId: user.userId,
                userName: user.name,
                userEmail: user.email,
                roleName: user.role?.roleName,
                zoneId: user.zoneId,
                stateId: user.stateId,
                districtId: user.districtId,
                orgId: user.orgId,
                kvkId: user.kvkId,
                kvkName: user.kvk?.kvkName || null,
                activity: 'LOGIN',
                ipAddress: context.ipAddress || null,
                userAgent: context.userAgent || null,
            });
        } catch (logError) {
            console.error('Failed to write login activity log:', logError.message);
        }

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
                permissions: userActions.length ? userActions : undefined,
                permissionsByModule: Object.keys(permissionsByModule).length ? permissionsByModule : undefined,
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

        // Generate compact access token (identity claims only).
        const accessToken = generateAccessToken(
            tokenRecord.userId,
            tokenRecord.user.roleId,
            tokenRecord.user.role.roleName,
        );

        // Rotate refresh token: revoke old, create new
        await authRepository.revokeRefreshToken(refreshToken);

        const newRefreshExpiresAt = new Date();
        newRefreshExpiresAt.setDate(newRefreshExpiresAt.getDate() + 7);

        const { token: newRefreshToken } = await authRepository.createRefreshTokenAtomic(
            tokenRecord.userId,
            newRefreshExpiresAt,
            generateRefreshToken
        );

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
    logout: async (refreshToken, context = {}) => {
        let logUser = null;
        try {
            const decoded = verifyToken(refreshToken, 'refresh');
            await authRepository.revokeAllUserTokens(decoded.userId);
            logUser = await authRepository.findUserById(decoded.userId);
        } catch (error) {
            // Token may be expired/invalid — try decoding without verification
            // so we can still revoke all tokens for the user
            try {
                const decoded = decodeToken(refreshToken);
                if (decoded?.userId) {
                    await authRepository.revokeAllUserTokens(decoded.userId);
                    logUser = await authRepository.findUserById(decoded.userId);
                }
            } catch { }
        }

        // Activity log (best-effort; should not block logout).
        if (logUser) {
            try {
                await logHistoryService.recordAuthActivity({
                    userId: logUser.userId,
                    userName: logUser.name,
                    userEmail: logUser.email,
                    roleName: logUser.role?.roleName,
                    zoneId: logUser.zoneId,
                    stateId: logUser.stateId,
                    districtId: logUser.districtId,
                    orgId: logUser.orgId,
                    kvkId: logUser.kvkId,
                    kvkName: logUser.kvk?.kvkName || null,
                    activity: 'LOGOUT',
                    ipAddress: context.ipAddress || null,
                    userAgent: context.userAgent || null,
                });
            } catch (logError) {
                console.error('Failed to write logout activity log:', logError.message);
            }
        }

        return true;
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

        // Shared resolver — same function the middleware uses on every request,
        // so /auth/me and permission gates can never disagree.
        const { permissionsByModule, userActions } = await resolvePermissionsForResponse(
            user.roleId,
            user.role.roleName,
            user.userId,
        );

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
            permissions: userActions.length ? userActions : undefined,
            permissionsByModule: Object.keys(permissionsByModule).length ? permissionsByModule : undefined,
        };
    },
};

module.exports = authService;
