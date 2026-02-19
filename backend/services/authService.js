const authRepository = require('../repositories/authRepository.js');
const userPermissionRepository = require('../repositories/userPermissionRepository.js');
const rolePermissionRepository = require('../repositories/rolePermissionRepository.js');
const { comparePassword } = require('../utils/password.js');
const { generateAccessToken, generateRefreshToken, verifyToken, decodeToken } = require('../utils/jwt.js');
const { validateEmail } = require('../utils/validation.js');

/**
 * Build the permissionsByModule map for a user.
 *
 * For *_user roles (state_user, district_user, org_user):
 *   The role defines the ceiling (which modules/actions are available).
 *   The user's individual actions (set at creation time) act as a filter.
 *   Effective = role permissions  ∩  user-level actions.
 *   Modules where no actions survive the intersection are dropped entirely.
 *
 * For all other roles (admins, kvk, etc.):
 *   Role permissions are returned as-is — no user-level filtering.
 *
 * @param {number} roleId
 * @param {string} roleName
 * @param {number} userId
 * @returns {{ permissionsByModule: Record<string, string[]>, userActions: string[] }}
 */
async function buildPermissionsByModule(roleId, roleName, userId) {
    const permissionsByModule = await rolePermissionRepository.getRolePermissionsByModule(roleId);
    let userActions = [];

    if (roleName.endsWith('_user')) {
        userActions = await userPermissionRepository.getUserPermissionActions(userId);
        if (userActions.length > 0) {
            // Intersection: keep only the actions the individual user was granted
            for (const code of Object.keys(permissionsByModule)) {
                permissionsByModule[code] = permissionsByModule[code].filter(a => userActions.includes(a));
                if (permissionsByModule[code].length === 0) {
                    delete permissionsByModule[code];
                }
            }
        }
    }

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

        // Build permissions before generating the token so they can be embedded in it.
        // For *_user roles the result is the intersection of role-level permissions
        // and the user's individually assigned actions.
        const { permissionsByModule, userActions } = await buildPermissionsByModule(
            user.roleId,
            user.role.roleName,
            user.userId,
        );

        // Generate access token with permissions embedded (zero DB queries on subsequent requests)
        const accessToken = generateAccessToken(user.userId, user.roleId, user.role.roleName, permissionsByModule);

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

        // Build permissions to embed in the new access token
        const { permissionsByModule } = await buildPermissionsByModule(
            tokenRecord.user.roleId,
            tokenRecord.user.role.roleName,
            tokenRecord.userId,
        );

        // Generate new access token with permissions embedded
        const accessToken = generateAccessToken(
            tokenRecord.userId,
            tokenRecord.user.roleId,
            tokenRecord.user.role.roleName,
            permissionsByModule,
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
    logout: async (refreshToken) => {
        try {
            const decoded = verifyToken(refreshToken, 'refresh');
            await authRepository.revokeAllUserTokens(decoded.userId);
            return true;
        } catch (error) {
            // Token may be expired/invalid — try decoding without verification
            // so we can still revoke all tokens for the user
            try {
                const decoded = decodeToken(refreshToken);
                if (decoded?.userId) {
                    await authRepository.revokeAllUserTokens(decoded.userId);
                }
            } catch {}
            return true;
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

        // Build permissions: for *_user roles the result is the intersection of
        // role-level permissions and the user's individually assigned actions.
        const { permissionsByModule, userActions } = await buildPermissionsByModule(
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
