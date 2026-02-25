const soilWaterService = require('../../services/forms/soilWaterService');

const soilWaterController = {
    // Equipment
    createEquipment: async (req, res) => {
        try {
            const result = await soilWaterService.createEquipment(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating soil equipment:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getAllEquipment: async (req, res) => {
        try {
            const result = await soilWaterService.getAllEquipment(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            console.error('Error fetching soil equipment:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    updateEquipment: async (req, res) => {
        try {
            const result = await soilWaterService.updateEquipment(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating soil equipment:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    deleteEquipment: async (req, res) => {
        try {
            await soilWaterService.deleteEquipment(req.params.id, req.user);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting soil equipment:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Analysis
    createAnalysis: async (req, res) => {
        try {
            const result = await soilWaterService.createAnalysis(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating soil analysis:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getAllAnalysis: async (req, res) => {
        try {
            const result = await soilWaterService.getAllAnalysis(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            console.error('Error fetching soil analysis:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    updateAnalysis: async (req, res) => {
        try {
            const result = await soilWaterService.updateAnalysis(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating soil analysis:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    deleteAnalysis: async (req, res) => {
        try {
            await soilWaterService.deleteAnalysis(req.params.id, req.user);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting soil analysis:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // World Soil Day
    createWorldSoilDay: async (req, res) => {
        try {
            const result = await soilWaterService.createWorldSoilDay(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating world soil day:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getAllWorldSoilDay: async (req, res) => {
        try {
            const result = await soilWaterService.getAllWorldSoilDay(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            console.error('Error fetching world soil day:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    updateWorldSoilDay: async (req, res) => {
        try {
            const result = await soilWaterService.updateWorldSoilDay(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating world soil day:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    deleteWorldSoilDay: async (req, res) => {
        try {
            await soilWaterService.deleteWorldSoilDay(req.params.id, req.user);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting world soil day:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Master
    getAllAnalysisMasters: async (req, res) => {
        try {
            const result = await soilWaterService.getAllAnalysisMasters();
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching analysis masters:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = soilWaterController;
