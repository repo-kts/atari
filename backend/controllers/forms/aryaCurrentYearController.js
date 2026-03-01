const aryaCurrentYearService = require('../../services/forms/aryaCurrentYearService');

const aryaCurrentYearController = {
    getAll: async (req, res) => {
        try {
            const results = await aryaCurrentYearService.getAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error in aryaCurrentYearController.getAll:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await aryaCurrentYearService.getById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const result = await aryaCurrentYearService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in aryaCurrentYearController.create:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await aryaCurrentYearService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await aryaCurrentYearService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = aryaCurrentYearController;
