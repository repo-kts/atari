const scientistAwardService = require('../../services/forms/scientistAwardService.js');

const scientistAwardController = {
    createScientistAward: async (req, res, next) => {
        try {
            const result = await scientistAwardService.createScientistAward(req.body, req.user);
            res.status(201).json({ success: true, message: 'Scientist award created successfully', data: result });
        } catch (error) {
            next(error);
        }
    },

    getAllScientistAwards: async (req, res, next) => {
        try {
            const result = await scientistAwardService.getAllScientistAwards(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            next(error);
        }
    },

    getScientistAwardById: async (req, res, next) => {
        try {
            const result = await scientistAwardService.getScientistAwardById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Scientist award not found' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    updateScientistAward: async (req, res, next) => {
        try {
            console.log('--- Scientist Award Update Requested ---');
            console.log('ID:', req.params.id);
            console.log('Body:', req.body);
            const result = await scientistAwardService.updateScientistAward(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'Scientist award updated successfully', data: result });
        } catch (error) {
            console.error('Update Error:', error.message);
            next(error);
        }
    },

    deleteScientistAward: async (req, res, next) => {
        try {
            await scientistAwardService.deleteScientistAward(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Scientist award deleted successfully' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = scientistAwardController;
