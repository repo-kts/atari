const nykTrainingService = require('../../services/forms/nykTrainingService.js');

const nykTrainingController = {
    findAll: async (req, res) => {
        try {
            const data = await nykTrainingService.findAll(req.query, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const data = await nykTrainingService.findById(req.params.id, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const data = await nykTrainingService.create(req.body, req.user);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const data = await nykTrainingService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await nykTrainingService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

module.exports = nykTrainingController;
