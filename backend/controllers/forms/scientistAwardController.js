const scientistAwardService = require('../../services/forms/scientistAwardService.js');

const scientistAwardController = {
    createScientistAward: async (req, res) => {
        try {
            const result = await scientistAwardService.createScientistAward(req.body, req.user);
            res.status(201).json({ success: true, message: 'Scientist award created successfully', data: result });
        } catch (error) {
            console.error('Error in scientistAwardController.create:', error);
            res.status(500).json({ success: false, message: 'Failed to create scientist award' });
        }
    },

    getAllScientistAwards: async (req, res) => {
        try {
            const result = await scientistAwardService.getAllScientistAwards(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            console.error('Error in scientistAwardController.getAll:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch scientist awards' });
        }
    },

    getScientistAwardById: async (req, res) => {
        try {
            const result = await scientistAwardService.getScientistAwardById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Scientist award not found' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in scientistAwardController.getById:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch scientist award' });
        }
    },

    updateScientistAward: async (req, res) => {
        try {
            const result = await scientistAwardService.updateScientistAward(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'Scientist award updated successfully', data: result });
        } catch (error) {
            console.error('Error in scientistAwardController.update:', error);
            res.status(500).json({ success: false, message: 'Failed to update scientist award' });
        }
    },

    deleteScientistAward: async (req, res) => {
        try {
            await scientistAwardService.deleteScientistAward(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Scientist award deleted successfully' });
        } catch (error) {
            console.error('Error in scientistAwardController.delete:', error);
            res.status(500).json({ success: false, message: 'Failed to delete scientist award' });
        }
    },
};

module.exports = scientistAwardController;
