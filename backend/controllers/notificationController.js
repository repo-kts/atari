const notificationService = require('../services/notificationService.js');

const notificationController = {
  /**
   * GET /api/admin/notifications
   */
  listForCurrentUser: async (req, res) => {
    try {
      const result = await notificationService.getNotificationsForUser(req.user.userId, {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        status: req.query.status,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/notifications/recent
   */
  getRecentForCurrentUser: async (req, res) => {
    try {
      const limit = req.query.limit !== undefined ? Number(req.query.limit) : 5;
      const data = await notificationService.getRecentForUser(req.user.userId, limit);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/notifications/unread-count
   */
  getUnreadCountForCurrentUser: async (req, res) => {
    try {
      const data = await notificationService.getUnreadCountForUser(req.user.userId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/notifications/users
   * (super_admin only)
   */
  getRecipientUsers: async (req, res) => {
    try {
      const data = await notificationService.getRecipientUsers(req.user);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(403).json({ error: error.message });
    }
  },

  /**
   * POST /api/admin/notifications
   * (super_admin only)
   */
  createNotification: async (req, res) => {
    try {
      const data = await notificationService.createNotification(req.user, req.body);
      return res.status(201).json(data);
    } catch (error) {
      const isPermissionError = /only super_admin/i.test(error.message);
      return res.status(isPermissionError ? 403 : 400).json({ error: error.message });
    }
  },

  /**
   * PATCH /api/admin/notifications/read-all
   */
  markAllAsRead: async (req, res) => {
    try {
      const data = await notificationService.markAllAsRead(req.user.userId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * PATCH /api/admin/notifications/:userNotificationId/read
   */
  markAsRead: async (req, res) => {
    try {
      const userNotificationId = Number(req.params.userNotificationId);
      if (!Number.isInteger(userNotificationId) || userNotificationId <= 0) {
        return res.status(400).json({ error: 'Invalid userNotificationId' });
      }

      const data = await notificationService.markAsRead(req.user.userId, userNotificationId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

module.exports = notificationController;
