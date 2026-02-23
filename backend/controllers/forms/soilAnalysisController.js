const soilAnalysisService = require('../../services/forms/soilAnalysisService.js');

const soilAnalysisController = {
    create: async (req, res) => {
        try {
            const result = await soilAnalysisService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'Soil analysis record created', data: result });
        } catch (err) {
            console.error('[SoilAnalysis] create error:', err);
            res.status(500).json({ success: false, message: 'Failed to create record', error: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const result = await soilAnalysisService.getAll(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (err) {
            console.error('[SoilAnalysis] getAll error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch records', error: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const result = await soilAnalysisService.getById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            console.error('[SoilAnalysis] getById error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch record', error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await soilAnalysisService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Record updated', data: result });
        } catch (err) {
            console.error('[SoilAnalysis] update error:', err);
            res.status(500).json({ success: false, message: 'Failed to update record', error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            await soilAnalysisService.delete(req.params.id);
            res.status(200).json({ success: true, message: 'Record deleted' });
        } catch (err) {
            console.error('[SoilAnalysis] delete error:', err);
            res.status(500).json({ success: false, message: 'Failed to delete record', error: err.message });
        }
    },
};

module.exports = soilAnalysisController;
