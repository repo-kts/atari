const fpoCbboDetailsService = require('../../services/forms/fpoCbboDetailsService');

const fpoCbboDetailsController = {
    create: async (req, res) => {
        try {
            const result = await fpoCbboDetailsService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating FPO CBBO Details record:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await fpoCbboDetailsService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching FPO CBBO Details records:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await fpoCbboDetailsService.findById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching FPO CBBO Details record:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await fpoCbboDetailsService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating FPO CBBO Details record:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await fpoCbboDetailsService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting FPO CBBO Details record:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    }
};

module.exports = fpoCbboDetailsController;
