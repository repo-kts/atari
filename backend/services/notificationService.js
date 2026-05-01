const notificationRepository = require('../repositories/notificationRepository.js');
const notificationAttachmentService = require('./notificationAttachmentService.js');

const SUPER_ADMIN_ROLE = 'super_admin';

function normalizePage(page) {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeLimit(limit, fallback = 10) {
  const parsed = Number(limit);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 100);
}

function mapUserNotification(row, attachmentsById) {
  const attachments = attachmentsById?.get(row.notificationId) || [];
  return {
    userNotificationId: row.userNotificationId,
    notificationId: row.notificationId,
    subject: row.notification?.subject || '',
    content: row.notification?.content || '',
    createdAt: row.notification?.createdAt || row.createdAt,
    updatedAt: row.notification?.updatedAt || row.createdAt,
    isRead: row.isRead,
    readAt: row.readAt,
    sentBy: row.notification?.createdBy
      ? {
          userId: row.notification.createdBy.userId,
          name: row.notification.createdBy.name,
          email: row.notification.createdBy.email,
        }
      : null,
    attachments,
    attachmentCount: attachments.length,
  };
}

const notificationService = {
  /**
   * Create notification (super_admin only).
   * @param {object} actor
   * @param {object} payload
   */
  createNotification: async (actor, payload) => {
    if (actor?.roleName !== SUPER_ADMIN_ROLE) {
      throw new Error('Only super_admin can create notifications');
    }

    const subject = String(payload?.subject || '').trim();
    const content = String(payload?.content || '').trim();
    const sendToAll = payload?.sendToAll === true;
    const rawRecipientUserIds = Array.isArray(payload?.recipientUserIds) ? payload.recipientUserIds : [];

    if (!subject) throw new Error('Subject is required');
    if (!content) throw new Error('Content is required');
    if (subject.length > 300) throw new Error('Subject must be 300 characters or less');
    if (content.length > 5000) throw new Error('Content must be 5000 characters or less');

    let recipientUserIds = [];
    if (sendToAll) {
      const users = await notificationRepository.listActiveUsers();
      recipientUserIds = users.map((u) => u.userId);
    } else {
      const parsedIds = rawRecipientUserIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);
      recipientUserIds = Array.from(new Set(parsedIds));

      if (recipientUserIds.length === 0) {
        throw new Error('Select at least one recipient user');
      }
    }

    if (recipientUserIds.length === 0) {
      throw new Error('No active users available to receive notification');
    }

    const validUsers = await notificationRepository.listActiveUsersByIds(recipientUserIds);
    const validUserIdSet = new Set(validUsers.map((u) => u.userId));
    recipientUserIds = recipientUserIds.filter((id) => validUserIdSet.has(id));

    if (recipientUserIds.length === 0) {
      throw new Error('Selected users are not active');
    }

    const rawAttachmentIds = Array.isArray(payload?.attachmentIds) ? payload.attachmentIds : [];

    const notification = await notificationRepository.createNotificationWithRecipients({
      subject,
      content,
      createdByUserId: actor.userId,
      recipientUserIds,
    });

    if (rawAttachmentIds.length > 0) {
      await notificationAttachmentService.attachToNotification({
        attachmentIds: rawAttachmentIds,
        notificationId: notification.notificationId,
        user: actor,
      });
    }

    const attachments = await notificationAttachmentService.listForNotification(notification.notificationId);

    return {
      notificationId: notification.notificationId,
      subject: notification.subject,
      content: notification.content,
      createdByUserId: notification.createdByUserId,
      createdAt: notification.createdAt,
      recipientCount: recipientUserIds.length,
      attachments,
      attachmentCount: attachments.length,
    };
  },

  /**
   * Get all active users for recipient selection.
   * @param {object} actor
   */
  getRecipientUsers: async (actor) => {
    if (actor?.roleName !== SUPER_ADMIN_ROLE) {
      throw new Error('Only super_admin can list recipient users');
    }

    const users = await notificationRepository.listActiveUsers();
    return users.map((u) => ({
      userId: u.userId,
      name: u.name,
      email: u.email,
      roleName: u.role?.roleName || null,
    }));
  },

  /**
   * Get paginated notifications for current user.
   * @param {number} userId
   * @param {object} filters
   */
  getNotificationsForUser: async (userId, filters = {}) => {
    const page = normalizePage(filters.page);
    const limit = normalizeLimit(filters.limit);
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.status === 'read') where.isRead = true;
    if (filters.status === 'unread') where.isRead = false;

    const search = String(filters.search || '').trim();
    if (search) {
      where.OR = [
        { notification: { subject: { contains: search, mode: 'insensitive' } } },
        { notification: { content: { contains: search, mode: 'insensitive' } } },
        { notification: { createdBy: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const { rows, total } = await notificationRepository.listForUser({
      userId,
      where,
      skip,
      take: limit,
    });

    const attachmentsById = await notificationAttachmentService.listForNotificationIds(
      rows.map((r) => r.notificationId),
    );

    return {
      data: rows.map((r) => mapUserNotification(r, attachmentsById)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  /**
   * Get recent notifications for bell dropdown.
   * @param {number} userId
   * @param {number} limit
   */
  getRecentForUser: async (userId, limit = 5) => {
    const safeLimit = normalizeLimit(limit, 5);
    const rows = await notificationRepository.getRecentForUser(userId, safeLimit);
    const attachmentsById = await notificationAttachmentService.listForNotificationIds(
      rows.map((r) => r.notificationId),
    );
    return rows.map((r) => mapUserNotification(r, attachmentsById));
  },

  /**
   * Get unread count for current user.
   * @param {number} userId
   */
  getUnreadCountForUser: async (userId) => {
    const unreadCount = await notificationRepository.countUnreadForUser(userId);
    return { unreadCount };
  },

  /**
   * Mark one notification as read for current user.
   * @param {number} userId
   * @param {number} userNotificationId
   */
  markAsRead: async (userId, userNotificationId) => {
    const result = await notificationRepository.markAsRead(userId, userNotificationId);
    return { updated: result.count };
  },

  /**
   * Mark all notifications as read for current user.
   * @param {number} userId
   */
  markAllAsRead: async (userId) => {
    const result = await notificationRepository.markAllAsRead(userId);
    return { updated: result.count };
  },
};

module.exports = notificationService;
