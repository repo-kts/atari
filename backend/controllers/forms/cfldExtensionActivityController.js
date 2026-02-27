const cfldExtensionActivityService = require('../../services/forms/cfldExtensionActivityService');

const cfldExtensionActivityController = {
    create: async (req, res) => {
        try {
            const result = await cfldExtensionActivityService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating CFLD Extension Activity:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await cfldExtensionActivityService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching CFLD Extension Activities:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await cfldExtensionActivityService.findById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching CFLD Extension Activity:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await cfldExtensionActivityService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating CFLD Extension Activity:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await cfldExtensionActivityService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting CFLD Extension Activity:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    }
};

module.exports = cfldExtensionActivityController;
