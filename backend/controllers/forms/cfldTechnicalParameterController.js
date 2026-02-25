const cfldTechnicalParameterService = require('../../services/forms/cfldTechnicalParameterService');

const cfldTechnicalParameterController = {
    create: async (req, res) => {
        try {
            const result = await cfldTechnicalParameterService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating CFLD Technical Parameter:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await cfldTechnicalParameterService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching CFLD Technical Parameters:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await cfldTechnicalParameterService.findById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching CFLD Technical Parameter:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await cfldTechnicalParameterService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating CFLD Technical Parameter:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await cfldTechnicalParameterService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting CFLD Technical Parameter:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    }
};

module.exports = cfldTechnicalParameterController;
