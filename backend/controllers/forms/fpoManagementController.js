const fpoManagementService = require('../../services/forms/fpoManagementService');

const fpoManagementController = {
    create: async (req, res) => {
        try {
            const result = await fpoManagementService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating FPO Management record:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await fpoManagementService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching FPO Management records:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await fpoManagementService.findById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching FPO Management record:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await fpoManagementService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating FPO Management record:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await fpoManagementService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting FPO Management record:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    }
};

module.exports = fpoManagementController;
