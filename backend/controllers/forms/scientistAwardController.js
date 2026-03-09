const scientistAwardService = require('../../services/forms/scientistAwardService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

const scientistAwardController = {
    /**
     * Create a new Scientist Award record
     */
    createScientistAward: async (req, res) => {
        try {
            const result = await scientistAwardService.createScientistAward(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'Scientist award created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in scientistAwardController.createScientistAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create scientist award',
                error: error.message
            });
        }
    },

    /**
     * Get all Scientist Award records
     */
    getAllScientistAwards: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await scientistAwardService.getAllScientistAwards(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in scientistAwardController.getAllScientistAwards:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch scientist awards',
                error: error.message
            });
        }
    },

    /**
     * Get Scientist Award record by ID
     */
    getScientistAwardById: async (req, res) => {
        try {
            const result = await scientistAwardService.getScientistAwardById(req.params.id, req.user);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in scientistAwardController.getScientistAwardById:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch scientist award',
                error: error.message
            });
        }
    },

    /**
     * Update Scientist Award record
     */
    updateScientistAward: async (req, res) => {
        try {
            const result = await scientistAwardService.updateScientistAward(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'Scientist award updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in scientistAwardController.updateScientistAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update scientist award',
                error: error.message
            });
        }
    },

    /**
     * Delete Scientist Award record
     */
    deleteScientistAward: async (req, res) => {
        try {
            await scientistAwardService.deleteScientistAward(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'Scientist award deleted successfully'
            });
        } catch (error) {
            console.error('Error in scientistAwardController.deleteScientistAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete scientist award',
                error: error.message
            });
        }
    },
};

module.exports = scientistAwardController;
