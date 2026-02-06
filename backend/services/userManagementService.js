const userRepository = require('../repositories/userRepository');
const { hashPassword } = require('../utils/password');
const { validateEmail, validatePassword, validateRoleId, sanitizeInput, validatePhoneNumber } = require('../utils/validation');
const prisma = require('../config/prisma');

/**
 * Service layer for user management operations
 */
const userManagementService = {
  /**
   * Create a new user
   * @param {object} userData - User data (name, email, roleId, etc.)
   * @param {string} password - Plain text password
   * @param {number} createdBy - User ID of the creator
   * @returns {Promise<object>} Created user
   * @throws {Error} If validation fails or user creation fails
   */
  createUser: async (userData, password, createdBy) => {
    // Validate required fields
    if (!userData.name || !userData.email || !password) {
      throw new Error('Name, email, and password are required');
    }

    // Validate email format
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Validate role ID
    if (!validateRoleId(userData.roleId)) {
      throw new Error('Invalid role ID');
    }

    // Validate phone number (optional)
    if (userData.phoneNumber) {
      const phoneValidation = validatePhoneNumber(userData.phoneNumber);
      if (!phoneValidation.valid) {
        throw new Error(phoneValidation.errors.join(', '));
      }
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Validate hierarchy assignment based on role
    await userManagementService.validateHierarchyAssignment(
      userData.roleId,
      userData.zoneId,
      userData.stateId,
      userData.districtId,
      userData.orgId,
      userData.kvkId
    );

    // Normalize inputs (trim). XSS handled by JSON responses and frontend output encoding.
    const sanitizedData = {
      name: sanitizeInput(userData.name),
      email: userData.email.toLowerCase().trim(),
      phoneNumber: userData.phoneNumber ? userData.phoneNumber.replace(/[\s\-()]/g, '') : null,
      roleId: userData.roleId,
      zoneId: userData.zoneId || null,
      stateId: userData.stateId || null,
      districtId: userData.districtId || null,
      orgId: userData.orgId || null,
      kvkId: userData.kvkId || null,
    };

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userRepository.createUserWithPassword(sanitizedData, passwordHash);

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleId: user.roleId,
      roleName: user.role.roleName,
      zoneId: user.zoneId,
      stateId: user.stateId,
      districtId: user.districtId,
      orgId: user.orgId,
      kvkId: user.kvkId,
      createdAt: user.createdAt,
    };
  },

  /**
   * Validate hierarchy assignment based on role
   * @param {number} roleId - Role ID
   * @param {number|null} zoneId - Zone ID
   * @param {number|null} stateId - State ID
   * @param {number|null} districtId - District ID
   * @param {number|null} orgId - Organization ID
   * @param {number|null} kvkId - KVK ID
   * @throws {Error} If hierarchy assignment is invalid
   */
  validateHierarchyAssignment: async (roleId, zoneId, stateId, districtId, orgId, kvkId) => {
    // Get role name
    const role = await prisma.role.findUnique({
      where: { roleId },
    });

    if (!role) {
      throw new Error('Invalid role ID');
    }

    const roleName = role.roleName;

    // Validate hierarchy based on role
    switch (roleName) {
      case 'super_admin':
        // Super admin can have any hierarchy or none
        break;

      case 'zone_admin': {
        if (!zoneId) {
          throw new Error('Zone admin must be assigned to a zone');
        }
        // Verify zone exists
        const zone = await prisma.zone.findUnique({ where: { zoneId } });
        if (!zone) {
          throw new Error('Invalid zone ID');
        }
        break;
      }

      case 'state_admin': {
        if (!stateId) {
          throw new Error('State admin must be assigned to a state');
        }
        // Verify state exists
        const state = await prisma.stateMaster.findUnique({ where: { stateId } });
        if (!state) {
          throw new Error('Invalid state ID');
        }
        break;
      }

      case 'district_admin': {
        if (!districtId) {
          throw new Error('District admin must be assigned to a district');
        }
        // Verify district exists
        const district = await prisma.districtMaster.findUnique({ where: { districtId } });
        if (!district) {
          throw new Error('Invalid district ID');
        }
        break;
      }

      case 'org_admin': {
        if (!orgId) {
          throw new Error('Organization admin must be assigned to an organization');
        }
        // Verify org exists
        const org = await prisma.orgMaster.findUnique({ where: { orgId } });
        if (!org) {
          throw new Error('Invalid organization ID');
        }
        break;
      }

      case 'kvk':
        if (!kvkId) {
          throw new Error('KVK user must be assigned to a KVK');
        }
        // Note: KVK model might not exist yet, so we'll skip validation for now
        // You can add KVK validation when the KVK schema is ready
        break;

      default:
        throw new Error('Unknown role');
    }
  },

  /**
   * Get users for admin based on their scope
   * @param {number} adminUserId - Admin user ID
   * @param {object} filters - Additional filters (roleId, search, etc.)
   * @returns {Promise<array>} Array of users
   */
  getUsersForAdmin: async (adminUserId, filters = {}) => {
    // Get admin user info
    const adminUser = await userRepository.findById(adminUserId);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const adminRole = adminUser.role.roleName;

    // Build filters based on admin's scope
    let hierarchyFilters = {};

    switch (adminRole) {
      case 'super_admin':
        // Super admin can see all users
        break;

      case 'zone_admin':
        if (!adminUser.zoneId) {
          throw new Error('Admin user must be assigned to a zone');
        }
        hierarchyFilters.zoneId = adminUser.zoneId;
        break;

      case 'state_admin':
        if (!adminUser.stateId) {
          throw new Error('Admin user must be assigned to a state');
        }
        hierarchyFilters.stateId = adminUser.stateId;
        break;

      case 'district_admin':
        if (!adminUser.districtId) {
          throw new Error('Admin user must be assigned to a district');
        }
        hierarchyFilters.districtId = adminUser.districtId;
        break;

      case 'org_admin':
        if (!adminUser.orgId) {
          throw new Error('Admin user must be assigned to an organization');
        }
        hierarchyFilters.orgId = adminUser.orgId;
        break;

      default:
        throw new Error('User does not have permission to view users');
    }

    // Merge with additional filters (hierarchyFilters take precedence so enforced scope cannot be bypassed)
    const finalFilters = { ...filters, ...hierarchyFilters };

    // Get users
    let users = await userRepository.findUsersByHierarchy(finalFilters);

    // Apply role filter if provided
    if (filters.roleId) {
      users = users.filter((user) => user.roleId === filters.roleId);
    }

    // Apply search filter if provided
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
      );
    }

    return users;
  },

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {object} userData - Updated user data
   * @param {number} updatedBy - User ID of the updater
   * @returns {Promise<object>} Updated user
   * @throws {Error} If validation fails or user not found
   */
  updateUser: async (userId, userData, updatedBy) => {
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (existingUser.deletedAt) {
      throw new Error('Cannot update deleted user');
    }

    // Validate email if provided
    if (userData.email && userData.email !== existingUser.email) {
      if (!validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Check if new email already exists
      const emailUser = await userRepository.findByEmail(userData.email);
      if (emailUser && emailUser.userId !== userId) {
        throw new Error('Email already exists');
      }
    }

    const nextRoleId = userData.roleId ?? existingUser.roleId;
    const nextZoneId = userData.zoneId !== undefined ? userData.zoneId : existingUser.zoneId;
    const nextStateId = userData.stateId !== undefined ? userData.stateId : existingUser.stateId;
    const nextDistrictId =
      userData.districtId !== undefined ? userData.districtId : existingUser.districtId;
    const nextOrgId = userData.orgId !== undefined ? userData.orgId : existingUser.orgId;
    const nextKvkId = userData.kvkId !== undefined ? userData.kvkId : existingUser.kvkId;

    const hierarchyChanged =
      userData.roleId !== undefined ||
      userData.zoneId !== undefined ||
      userData.stateId !== undefined ||
      userData.districtId !== undefined ||
      userData.orgId !== undefined ||
      userData.kvkId !== undefined;

    if (hierarchyChanged) {
      if (!validateRoleId(nextRoleId)) {
        throw new Error('Invalid role ID');
      }
      await userManagementService.validateHierarchyAssignment(
        nextRoleId,
        nextZoneId,
        nextStateId,
        nextDistrictId,
        nextOrgId,
        nextKvkId
      );
    }

    // Normalize inputs (trim). XSS handled by JSON responses and frontend output encoding.
    const sanitizedData = {};
    if (userData.name) sanitizedData.name = sanitizeInput(userData.name);
    if (userData.email) sanitizedData.email = userData.email.toLowerCase().trim();
    if (userData.roleId) sanitizedData.roleId = userData.roleId;
    if (userData.zoneId !== undefined) sanitizedData.zoneId = userData.zoneId || null;
    if (userData.stateId !== undefined) sanitizedData.stateId = userData.stateId || null;
    if (userData.districtId !== undefined) sanitizedData.districtId = userData.districtId || null;
    if (userData.orgId !== undefined) sanitizedData.orgId = userData.orgId || null;
    if (userData.kvkId !== undefined) sanitizedData.kvkId = userData.kvkId || null;

    // Update user
    const updatedUser = await userRepository.update(userId, sanitizedData);

    return {
      userId: updatedUser.userId,
      name: updatedUser.name,
      email: updatedUser.email,
      roleId: updatedUser.roleId,
      roleName: updatedUser.role.roleName,
      zoneId: updatedUser.zoneId,
      stateId: updatedUser.stateId,
      districtId: updatedUser.districtId,
      orgId: updatedUser.orgId,
      kvkId: updatedUser.kvkId,
      updatedAt: updatedUser.updatedAt,
    };
  },

  /**
   * Delete user (soft delete)
   * @param {number} userId - User ID
   * @param {number} deletedBy - User ID of the deleter
   * @returns {Promise<boolean>} True if deleted
   * @throws {Error} If user not found
   */
  deleteUser: async (userId, deletedBy) => {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.deletedAt) {
      throw new Error('User already deleted');
    }

    // Prevent self-deletion
    if (userId === deletedBy) {
      throw new Error('Cannot delete your own account');
    }

    // Soft delete user
    await userRepository.softDeleteUser(userId);

    // Revoke all refresh tokens for the user
    const authRepository = require('../repositories/authRepository');
    await authRepository.revokeAllUserTokens(userId);

    return true;
  },
};

module.exports = userManagementService;
