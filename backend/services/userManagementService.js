const userRepository = require('../repositories/userRepository.js');
const userPermissionRepository = require('../repositories/userPermissionRepository.js');
const { hashPassword } = require('../utils/password.js');
const { validateEmail, validatePassword, validateRoleId, sanitizeInput, validatePhoneNumber } = require('../utils/validation.js');
const prisma = require('../config/prisma.js');
const authRepository = require('../repositories/authRepository.js');
const { isAdminRole, outranksOrEqual, getManageableRoles, getRoleLevel, getCreatableRoles } = require('../constants/roleHierarchy.js');
const permissionResolverService = require('./auth/permissionResolverService.js');

const USER_SCOPE_MODULE_CODE = 'USER_SCOPE';
const VALID_PERMISSION_ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE'];

/**
 * Uppercase + trim + dedupe + filter to the four valid actions.
 * @param {string[]} actions
 * @returns {string[]}
 */
function normalizeActions(actions) {
  if (!Array.isArray(actions)) return [];
  const out = new Set();
  for (const raw of actions) {
    if (typeof raw !== 'string') continue;
    const a = raw.trim().toUpperCase();
    if (VALID_PERMISSION_ACTIONS.includes(a)) out.add(a);
  }
  return [...out];
}

/**
 * Derive the full geographic hierarchy from whichever IDs are already present.
 * Walks KVK → District → Org → State, filling in missing parents via Prisma lookups.
 * Uses ?? consistently so an explicit 0/null is never silently overwritten.
 *
 * @param {{ zoneId?, stateId?, districtId?, orgId?, kvkId? }} ids
 * @returns {Promise<{ zoneId, stateId, districtId, orgId }>}
 */
async function deriveFullHierarchy({ zoneId = null, stateId = null, districtId = null, orgId = null, kvkId = null }) {
  let z = zoneId ?? null;
  let s = stateId ?? null;
  let d = districtId ?? null;
  let o = orgId ?? null;

  // KVK carries all four parent IDs
  if (kvkId) {
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (kvk) {
      z = z ?? kvk.zoneId;
      s = s ?? kvk.stateId;
      d = d ?? kvk.districtId;
      o = o ?? kvk.orgId;
    }
  }

  // District carries stateId and zoneId
  if (d && (!s || !z)) {
    const district = await prisma.districtMaster.findUnique({ where: { districtId: d } });
    if (district) {
      s = s ?? district.stateId;
      z = z ?? district.zoneId;
    }
  }

  // Org carries stateId; derive zoneId from its state
  if (o && (!s || !z)) {
    const org = await prisma.orgMaster.findUnique({ where: { orgId: o } });
    if (org) {
      s = s ?? org.stateId;
      if (!z) {
        const state = await prisma.stateMaster.findUnique({ where: { stateId: org.stateId ?? s } });
        if (state) z = state.zoneId;
      }
    }
  }

  // State carries zoneId
  if (s && !z) {
    const state = await prisma.stateMaster.findUnique({ where: { stateId: s } });
    if (state) z = state.zoneId;
  }

  return { zoneId: z, stateId: s, districtId: d, orgId: o };
}

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

    // Load creator to check role and enforce hierarchy scope
    const creator = await userRepository.findById(createdBy);
    if (!creator) {
      throw new Error('Creator user not found');
    }
    const creatorRoleName = creator.role?.roleName;

    let effectiveRoleId = userData.roleId;
    let effectiveKvkId = userData.kvkId || null;

    // Derive full hierarchy from lower-level selections when missing (Zone → State → District → Org → KVK)
    const derived = await deriveFullHierarchy({
      zoneId: userData.zoneId || null,
      stateId: userData.stateId || null,
      districtId: userData.districtId || null,
      orgId: userData.orgId || null,
      kvkId: effectiveKvkId,
    });
    let effectiveZoneId = derived.zoneId;
    let effectiveStateId = derived.stateId;
    let effectiveDistrictId = derived.districtId;
    let effectiveOrgId = derived.orgId;
    let effectiveUniversityId = userData.universityId || null;
    let requestedRole = null;

    if (creatorRoleName !== 'super_admin') {
      // Validate the requested role is strictly lower in hierarchy
      requestedRole = await prisma.role.findUnique({ where: { roleId: userData.roleId } });
      if (!requestedRole) {
        throw new Error('Invalid role');
      }
      const allowed = getCreatableRoles(creatorRoleName);
      if (!allowed.includes(requestedRole.roleName)) {
        throw new Error(`You can only create users with the following roles: ${allowed.join(', ')}`);
      }

      // Geographic inheritance: inherit fields at or above creator's level, use form data below
      const creatorLevel = getRoleLevel(creatorRoleName);
      // zone=1, state=2, district=3, org=4, kvk=5
      effectiveZoneId = creator.zoneId ?? null;
      effectiveStateId = creatorLevel < 2 ? (derived.stateId ?? null) : (creator.stateId ?? null);
      effectiveDistrictId = creatorLevel < 3 ? (derived.districtId ?? null) : (creator.districtId ?? null);
      effectiveOrgId = creatorLevel < 4 ? (derived.orgId ?? null) : (creator.orgId ?? null);
      effectiveUniversityId = creatorLevel < 5 ? (userData.universityId || null) : (creator.universityId ?? null);
      effectiveKvkId = userData.kvkId ?? creator.kvkId ?? null;

      const effectiveUserData = {
        zoneId: effectiveZoneId,
        stateId: effectiveStateId,
        districtId: effectiveDistrictId,
        orgId: effectiveOrgId,
        kvkId: effectiveKvkId,
      };
      await userManagementService.validateCreatorHierarchyScope(createdBy, effectiveUserData);
      effectiveRoleId = userData.roleId;
      await userManagementService.validateHierarchyAssignment(
        effectiveRoleId,
        effectiveZoneId,
        effectiveStateId,
        effectiveDistrictId,
        effectiveOrgId,
        effectiveKvkId
      );
    } else {
      // super_admin: validate with derived (raw + auto-filled) values
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
      universityId: effectiveUniversityId,
      kvkId: effectiveKvkId,
    };

    // Hash password
    const passwordHash = await hashPassword(password);

    // Pre-validate and resolve permissions for _user roles before creating the user.
    // Per-module rows are written directly (one row per role-allowed module/action),
    // so the resolver runs the strict per-module path immediately — no legacy
    // USER_SCOPE rows are produced for newly-created users.
    const targetRoleRecord = requestedRole ?? await prisma.role.findUnique({ where: { roleId: effectiveRoleId } });
    const targetRoleName = targetRoleRecord?.roleName || '';
    const isTargetUserRole = targetRoleName.endsWith('_user');
    let permissionActions = [];
    let resolvedPermissionIds = [];

    if (isTargetUserRole) {
      if (!options.permissions || !options.permissions.length) {
        throw new Error('At least one permission (VIEW, ADD, EDIT, DELETE) is required when creating a _user role');
      }
      permissionActions = normalizeActions(options.permissions);
      if (!permissionActions.length) {
        throw new Error(`Invalid permission(s). Allowed: ${VALID_PERMISSION_ACTIONS.join(', ')}`);
      }
      resolvedPermissionIds = await userManagementService.getRolePermissionIdsForActions(
        effectiveRoleId,
        permissionActions,
      );
    }

    // Create user and assign permissions atomically
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { ...sanitizedData, passwordHash },
        include: { role: true, zone: true, state: true, district: true, org: true, kvk: true },
      });
      if (isTargetUserRole && resolvedPermissionIds.length) {
        await tx.userPermission.createMany({
          data: resolvedPermissionIds.map((permissionId) => ({ userId: created.userId, permissionId })),
          skipDuplicates: true,
        });
      }
      return created;
    });

    // Best-effort cache invalidation in case any permission cache entry exists.
    try {
      await permissionResolverService.invalidateUserPermissions(user.userId);
    } catch (error) {
      console.error('Permission cache invalidation failed after user creation:', error.message);
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
   * For the given role and action set, return all per-module permission IDs
   * the role grants for those actions. Used to translate "tick VIEW in
   * EditUserModal" into concrete per-module rows on the role's ceiling.
   *
   * @param {number} roleId
   * @param {string[]} actions
   * @returns {Promise<number[]>}
   */
  getRolePermissionIdsForActions: async (roleId, actions) => {
    if (!actions?.length) return [];
    const rows = await prisma.rolePermission.findMany({
      where: {
        roleId,
        permission: { action: { in: actions } },
      },
      select: { permissionId: true },
    });
    return rows.map((r) => r.permissionId);
  },

  /**
   * Apply a per-action delta to the user's permission rows.
   *
   *   add:    grant the action on every module the role allows.
   *   remove: drop every row (per-module + USER_SCOPE) that carries the action.
   *
   * If the user is still in legacy USER_SCOPE-ceiling mode and the delta is
   * non-empty, this materialises the ceiling into per-module rows first
   * (semantically a no-op) so we never end up in a half-and-half state.
   *
   * Idempotent: an empty delta is a no-op.
   *
   * @param {number} userId
   * @param {number} roleId
   * @param {{ add?: string[], remove?: string[] }} delta
   * @returns {Promise<{ added: number, removed: number }>}
   */
  applyPermissionsDelta: async (userId, roleId, delta = {}) => {
    const add = Array.isArray(delta.add) ? normalizeActions(delta.add) : [];
    const remove = Array.isArray(delta.remove) ? normalizeActions(delta.remove) : [];

    if (!add.length && !remove.length) {
      return { added: 0, removed: 0 };
    }

    const removeSet = new Set(remove);
    const addSet = new Set(add);

    return prisma.$transaction(async (tx) => {
      // Read the current rows once, with module info, so we can decide
      // whether the user is in legacy ceiling mode.
      const currentRows = await tx.userPermission.findMany({
        where: { userId },
        select: {
          permissionId: true,
          permission: {
            select: {
              action: true,
              module: { select: { moduleCode: true } },
            },
          },
        },
      });

      const userScopeRows = currentRows.filter(
        (r) => r.permission?.module?.moduleCode === USER_SCOPE_MODULE_CODE,
      );

      // 1. Materialise legacy ceiling → per-module rows so we don't lose
      //    actions the user implicitly has via USER_SCOPE. Steps 2 + 3
      //    re-query the DB, so we don't need to track in-memory state here.
      if (userScopeRows.length > 0) {
        const ceilingActions = [...new Set(userScopeRows.map((r) => r.permission.action))];
        const expanded = await tx.rolePermission.findMany({
          where: {
            roleId,
            permission: { action: { in: ceilingActions } },
          },
          select: { permissionId: true },
        });
        if (expanded.length) {
          await tx.userPermission.createMany({
            data: expanded.map((rp) => ({ userId, permissionId: rp.permissionId })),
            skipDuplicates: true,
          });
        }
        await tx.userPermission.deleteMany({
          where: { userId, permissionId: { in: userScopeRows.map((r) => r.permissionId) } },
        });
      }

      // 2. REMOVE: drop every per-module row carrying any removed action.
      let removedCount = 0;
      if (removeSet.size > 0) {
        const result = await tx.userPermission.deleteMany({
          where: {
            userId,
            permission: { action: { in: [...removeSet] } },
          },
        });
        removedCount = result.count;
      }

      // 3. ADD: grant action on every role-allowed module that doesn't
      //    already have a row.
      let addedCount = 0;
      if (addSet.size > 0) {
        const expanded = await tx.rolePermission.findMany({
          where: {
            roleId,
            permission: { action: { in: [...addSet] } },
          },
          select: { permissionId: true },
        });
        if (expanded.length) {
          const result = await tx.userPermission.createMany({
            data: expanded.map((rp) => ({ userId, permissionId: rp.permissionId })),
            skipDuplicates: true,
          });
          addedCount = result.count;
        }
      }

      return { added: addedCount, removed: removedCount };
    });
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
      case 'kvk_admin':
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

      case 'kvk_admin':
      case 'kvk_user':
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
   * Get users for admin — scoped by both role hierarchy and geographic assignment.
   * Each admin sees users at their own level or below, within their geographic scope.
   * super_admin sees everyone.
   * @param {number} adminUserId - Admin user ID
   * @param {object} filters - Additional filters (roleId, search, etc.)
   * @returns {Promise<array>} Array of users
   */
  getUsersForAdmin: async (adminUserId, filters = {}) => {
    const adminUser = await userRepository.findById(adminUserId);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const adminRole = adminUser.role.roleName;
    const allowedRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk_admin'];
    if (!allowedRoles.includes(adminRole)) {
      throw new Error('User does not have permission to view users');
    }

    // super_admin: no restrictions
    if (adminRole === 'super_admin') {
      return await userRepository.findUsersByHierarchy(filters);
    }

    // Role hierarchy: only show users at the admin's level or below
    const visibleRoleNames = getManageableRoles(adminRole);

    // Geographic scope: restrict to the admin's own assignment (fail-closed)
    const scopedFilters = { ...filters, roleNames: visibleRoleNames };
    const geoMap = {
      zone_admin: { field: 'zoneId', label: 'zone' },
      state_admin: { field: 'stateId', label: 'state' },
      district_admin: { field: 'districtId', label: 'district' },
      org_admin: { field: 'orgId', label: 'organization' },
      kvk_admin: { field: 'kvkId', label: 'KVK' },
    };
    const geo = geoMap[adminRole];
    if (geo) {
      if (adminUser[geo.field] == null) {
        throw new Error(`Admin user is not assigned to a ${geo.label}`);
      }
      scopedFilters[geo.field] = adminUser[geo.field];
    }

    return await userRepository.findUsersByHierarchy(scopedFilters);
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
        const allowed = getCreatableRoles(updaterRoleName);
        if (!allowed.includes(requestedRole.roleName)) {
          throw new Error(`You can only assign the following roles: ${allowed.join(', ')}`);
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

    // Derive full hierarchy from lower-level when missing
    const derived = await deriveFullHierarchy({
      zoneId: nextZoneId,
      stateId: nextStateId,
      districtId: nextDistrictId,
      orgId: nextOrgId,
      kvkId: nextKvkId,
    });
    nextZoneId = derived.zoneId;
    nextStateId = derived.stateId;
    nextDistrictId = derived.districtId;
    nextOrgId = derived.orgId;

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

    // Permission writes from EditUserModal arrive as a delta:
    //   { add: ['EDIT'], remove: ['DELETE'] }
    // Each tick/untick maps to "select-all"/"deselect-all" for that action,
    // applied per-module against the role's ceiling. Untouched checkboxes
    // produce no entries in the delta and therefore no writes — partial
    // per-module customisations set in the matrix are preserved.
    const targetRoleId = updatedUser.roleId;
    if (userData.permissionsDelta && typeof userData.permissionsDelta === 'object') {
      await userManagementService.applyPermissionsDelta(userId, targetRoleId, userData.permissionsDelta);
    }

    // Always echo back the user's current distinct actions so the modal
    // can re-render without a second round-trip.
    const permissionActions = await userPermissionRepository.getDistinctActions(userId);

    // Best-effort cache invalidation (covers role changes and user-level permission changes).
    try {
      await permissionResolverService.invalidateUserPermissions(userId);
    } catch (error) {
      console.error('Permission cache invalidation failed after user update:', error.message);
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

    // Best-effort cache invalidation
    try {
      await permissionResolverService.invalidateUserPermissions(userId);
    } catch (error) {
      console.error('Permission cache invalidation failed after user deletion:', error.message);
    }

    return true;
  },
};

module.exports = userManagementService;
