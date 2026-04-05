const nariBioFortifiedCropService = require('../../services/forms/nariBioFortifiedCropService.js');

const nariBioFortifiedCropController = {
    create: async (req, res) => {
        try {
            const result = await nariBioFortifiedCropService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('[NariBioFortifiedCropController] Create failed:', error);
            res.status(500).json({ success: false, message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await nariBioFortifiedCropService.findAll(req.query, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await nariBioFortifiedCropService.findById(req.params.id, req.user);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await nariBioFortifiedCropService.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await nariBioFortifiedCropService.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getResult: async (req, res) => {
        try {
            const result = await nariBioFortifiedCropService.getResultById(req.params.id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createResult: async (req, res) => {
        try {
            const result = await nariBioFortifiedCropService.createResult(req.params.id, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateResult: async (req, res) => {
        try {
            const result = await nariBioFortifiedCropService.updateResult(req.params.id, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = nariBioFortifiedCropController;
