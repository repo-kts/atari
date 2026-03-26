const service = require('../../services/forms/agriDroneDemonstrationService.js');

const agriDroneDemonstrationController = {
    create: async (req, res) => {
        try {
            const result = await service.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await service.findAll(req.query, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await service.findById(req.params.id, req.user);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await service.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await service.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },
};

module.exports = agriDroneDemonstrationController;

