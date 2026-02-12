const userRepository = require('../repositories/userRepository.js');
const userPermissionRepository = require('../repositories/userPermissionRepository.js');
const { hashPassword } = require('../utils/password.js');
const { validateEmail, validatePassword, validateRoleId, sanitizeInput, validatePhoneNumber } = require('../utils/validation.js');
const prisma = require('../config/prisma.js');
const authRepository = require('../repositories/authRepository.js');
const { isAdminRole, outranksOrEqual } = require('../constants/roleHierarchy.js');

const USER_SCOPE_MODULE_CODE = 'USER_SCOPE';
const VALID_PERMISSION_ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE'];

/** Non-admin roles that each creator role can assign (admins cannot create other admins) */
const ALLOWED_ROLES_FOR_CREATOR = {
  zone_admin: ['state_user', 'district_user', 'org_user', 'kvk'],
  state_admin: ['state_user', 'district_user', 'org_user', 'kvk'],
  district_admin: ['district_user', 'org_user', 'kvk'],
  org_admin: ['org_user', 'kvk'],
  kvk: ['kvk'],
};

/**
 * Service layer for user management operations
 */
const userManagementService = {
  /**
   * Create a new user
   * @param {object} userData - User data (name, email, roleId, etc.)
   * @param {string} password - Plain text password
   * @param {number} createdBy - User ID of the creator
   * @param {object} [options] - Optional: { permissions: string[] } (VIEW, ADD, EDIT, DELETE). Required when creator is not super_admin.
   * @returns {Promise<object>} Created user (with permissions array when user-level permissions were set)
   * @throws {Error} If validation fails or user creation fails
   */
  createUser: async (userData, password, createdBy, options = {}) => {
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

    // Load creator to check role and enforce hierarchy scope
    const creator = await userRepository.findById(createdBy);
    if (!creator) {
      throw new Error('Creator user not found');
    }
    const creatorRoleName = creator.role?.roleName;

    let effectiveRoleId = userData.roleId;
    let effectiveZoneId = userData.zoneId || null;
    let effectiveStateId = userData.stateId || null;
    let effectiveDistrictId = userData.districtId || null;
    let effectiveOrgId = userData.orgId || null;
    let effectiveKvkId = userData.kvkId || null;

    // Derive full hierarchy from lower-level selections when missing (Zone → State → District → Org → KVK)
    if (effectiveKvkId) {
      const kvk = await prisma.kvk.findUnique({ where: { kvkId: effectiveKvkId } });
      if (kvk) {
        effectiveZoneId = effectiveZoneId || kvk.zoneId;
        effectiveStateId = effectiveStateId || kvk.stateId;
        effectiveDistrictId = effectiveDistrictId || kvk.districtId;
        effectiveOrgId = effectiveOrgId || kvk.orgId;
      }
    }
    if (effectiveDistrictId && (!effectiveStateId || !effectiveZoneId)) {
      const district = await prisma.districtMaster.findUnique({ where: { districtId: effectiveDistrictId } });
      if (district) {
        effectiveStateId = effectiveStateId || district.stateId;
        effectiveZoneId = effectiveZoneId || district.zoneId;
      }
    }
    if (effectiveOrgId && !effectiveStateId) {
      const org = await prisma.orgMaster.findUnique({ where: { orgId: effectiveOrgId } });
      if (org) {
        effectiveStateId = org.stateId;
        if (!effectiveZoneId) {
          const state = await prisma.stateMaster.findUnique({ where: { stateId: org.stateId } });
          if (state) effectiveZoneId = state.zoneId;
        }
      }
    }

    if (creatorRoleName !== 'super_admin') {
      const rawPermissions = options.permissions;
      if (!rawPermissions || !Array.isArray(rawPermissions) || rawPermissions.length === 0) {
        throw new Error('At least one permission (VIEW, ADD, EDIT, DELETE) is required when creating a user as an admin');
      }
      const permissions = rawPermissions.map((a) => (typeof a === 'string' ? a.toUpperCase().trim() : a));
      const invalid = permissions.filter((a) => !VALID_PERMISSION_ACTIONS.includes(a));
      if (invalid.length > 0) {
        throw new Error(`Invalid permission(s): ${invalid.join(', ')}. Allowed: ${VALID_PERMISSION_ACTIONS.join(', ')}`);
      }
      // New user gets same zone/state/district/org as the creating admin; only kvkId may differ (e.g. when role is kvk)
      effectiveZoneId = creator.zoneId ?? null;
      effectiveStateId = creator.stateId ?? null;
      effectiveDistrictId = creator.districtId ?? null;
      effectiveOrgId = creator.orgId ?? null;
      effectiveKvkId = userData.kvkId || creator.kvkId || null;

      const effectiveUserData = {
        zoneId: effectiveZoneId,
        stateId: effectiveStateId,
        districtId: effectiveDistrictId,
        orgId: effectiveOrgId,
        kvkId: effectiveKvkId,
      };
      await userManagementService.validateCreatorHierarchyScope(createdBy, effectiveUserData);
      // Non–super-admin can only assign non-admin roles (state_user, district_user, org_user, kvk) per their level
      const requestedRole = await prisma.role.findUnique({ where: { roleId: userData.roleId } });
      if (!requestedRole) {
        throw new Error('Invalid role');
      }
      const allowed = ALLOWED_ROLES_FOR_CREATOR[creatorRoleName];
      if (!allowed || !allowed.includes(requestedRole.roleName)) {
        throw new Error(`You can only create users with the following roles: ${(allowed || []).join(', ')}`);
      }
      effectiveRoleId = userData.roleId;
      await userManagementService.validateHierarchyAssignment(
        effectiveRoleId,
        effectiveZoneId,
        effectiveStateId,
        effectiveDistrictId,
        effectiveOrgId,
        effectiveKvkId
      );
    }

    // Normalize inputs (trim). XSS handled by JSON responses and frontend output encoding.
    const sanitizedData = {
      name: sanitizeInput(userData.name),
      email: userData.email.toLowerCase().trim(),
      phoneNumber: userData.phoneNumber ? userData.phoneNumber.replace(/[\s\-()]/g, '') : null,
      roleId: effectiveRoleId,
      zoneId: effectiveZoneId,
      stateId: effectiveStateId,
      districtId: effectiveDistrictId,
      orgId: effectiveOrgId,
      kvkId: effectiveKvkId,
    };

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userRepository.createUserWithPassword(sanitizedData, passwordHash);

    // If creator is not super_admin, assign user-level permissions
    let permissionActions = [];
    if (creatorRoleName !== 'super_admin' && options.permissions?.length) {
      const normalizedPerms = options.permissions.map((a) => (typeof a === 'string' ? a.toUpperCase().trim() : a));
      const permissionIds = await userManagementService.getPermissionIdsForActions(normalizedPerms);
      if (permissionIds.length) {
        await userPermissionRepository.addUserPermissions(user.userId, permissionIds);
        permissionActions = normalizedPerms;
      }
    }

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
      ...(permissionActions.length ? { permissions: permissionActions } : {}),
    };
  },

  /**
   * Get permission IDs for USER_SCOPE module and given actions (VIEW, ADD, EDIT, DELETE).
   * @param {string[]} actions - e.g. ['VIEW', 'EDIT']
   * @returns {Promise<number[]>} Permission IDs
   */
  getPermissionIdsForActions: async (actions) => {
    const module = await prisma.module.findUnique({
      where: { moduleCode: USER_SCOPE_MODULE_CODE },
      include: {
        permissions: {
          where: { action: { in: actions } },
          select: { permissionId: true },
        },
      },
    });
    if (!module) return [];
    return module.permissions.map((p) => p.permissionId);
  },

  /**
   * Validate that the new user's hierarchy is within the creator's scope (for non–super_admin creators).
   * @param {number} creatorUserId - Creator user ID
   * @param {object} userData - New user data (zoneId, stateId, districtId, orgId, kvkId)
   * @throws {Error} If new user is outside creator's scope
   */
  validateCreatorHierarchyScope: async (creatorUserId, userData) => {
    const creator = await userRepository.findById(creatorUserId);
    if (!creator || !creator.role) {
      throw new Error('Creator not found');
    }
    const roleName = creator.role.roleName;

    switch (roleName) {
      case 'zone_admin': {
        if (creator.zoneId == null) throw new Error('Creator must be assigned to a zone');
        const creatorZoneId = Number(creator.zoneId);
        if (userData.zoneId != null && Number(userData.zoneId) !== creatorZoneId) {
          throw new Error('You can only create users within your zone');
        }
        if (userData.stateId != null) {
          const state = await prisma.stateMaster.findUnique({ where: { stateId: userData.stateId } });
          if (!state || Number(state.zoneId) !== creatorZoneId) {
            throw new Error('You can only create users within your zone');
          }
        }
        if (userData.districtId != null) {
          const district = await prisma.districtMaster.findUnique({ where: { districtId: userData.districtId } });
          if (!district) throw new Error('Invalid district');
          const state = await prisma.stateMaster.findUnique({ where: { stateId: district.stateId } });
          if (!state || Number(state.zoneId) !== creatorZoneId) {
            throw new Error('You can only create users within your zone');
          }
        }
        if (userData.orgId != null) {
          const org = await prisma.orgMaster.findUnique({ where: { orgId: userData.orgId } });
          if (!org) throw new Error('Invalid organization');
          const district = await prisma.districtMaster.findUnique({ where: { districtId: org.districtId } });
          if (!district) throw new Error('Invalid district');
          const state = await prisma.stateMaster.findUnique({ where: { stateId: district.stateId } });
          if (!state || Number(state.zoneId) !== creatorZoneId) {
            throw new Error('You can only create users within your zone');
          }
        }
        if (userData.kvkId != null) {
          const kvk = await prisma.kvk.findUnique({ where: { kvkId: userData.kvkId } });
          if (!kvk || Number(kvk.zoneId) !== creatorZoneId) {
            throw new Error('You can only create users within your zone');
          }
        }
        break;
      }
      case 'state_admin': {
        if (creator.stateId == null) throw new Error('Creator must be assigned to a state');
        const creatorStateId = Number(creator.stateId);
        if (userData.stateId != null && Number(userData.stateId) !== creatorStateId) {
          throw new Error('You can only create users within your state');
        }
        if (userData.districtId != null) {
          const district = await prisma.districtMaster.findUnique({ where: { districtId: userData.districtId } });
          if (!district || Number(district.stateId) !== creatorStateId) {
            throw new Error('You can only create users within your state');
          }
        }
        if (userData.orgId != null) {
          const org = await prisma.orgMaster.findUnique({ where: { orgId: userData.orgId } });
          if (!org) throw new Error('Invalid organization');
          const district = await prisma.districtMaster.findUnique({ where: { districtId: org.districtId } });
          if (!district || Number(district.stateId) !== creatorStateId) {
            throw new Error('You can only create users within your state');
          }
        }
        if (userData.kvkId != null) {
          const kvk = await prisma.kvk.findUnique({ where: { kvkId: userData.kvkId } });
          if (!kvk || Number(kvk.stateId) !== creatorStateId) {
            throw new Error('You can only create users within your state');
          }
        }
        break;
      }
      case 'district_admin': {
        if (creator.districtId == null) throw new Error('Creator must be assigned to a district');
        const creatorDistrictId = Number(creator.districtId);
        if (userData.districtId != null && Number(userData.districtId) !== creatorDistrictId) {
          throw new Error('You can only create users within your district');
        }
        if (userData.orgId != null) {
          const org = await prisma.orgMaster.findUnique({ where: { orgId: userData.orgId } });
          if (!org) throw new Error('Invalid organization');
          const creatorDistrict = await prisma.districtMaster.findUnique({ where: { districtId: creatorDistrictId } });
          if (!creatorDistrict || Number(org.stateId) !== Number(creatorDistrict.stateId)) {
            throw new Error('You can only create users within your district');
          }
        }
        if (userData.kvkId != null) {
          const kvk = await prisma.kvk.findUnique({ where: { kvkId: userData.kvkId } });
          if (!kvk || Number(kvk.districtId) !== creatorDistrictId) {
            throw new Error('You can only create users within your district');
          }
        }
        break;
      }
      case 'org_admin':
        if (creator.orgId == null) throw new Error('Creator must be assigned to an organization');
        if (Number(userData.orgId) !== Number(creator.orgId)) {
          throw new Error('You can only create users within your organization');
        }
        if (userData.kvkId != null) {
          const kvk = await prisma.kvk.findUnique({ where: { kvkId: userData.kvkId } });
          if (!kvk || Number(kvk.orgId) !== Number(creator.orgId)) {
            throw new Error('You can only create users within your organization');
          }
        }
        break;
      case 'kvk':
        if (creator.kvkId == null) throw new Error('Creator must be assigned to a KVK');
        if (Number(userData.kvkId) !== Number(creator.kvkId)) {
          throw new Error('You can only create users within your KVK');
        }
        break;
      default:
        throw new Error('You do not have permission to create users');
    }
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
        break;

      case 'state_user': {
        if (!stateId) {
          throw new Error('State user must be assigned to a state');
        }
        const stateForUser = await prisma.stateMaster.findUnique({ where: { stateId } });
        if (!stateForUser) {
          throw new Error('Invalid state ID');
        }
        break;
      }

      case 'district_user': {
        if (!districtId) {
          throw new Error('District user must be assigned to a district');
        }
        const districtForUser = await prisma.districtMaster.findUnique({ where: { districtId } });
        if (!districtForUser) {
          throw new Error('Invalid district ID');
        }
        break;
      }

      case 'org_user': {
        if (!orgId) {
          throw new Error('Organization user must be assigned to an organization');
        }
        const orgForUser = await prisma.orgMaster.findUnique({ where: { orgId } });
        if (!orgForUser) {
          throw new Error('Invalid organization ID');
        }
        break;
      }

      default:
        throw new Error('Unknown role');
    }
  },

  /**
   * Ensure the admin can access the target user (hierarchy scope).
   * @param {number} adminUserId - Admin user ID
   * @param {number} targetUserId - Target user ID to access (view/edit/delete)
   * @throws {Error} If target user not found or outside admin's scope
   */
  ensureAdminCanAccessUser: async (adminUserId, targetUserId, action = 'access') => {
    const adminUser = await userRepository.findById(adminUserId);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser || targetUser.deletedAt) {
      throw new Error('User not found');
    }
    const adminRole = adminUser.role.roleName;
    const targetRole = targetUser.role.roleName;

    // Super admin can do anything
    if (adminRole === 'super_admin') {
      return;
    }

    // For edit/delete: lower admin cannot modify higher users (role hierarchy)
    // Admin can only edit/delete if they outrank or equal the target (lower level number = higher authority)
    if (action === 'edit' || action === 'delete') {
      if (!outranksOrEqual(adminRole, targetRole)) {
        throw new Error('You cannot modify users with higher authority than you');
      }
    }
  },

  /**
   * Get users for admin - all admins can see all users in the platform.
   * Lower admins cannot edit/delete higher users (enforced in ensureAdminCanAccessUser).
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

    // All admins (super_admin, zone_admin, state_admin, district_admin, org_admin, kvk) can see all users
    // No hierarchy filters for viewing - everyone sees the full user list
    const allowedRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk'];
    if (!allowedRoles.includes(adminRole)) {
      throw new Error('User does not have permission to view users');
    }

    // Use only the additional filters (roleId, search, etc.) - no hierarchy restriction
    const users = await userRepository.findUsersByHierarchy(filters);

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
    // Enforce hierarchy scope: updater must be allowed to access this user
    await userManagementService.ensureAdminCanAccessUser(updatedBy, userId, 'edit');

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

    // Prevent role escalation by non-super_admin
    const updater = await userRepository.findById(updatedBy);
    const updaterRoleName = updater?.role?.roleName;

    if (userData.roleId !== undefined && userData.roleId !== existingUser.roleId) {
      if (updaterRoleName !== 'super_admin') {
        const requestedRole = await prisma.role.findUnique({ where: { roleId: userData.roleId } });
        if (!requestedRole) {
          throw new Error('Invalid role');
        }
        const allowed = ALLOWED_ROLES_FOR_CREATOR[updaterRoleName];
        if (!allowed || !allowed.includes(requestedRole.roleName)) {
          throw new Error(`You can only assign the following roles: ${(allowed || []).join(', ')}`);
        }
      }
    }

    let nextRoleId = userData.roleId ?? existingUser.roleId;
    let nextZoneId = userData.zoneId !== undefined ? userData.zoneId : existingUser.zoneId;
    let nextStateId = userData.stateId !== undefined ? userData.stateId : existingUser.stateId;
    let nextDistrictId =
      userData.districtId !== undefined ? userData.districtId : existingUser.districtId;
    let nextOrgId = userData.orgId !== undefined ? userData.orgId : existingUser.orgId;
    let nextKvkId = userData.kvkId !== undefined ? userData.kvkId : existingUser.kvkId;

    // Derive full hierarchy from lower-level when missing (same as createUser)
    if (nextKvkId) {
      const kvk = await prisma.kvk.findUnique({ where: { kvkId: nextKvkId } });
      if (kvk) {
        nextZoneId = nextZoneId ?? kvk.zoneId;
        nextStateId = nextStateId ?? kvk.stateId;
        nextDistrictId = nextDistrictId ?? kvk.districtId;
        nextOrgId = nextOrgId ?? kvk.orgId;
      }
    }
    if (nextDistrictId && (!nextStateId || !nextZoneId)) {
      const district = await prisma.districtMaster.findUnique({ where: { districtId: nextDistrictId } });
      if (district) {
        nextStateId = nextStateId ?? district.stateId;
        nextZoneId = nextZoneId ?? district.zoneId;
      }
    }
    if (nextOrgId && !nextStateId) {
      const org = await prisma.orgMaster.findUnique({ where: { orgId: nextOrgId } });
      if (org) {
        nextStateId = org.stateId;
        if (!nextZoneId) {
          const state = await prisma.stateMaster.findUnique({ where: { stateId: org.stateId } });
          if (state) nextZoneId = state.zoneId;
        }
      }
    }

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
    if (hierarchyChanged) {
      sanitizedData.zoneId = nextZoneId ?? null;
      sanitizedData.stateId = nextStateId ?? null;
      sanitizedData.districtId = nextDistrictId ?? null;
      sanitizedData.orgId = nextOrgId ?? null;
      sanitizedData.kvkId = nextKvkId ?? null;
    }

    // Update user
    const updatedUser = await userRepository.update(userId, sanitizedData);

    // Update permissions if provided
    let permissionActions = [];
    if (Array.isArray(userData.permissions)) {
      const normalized = userData.permissions.map((a) =>
        typeof a === 'string' ? a.toUpperCase().trim() : a
      );
      const invalid = normalized.filter((a) => !VALID_PERMISSION_ACTIONS.includes(a));
      if (invalid.length > 0) {
        throw new Error(`Invalid permission(s): ${invalid.join(', ')}. Allowed: ${VALID_PERMISSION_ACTIONS.join(', ')}`);
      }
      const permissionIds = await userManagementService.getPermissionIdsForActions(normalized);
      await userPermissionRepository.setUserPermissions(userId, permissionIds);
      permissionActions = normalized;
    } else {
      permissionActions = await userPermissionRepository.getUserPermissionActions(userId);
    }

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
      ...(permissionActions.length ? { permissions: permissionActions } : {}),
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
    // Enforce hierarchy scope: deleter must be allowed to access this user
    await userManagementService.ensureAdminCanAccessUser(deletedBy, userId, 'delete');

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
    await authRepository.revokeAllUserTokens(userId);

    return true;
  },
};

module.exports = userManagementService;
