const farmerAwardService = require('../../services/forms/farmerAwardService.js');

const farmerAwardController = {
    createFarmerAward: async (req, res, next) => {
        try {
            const result = await farmerAwardService.createFarmerAward(req.body, req.user);
            res.status(201).json({ success: true, message: 'Farmer award created successfully', data: result });
        } catch (error) {
            next(error);
        }
    },

    getAllFarmerAwards: async (req, res, next) => {
        try {
            const result = await farmerAwardService.getAllFarmerAwards(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            next(error);
        }
    },

    getFarmerAwardById: async (req, res, next) => {
        try {
            const result = await farmerAwardService.getFarmerAwardById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Farmer award not found' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    updateFarmerAward: async (req, res, next) => {
        try {
            const result = await farmerAwardService.updateFarmerAward(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'Farmer award updated successfully', data: result });
        } catch (error) {
            next(error);
        }
    },

    deleteFarmerAward: async (req, res, next) => {
        try {
            await farmerAwardService.deleteFarmerAward(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Farmer award deleted successfully' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = farmerAwardController;
