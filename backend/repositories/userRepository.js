const prisma = require('../config/prisma');

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
    return await prisma.user.create({
      data: userData,
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
    return await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
      include: {
        role: true,
        zone: true,
        state: true,
        district: true,
        org: true,
      },
    });
  },

  /**
   * Update user
   */
  update: async (id, userData) => {
    return await prisma.user.update({
      where: { userId: parseInt(id) },
      data: userData,
      include: {
        role: true,
        zone: true,
        state: true,
        district: true,
        org: true,
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

    return await prisma.user.findMany({
      where,
      include: {
        role: true,
        zone: true,
        state: true,
        district: true,
        org: true,
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
