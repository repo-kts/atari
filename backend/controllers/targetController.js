const targetService = require('../services/targetService.js');

const targetController = {
  getTypeOptions: async (req, res) => {
    try {
      const data = targetService.getTypeOptions();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  getKvkOptions: async (req, res) => {
    try {
      const data = await targetService.getKvkOptions(req.user);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  list: async (req, res) => {
    try {
      const data = await targetService.list(req.user, {
        page: req.query.page,
        limit: req.query.limit,
        reportingYear: req.query.reportingYear,
        kvkId: req.query.kvkId,
        typeName: req.query.typeName,
        search: req.query.search,
      });
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = await targetService.create(req.user, req.body);
      return res.status(201).json(data);
    } catch (error) {
      const isPermissionError = /permission/i.test(error.message);
      return res.status(isPermissionError ? 403 : 400).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const targetId = Number(req.params.targetId);
      if (!Number.isInteger(targetId) || targetId <= 0) {
        return res.status(400).json({ error: 'Invalid targetId' });
      }
      const data = await targetService.update(req.user, targetId, req.body);
      return res.status(200).json(data);
    } catch (error) {
      const isPermissionError = /permission/i.test(error.message);
      const isNotFound = /not found/i.test(error.message);
      const status = isPermissionError ? 403 : isNotFound ? 404 : 400;
      return res.status(status).json({ error: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const targetId = Number(req.params.targetId);
      if (!Number.isInteger(targetId) || targetId <= 0) {
        return res.status(400).json({ error: 'Invalid targetId' });
      }
      await targetService.remove(req.user, targetId);
      return res.status(200).json({ success: true });
    } catch (error) {
      const isPermissionError = /permission/i.test(error.message);
      const isNotFound = /not found/i.test(error.message);
      const status = isPermissionError ? 403 : isNotFound ? 404 : 400;
      return res.status(status).json({ error: error.message });
    }
  },
};

module.exports = targetController;
