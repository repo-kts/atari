const hrdService = require('../../services/forms/hrdService');

const hrdController = {
    create: async (req, res) => {
        try {
            const result = await hrdService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const result = await hrdService.findAll(req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await hrdService.findById(id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await hrdService.update(id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await hrdService.delete(id, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = hrdController;
