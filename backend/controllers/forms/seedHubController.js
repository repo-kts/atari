const seedHubService = require('../../services/forms/seedHubService');

const seedHubController = {
    getAll: async (req, res) => {
        try {
            const results = await seedHubService.getAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error in seedHubController.getAll:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await seedHubService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const result = await seedHubService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in seedHubController.create:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await seedHubService.update(req.params.id, req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await seedHubService.delete(req.params.id);
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = seedHubController;
