const prisma = require('../config/prisma.js');

const logHistoryRepository = {
  /**
   * Create a user login/logout activity record.
   * @param {object} data
   * @returns {Promise<object>}
   */
  createActivityLog: async (data) => {
    return prisma.userLoginActivity.create({ data });
  },

  /**
   * List activity logs with pagination.
   * @param {object} params
   * @returns {Promise<{logs: object[], total: number}>}
   */
  listActivityLogs: async ({ where, skip, take, orderBy }) => {
    // Hide activity of soft-deleted users everywhere in the UI.
    const scopedWhere = { ...where, user: { is: { deletedAt: null } } };
    const [logs, total] = await Promise.all([
      prisma.userLoginActivity.findMany({
        where: scopedWhere,
        orderBy,
        skip,
        take,
      }),
      prisma.userLoginActivity.count({ where: scopedWhere }),
    ]);

    return { logs, total };
  },

  /**
   * Get distinct KVK options from activity logs.
   * @param {object} where
   * @returns {Promise<Array<{kvkId: number, kvkName: string | null}>>}
   */
  listDistinctKvks: async (where) => {
    return prisma.userLoginActivity.findMany({
      where: {
        ...where,
        kvkId: { not: null },
      },
      select: {
        kvkId: true,
        kvkName: true,
      },
      distinct: ['kvkId'],
      orderBy: [{ kvkName: 'asc' }, { kvkId: 'asc' }],
    });
  },

  /**
   * Get distinct users from activity logs.
   * @param {object} where
   * @returns {Promise<Array<{userId: number, userName: string | null, userEmail: string | null, roleName: string | null}>>}
   */
  listDistinctUsers: async (where) => {
    return prisma.userLoginActivity.findMany({
      where: {
        ...where,
        userId: { not: null },
        user: { is: { deletedAt: null } },
      },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        roleName: true,
      },
      distinct: ['userId'],
      orderBy: [{ userName: 'asc' }, { userId: 'asc' }],
    });
  },

  /**
   * Get users within the caller's scope (from users table, not log rows).
   * @param {object} where
   * @returns {Promise<Array<{userId:number,name:string,email:string,role:{roleName:string}}>>}
   */
  listScopedUsers: async (where) => {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: {
          select: {
            roleName: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }, { userId: 'asc' }],
    });
  },
};

module.exports = logHistoryRepository;
