const aryaPrevYearService = require('../../services/forms/aryaPrevYearService');

const aryaPrevYearController = {
    getAll: async (req, res) => {
        try {
            const results = await aryaPrevYearService.getAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error in aryaPrevYearController.getAll:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await aryaPrevYearService.getById(req.params.id, req.user);
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
            const result = await aryaPrevYearService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in aryaPrevYearController.create:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await aryaPrevYearService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await aryaPrevYearService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = aryaPrevYearController;
