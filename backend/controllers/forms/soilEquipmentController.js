const soilEquipmentService = require('../../services/forms/soilEquipmentService.js');

const soilEquipmentController = {
    create: async (req, res) => {
        try {
            const result = await soilEquipmentService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'Soil equipment record created', data: result });
        } catch (err) {
            console.error('[SoilEquipment] create error:', err);
            res.status(500).json({ success: false, message: 'Failed to create record', error: err.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await soilEquipmentService.getAll(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (err) {
            console.error('[SoilEquipment] getAll error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch records', error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await soilEquipmentService.getById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            console.error('[SoilEquipment] getById error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch record', error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await soilEquipmentService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Soil equipment record updated', data: result });
        } catch (err) {
            console.error('[SoilEquipment] update error:', err);
            res.status(500).json({ success: false, message: 'Failed to update record', error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await soilEquipmentService.delete(req.params.id);
            res.status(200).json({ success: true, message: 'Soil equipment record deleted' });
        } catch (err) {
            console.error('[SoilEquipment] delete error:', err);
            res.status(500).json({ success: false, message: 'Failed to delete record', error: err.message });
        }
    },

    // GET /analysis-types — for dropdown population
    getAnalysisTypes: async (req, res) => {
        try {
            const result = await soilEquipmentService.getAllAnalysisTypes();
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            console.error('[SoilEquipment] getAnalysisTypes error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch analysis types', error: err.message });
        }
    },
};

module.exports = soilEquipmentController;
