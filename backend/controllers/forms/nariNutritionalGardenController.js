const nariNutritionalGardenService = require('../../services/forms/nariNutritionalGardenService.js');

const nariNutritionalGardenController = {
    create: async (req, res) => {
        try {
            const result = await nariNutritionalGardenService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await nariNutritionalGardenService.findAll(req.query, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await nariNutritionalGardenService.findById(req.params.id, req.user);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await nariNutritionalGardenService.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await nariNutritionalGardenService.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getResult: async (req, res) => {
        try {
            const result = await nariNutritionalGardenService.getResultById(req.params.id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createResult: async (req, res) => {
        try {
            const result = await nariNutritionalGardenService.createResult(req.params.id, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateResult: async (req, res) => {
        try {
            const result = await nariNutritionalGardenService.updateResult(req.params.id, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = nariNutritionalGardenController;
