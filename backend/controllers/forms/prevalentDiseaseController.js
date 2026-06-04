const prevalentDiseaseService = require('../../services/forms/prevalentDiseaseService.js');

const prevalentDiseaseController = {
    // Crops
    cropCreate: async (req, res) => {
        try {
            const result = await prevalentDiseaseService.cropCreate(req.body, req.user);
            res.status(201).json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
    cropFindAll: async (req, res) => {
        try {
            const result = await prevalentDiseaseService.cropFindAll(req.query, req.user);
            res.json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
    cropFindById: async (req, res) => {
        try {
            const result = await prevalentDiseaseService.cropFindById(req.params.id, req.user);
            if (!result) return res.status(404).json({ message: 'Record not found' });
            res.json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
    cropUpdate: async (req, res) => {
        try {
            const result = await prevalentDiseaseService.cropUpdate(req.params.id, req.body, req.user);
            res.json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
    cropDelete: async (req, res) => {
        try {
            await prevalentDiseaseService.cropDelete(req.params.id, req.user);
            res.json({ message: 'Deleted successfully' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    // Livestock
    livestockCreate: async (req, res) => {
        try {
            const result = await prevalentDiseaseService.livestockCreate(req.body, req.user);
            res.status(201).json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
    livestockFindAll: async (req, res) => {
        try {
            const result = await prevalentDiseaseService.livestockFindAll(req.query, req.user);
            res.json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
    livestockFindById: async (req, res) => {
        try {
            const result = await prevalentDiseaseService.livestockFindById(req.params.id, req.user);
            if (!result) return res.status(404).json({ message: 'Record not found' });
            res.json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
    livestockUpdate: async (req, res) => {
        try {
            const result = await prevalentDiseaseService.livestockUpdate(req.params.id, req.body, req.user);
            res.json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
    livestockDelete: async (req, res) => {
        try {
            await prevalentDiseaseService.livestockDelete(req.params.id, req.user);
            res.json({ message: 'Deleted successfully' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },
};

module.exports = prevalentDiseaseController;
