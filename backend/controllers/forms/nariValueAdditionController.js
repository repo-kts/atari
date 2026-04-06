const nariValueAdditionService = require('../../services/forms/nariValueAdditionService.js');

const nariValueAdditionController = {
    create: async (req, res) => {
        try {
            const result = await nariValueAdditionService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('[NariValueAdditionController] Create failed:', error);
            res.status(500).json({ success: false, message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await nariValueAdditionService.findAll(req.query, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await nariValueAdditionService.findById(req.params.id, req.user);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await nariValueAdditionService.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await nariValueAdditionService.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getResult: async (req, res) => {
        try {
            const result = await nariValueAdditionService.getResultById(req.params.id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createResult: async (req, res) => {
        try {
            const result = await nariValueAdditionService.createResult(req.params.id, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateResult: async (req, res) => {
        try {
            const result = await nariValueAdditionService.updateResult(req.params.id, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = nariValueAdditionController;
