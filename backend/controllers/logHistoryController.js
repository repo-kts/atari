const logHistoryService = require('../services/logHistoryService.js');

const logHistoryController = {
  /**
   * GET /api/admin/log-history
   */
  getLogHistory: async (req, res) => {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        activity: req.query.activity,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        from: req.query.from,
        to: req.query.to,
      };

      if (req.query.kvkId !== undefined && req.query.kvkId !== null && req.query.kvkId !== '') {
        const kvkId = Number(req.query.kvkId);
        if (!Number.isInteger(kvkId) || kvkId <= 0) {
          return res.status(400).json({ error: 'Invalid kvkId' });
        }
        filters.kvkId = kvkId;
      }
      if (req.query.userId !== undefined && req.query.userId !== null && req.query.userId !== '') {
        const userId = Number(req.query.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
          return res.status(400).json({ error: 'Invalid userId' });
        }
        filters.userId = userId;
      }
      if (req.query.roleName !== undefined && req.query.roleName !== null && req.query.roleName !== '') {
        filters.roleName = req.query.roleName;
      }

      const result = await logHistoryService.getLogHistory(req.user, filters);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/log-history/kvks
   */
  getKvkOptions: async (req, res) => {
    try {
      const data = await logHistoryService.getKvkFilterOptions(req.user);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/log-history/users
   */
  getUserOptions: async (req, res) => {
    try {
      const data = await logHistoryService.getUserFilterOptions(req.user);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

module.exports = logHistoryController;
