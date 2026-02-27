const cfldBudgetUtilizationService = require('../../services/forms/cfldBudgetUtilizationService');

const cfldBudgetUtilizationController = {
    create: async (req, res) => {
        try {
            const result = await cfldBudgetUtilizationService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating CFLD Budget Utilization:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await cfldBudgetUtilizationService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching CFLD Budget Utilizations:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await cfldBudgetUtilizationService.findById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching CFLD Budget Utilization:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await cfldBudgetUtilizationService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating CFLD Budget Utilization:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await cfldBudgetUtilizationService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting CFLD Budget Utilization:', error);
            const status = error.message === 'Unauthorized' ? 403 : error.message === 'Record not found' ? 404 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    }
};

module.exports = cfldBudgetUtilizationController;
