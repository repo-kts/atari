const webPortalService = require('../../services/forms/webPortalService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');

const webPortalController = {
    create: async (req, res) => {
        try {
            const result = await webPortalService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'Web Portal record created successfully', data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    findAll: async (req, res) => {
        try {
            const result = await webPortalService.findAll(req.query, req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    findById: async (req, res) => {
        try {
            const result = await webPortalService.findById(req.params.id, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await webPortalService.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'Web Portal record updated successfully', data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            await webPortalService.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Web Portal record deleted successfully' });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    }
};

module.exports = webPortalController;
