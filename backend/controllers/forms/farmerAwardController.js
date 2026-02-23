const farmerAwardService = require('../../services/forms/farmerAwardService.js');

const farmerAwardController = {
    createFarmerAward: async (req, res) => {
        try {
            const result = await farmerAwardService.createFarmerAward(req.body, req.user);
            res.status(201).json({ success: true, message: 'Farmer award created successfully', data: result });
        } catch (error) {
            console.error('Error in farmerAwardController.create:', error);
            res.status(500).json({ success: false, message: 'Failed to create farmer award' });
        }
    },

    getAllFarmerAwards: async (req, res) => {
        try {
            const result = await farmerAwardService.getAllFarmerAwards(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            console.error('Error in farmerAwardController.getAll:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch farmer awards' });
        }
    },

    getFarmerAwardById: async (req, res) => {
        try {
            const result = await farmerAwardService.getFarmerAwardById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Farmer award not found' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in farmerAwardController.getById:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch farmer award' });
        }
    },

    updateFarmerAward: async (req, res) => {
        try {
            const result = await farmerAwardService.updateFarmerAward(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'Farmer award updated successfully', data: result });
        } catch (error) {
            console.error('Error in farmerAwardController.update:', error);
            res.status(500).json({ success: false, message: 'Failed to update farmer award' });
        }
    },

    deleteFarmerAward: async (req, res) => {
        try {
            await farmerAwardService.deleteFarmerAward(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Farmer award deleted successfully' });
        } catch (error) {
            console.error('Error in farmerAwardController.delete:', error);
            res.status(500).json({ success: false, message: 'Failed to delete farmer award' });
        }
    },
};

module.exports = farmerAwardController;
