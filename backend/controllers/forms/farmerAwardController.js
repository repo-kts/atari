const farmerAwardService = require('../../services/forms/farmerAwardService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');

const farmerAwardController = {
    /**
     * Create a new Farmer Award record
     */
    createFarmerAward: async (req, res) => {
        try {
            const result = await farmerAwardService.createFarmerAward(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'Farmer award created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in farmerAwardController.createFarmerAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create farmer award',
                error: error.message
            });
        }
    },

    /**
     * Get all Farmer Award records
     */
    getAllFarmerAwards: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await farmerAwardService.getAllFarmerAwards(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in farmerAwardController.getAllFarmerAwards:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch farmer awards',
                error: error.message
            });
        }
    },

    /**
     * Get Farmer Award record by ID
     */
    getFarmerAwardById: async (req, res) => {
        try {
            const result = await farmerAwardService.getFarmerAwardById(req.params.id, req.user);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in farmerAwardController.getFarmerAwardById:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch farmer award',
                error: error.message
            });
        }
    },

    /**
     * Update Farmer Award record
     */
    updateFarmerAward: async (req, res) => {
        try {
            const result = await farmerAwardService.updateFarmerAward(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'Farmer award updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in farmerAwardController.updateFarmerAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update farmer award',
                error: error.message
            });
        }
    },

    /**
     * Delete Farmer Award record
     */
    deleteFarmerAward: async (req, res) => {
        try {
            await farmerAwardService.deleteFarmerAward(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'Farmer award deleted successfully'
            });
        } catch (error) {
            console.error('Error in farmerAwardController.deleteFarmerAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete farmer award',
                error: error.message
            });
        }
    },
};

module.exports = farmerAwardController;
