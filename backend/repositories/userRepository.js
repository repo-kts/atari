const prisma = require('../config/prisma.js');

const USER_WRITABLE_FIELDS = new Set([
  'name',
  'email',
  'passwordHash',
  'roleId',
  'zoneId',
  'stateId',
  'districtId',
  'orgId',
  'universityId',
  'kvkId',
  'lastLoginAt',
  'deletedAt',
  'phoneNumber',
]);

function sanitizeUserData(userData = {}) {
  const sanitized = {};

  for (const [key, value] of Object.entries(userData)) {
    if (!USER_WRITABLE_FIELDS.has(key)) continue;
    if (value === undefined) continue;

    if (key.endsWith('Id')) {
      if (value === null || value === '') {
        sanitized[key] = null;
        continue;
      }
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) {
        sanitized[key] = parsed;
      }
      continue;
    }

    if (key === 'lastLoginAt' || key === 'deletedAt') {
      sanitized[key] = value ? new Date(value) : null;
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = value.trim();
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

const userRepository = {
  /**
   * Find all users (excluding soft-deleted)
   */
  findAll: async () => {
    return await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        role: true,
      },
      orderBy: { userId: 'asc' },
    });
  },

  /**
   * Find user by ID
   */
  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { userId: parseInt(id) },
      include: {
        role: true,
        zone: true,
        state: true,
        district: true,
        org: true,
        kvk: true,
      },
    });
  },

  /**
   * Find user by email
   */
  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  },

  /**
   * Create user (generic)
   */
  create: async (userData) => {
    const sanitizedData = sanitizeUserData(userData);
    if (Object.keys(sanitizedData).length === 0) {
      const error = new Error('No valid user fields provided');
      error.statusCode = 400;
      throw error;
    }
    return await prisma.user.create({
      data: sanitizedData,
      include: {
        role: true,
      },
    });
  },

  /**
   * Create user with password hash
   * @param {object} userData - User data (name, email, roleId, etc.)
   * @param {string} passwordHash - Hashed password
   * @returns {Promise<object>} Created user
   */
  createUserWithPassword: async (userData, passwordHash) => {
    const sanitizedData = sanitizeUserData(userData);
    return await prisma.user.create({
      data: {
        ...sanitizedData,
        passwordHash,
      },
      include: {
        role: true,
        zone: true,
        state: true,
        district: true,
        org: true,
        kvk: true,
      },
    });
  },

  /**
   * Update user
   */
  update: async (id, userData) => {
    const sanitizedData = sanitizeUserData(userData);
    if (Object.keys(sanitizedData).length === 0) {
      const error = new Error('No valid user fields provided for update');
      error.statusCode = 400;
      throw error;
    }
    return await prisma.user.update({
      where: { userId: parseInt(id) },
      data: sanitizedData,
      include: {
        role: true,
        zone: true,
        state: true,
        district: true,
        org: true,
        kvk: true,
      },
    });
  },

  /**
   * Update user password
   * @param {number} userId - User ID
   * @param {string} passwordHash - New hashed password
   * @returns {Promise<object>} Updated user
   */
  updateUserPassword: async (userId, passwordHash) => {
    return await prisma.user.update({
      where: { userId },
      data: { passwordHash },
    });
  },

  /**
   * Find users by role
   * @param {number} roleId - Role ID
   * @returns {Promise<array>} Array of users
   */
  findUsersByRole: async (roleId) => {
    return await prisma.user.findMany({
      where: {
        roleId,
        deletedAt: null,
      },
      include: {
        role: true,
        zone: true,
        state: true,
        district: true,
        org: true,
        kvk: true,
      },
      orderBy: { userId: 'asc' },
    });
  },

  /**
   * Find users by hierarchy (zone, state, district, org, kvk)
   * @param {object} filters - { zoneId?, stateId?, districtId?, orgId?, kvkId? }
   * @returns {Promise<array>} Array of users
   */
  findUsersByHierarchy: async (filters = {}) => {
    const where = {
      deletedAt: null,
    };

    if (filters.zoneId !== undefined) {
      where.zoneId = filters.zoneId;
    }
    if (filters.stateId !== undefined) {
      where.stateId = filters.stateId;
    }
    if (filters.districtId !== undefined) {
      where.districtId = filters.districtId;
    }
    if (filters.orgId !== undefined) {
      where.orgId = filters.orgId;
    }
    if (filters.kvkId !== undefined) {
      where.kvkId = filters.kvkId;
    }
    if (filters.roleId !== undefined) {
      where.roleId = filters.roleId;
    }
    if (filters.roleNames?.length) {
      where.role = { roleName: { in: filters.roleNames } };
    }
    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    return await prisma.user.findMany({
      where,
      include: {
        role: true,
        zone: true,
        state: true,
        district: true,
        org: true,
        kvk: true,
      },
      orderBy: { userId: 'asc' },
    });
  },

  /**
   * Soft delete user
   * @param {number} userId - User ID
   * @returns {Promise<object>} Updated user
   */
  softDeleteUser: async (userId) => {
    return await prisma.user.update({
      where: { userId },
      data: {
        deletedAt: new Date(),
      },
    });
  },

  /**
   * Hard delete user (use with caution)
   */
  delete: async (id) => {
    await prisma.user.delete({
      where: { userId: parseInt(id) },
    });
    return true;
  },
};

module.exports = userRepository;
