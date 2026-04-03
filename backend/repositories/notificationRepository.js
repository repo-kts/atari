const prisma = require('../config/prisma.js');

const notificationRepository = {
  /**
   * Get all active users.
   * @returns {Promise<Array<{userId:number,name:string,email:string,role:{roleName:string}}>>}
   */
  listActiveUsers: async () => {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        userId: true,
        name: true,
        email: true,
        role: { select: { roleName: true } },
      },
      orderBy: [{ name: 'asc' }, { userId: 'asc' }],
    });
  },

  /**
   * Get active users by IDs.
   * @param {number[]} userIds
   */
  listActiveUsersByIds: async (userIds) => {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        userId: { in: userIds },
      },
      select: { userId: true },
    });
  },

  /**
   * Create notification and user_notification rows in one transaction.
   * @param {{subject:string,content:string,createdByUserId:number,recipientUserIds:number[]}} payload
   */
  createNotificationWithRecipients: async ({ subject, content, createdByUserId, recipientUserIds }) => {
    return prisma.$transaction(async (tx) => {
      const notification = await tx.notification.create({
        data: {
          subject,
          content,
          createdByUserId,
        },
      });

      await tx.userNotification.createMany({
        data: recipientUserIds.map((userId) => ({
          notificationId: notification.notificationId,
          userId,
        })),
        skipDuplicates: true,
      });

      return notification;
    });
  },

  /**
   * List notifications for a specific user.
   * @param {object} params
   * @returns {Promise<{rows: any[], total: number}>}
   */
  listForUser: async ({ userId, where, skip, take }) => {
    const finalWhere = {
      userId,
      ...where,
    };

    const [rows, total] = await Promise.all([
      prisma.userNotification.findMany({
        where: finalWhere,
        include: {
          notification: {
            include: {
              createdBy: {
                select: {
                  userId: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [
          { notification: { createdAt: 'desc' } },
          { userNotificationId: 'desc' },
        ],
        skip,
        take,
      }),
      prisma.userNotification.count({ where: finalWhere }),
    ]);

    return { rows, total };
  },

  /**
   * Count unread notifications for a user.
   * @param {number} userId
   */
  countUnreadForUser: async (userId) => {
    return prisma.userNotification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  /**
   * Get recent notifications for a user.
   * @param {number} userId
   * @param {number} limit
   */
  getRecentForUser: async (userId, limit) => {
    return prisma.userNotification.findMany({
      where: { userId },
      include: {
        notification: {
          include: {
            createdBy: {
              select: {
                userId: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { notification: { createdAt: 'desc' } },
        { userNotificationId: 'desc' },
      ],
      take: limit,
    });
  },

  /**
   * Mark one user notification as read.
   * @param {number} userId
   * @param {number} userNotificationId
   */
  markAsRead: async (userId, userNotificationId) => {
    return prisma.userNotification.updateMany({
      where: {
        userId,
        userNotificationId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  /**
   * Mark all user notifications as read.
   * @param {number} userId
   */
  markAllAsRead: async (userId) => {
    return prisma.userNotification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },
};

module.exports = notificationRepository;
