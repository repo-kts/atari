const farmerAwardService = require('../../services/forms/farmerAwardService.js');

const farmerAwardController = {
    /**
     * Create a new Farmer Award
     */
    createFarmerAward: async (req, res) => {
        try {
            const data = await farmerAwardService.createFarmerAward(req.body, req.user);
            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error('Error creating Farmer Award:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Get all Farmer Awards
     */
    getAllFarmerAwards: async (req, res) => {
        try {
            const awards = await farmerAwardService.getAllFarmerAwards(req.user);
            res.json({ success: true, data: awards });
        } catch (error) {
            console.error('Error fetching Farmer Awards:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Get Farmer Award by ID
     */
    getFarmerAwardById: async (req, res) => {
        try {
            const award = await farmerAwardService.getFarmerAwardById(req.params.id, req.user);
            res.json({ success: true, data: award });
        } catch (error) {
            console.error('Error fetching Farmer Award by ID:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, error: error.message });
        }
    },

    /**
     * Update Farmer Award
     */
    updateFarmerAward: async (req, res) => {
        try {
            const award = await farmerAwardService.updateFarmerAward(req.params.id, req.body, req.user);
            res.json({ success: true, data: award });
        } catch (error) {
            console.error('Error updating Farmer Award:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Delete Farmer Award
     */
    deleteFarmerAward: async (req, res) => {
        try {
            await farmerAwardService.deleteFarmerAward(req.params.id, req.user);
            res.json({ success: true, message: 'Farmer Award deleted successfully' });
        } catch (error) {
            console.error('Error deleting Farmer Award:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
};

module.exports = farmerAwardController;
