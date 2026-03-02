const agriDroneService = require('../../services/forms/agriDroneService.js');

const agriDroneController = {
    create: async (req, res) => {
        try {
            const result = await agriDroneService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await agriDroneService.findAll(req.query, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await agriDroneService.findById(req.params.id, req.user);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await agriDroneService.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            const status = error.message.includes('not found or unauthorized') ? 403 : 500;
            res.status(status).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await agriDroneService.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            const status = error.message.includes('not found or unauthorized') ? 403 : 500;
            res.status(status).json({ success: false, message: error.message });
        }
    }
};

module.exports = agriDroneController;
