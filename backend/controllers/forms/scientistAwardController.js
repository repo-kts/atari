const scientistAwardService = require('../../services/forms/scientistAwardService.js');

const scientistAwardController = {
    /**
     * Create a new Scientist Award
     */
    createScientistAward: async (req, res) => {
        try {
            const data = await scientistAwardService.createScientistAward(req.body, req.user);
            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error('Error creating Scientist Award:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Get all Scientist Awards
     */
    getAllScientistAwards: async (req, res) => {
        try {
            const awards = await scientistAwardService.getAllScientistAwards(req.user);
            res.json({ success: true, data: awards });
        } catch (error) {
            console.error('Error fetching Scientist Awards:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Get Scientist Award by ID
     */
    getScientistAwardById: async (req, res) => {
        try {
            const award = await scientistAwardService.getScientistAwardById(req.params.id, req.user);
            res.json({ success: true, data: award });
        } catch (error) {
            console.error('Error fetching Scientist Award by ID:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, error: error.message });
        }
    },

    /**
     * Update Scientist Award
     */
    updateScientistAward: async (req, res) => {
        try {
            const award = await scientistAwardService.updateScientistAward(req.params.id, req.body, req.user);
            res.json({ success: true, data: award });
        } catch (error) {
            console.error('Error updating Scientist Award:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Delete Scientist Award
     */
    deleteScientistAward: async (req, res) => {
        try {
            await scientistAwardService.deleteScientistAward(req.params.id, req.user);
            res.json({ success: true, message: 'Scientist Award deleted successfully' });
        } catch (error) {
            console.error('Error deleting Scientist Award:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
};

module.exports = scientistAwardController;
