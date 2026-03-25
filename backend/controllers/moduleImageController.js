const moduleImageService = require('../services/moduleImageService.js');

const moduleImageController = {
  /**
   * GET /api/admin/module-images/categories
   */
  getCategories: async (req, res) => {
    try {
      const data = await moduleImageService.getCategories(req.user);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/module-images/kvks
   */
  getKvkOptions: async (req, res) => {
    try {
      const data = await moduleImageService.getKvkOptions(req.user);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/module-images
   */
  list: async (req, res) => {
    try {
      const data = await moduleImageService.list(req.user, {
        page: req.query.page,
        limit: req.query.limit,
        reportingYear: req.query.reportingYear,
        kvkId: req.query.kvkId,
        moduleId: req.query.moduleId,
        search: req.query.search,
      });
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * POST /api/admin/module-images
   */
  create: async (req, res) => {
    try {
      const data = await moduleImageService.create(req.user, req.body);
      return res.status(201).json(data);
    } catch (error) {
      const isPermissionError =
        /only kvk-scoped users|permission/i.test(error.message);
      return res.status(isPermissionError ? 403 : 400).json({ error: error.message });
    }
  },

  /**
   * GET /api/admin/module-images/:imageId/file
   */
  getFile: async (req, res) => {
    try {
      const imageId = Number(req.params.imageId);
      if (!Number.isInteger(imageId) || imageId <= 0) {
        return res.status(400).json({ error: 'Invalid imageId' });
      }

      const data = await moduleImageService.getFileById(req.user, imageId);
      const shouldDownload = String(req.query.download || '').toLowerCase() === '1';
      const safeFileName = String(data.fileName || `module-image-${imageId}`)
        .replace(/[^\w.\-() ]+/g, '_')
        .trim() || `module-image-${imageId}`;

      res.setHeader('Content-Type', data.mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `${shouldDownload ? 'attachment' : 'inline'}; filename="${safeFileName}"`,
      );
      return res.status(200).send(data.imageData);
    } catch (error) {
      const isPermissionError = /permission/i.test(error.message);
      const isNotFound = /not found/i.test(error.message);
      const status = isPermissionError ? 403 : (isNotFound ? 404 : 400);
      return res.status(status).json({ error: error.message });
    }
  },
};

module.exports = moduleImageController;
