const kvkAwardService = require('../../services/forms/kvkAwardService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

const kvkAwardController = {
    /**
     * Create a new KVK Award record
     */
    createKvkAward: async (req, res) => {
        try {
            const result = await kvkAwardService.createKvkAward(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'KVK award created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in kvkAwardController.createKvkAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create KVK award',
                error: error.message
            });
        }
    },

    /**
     * Get all KVK Award records
     */
    getAllKvkAwards: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await kvkAwardService.getAllKvkAwards(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in kvkAwardController.getAllKvkAwards:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch KVK awards',
                error: error.message
            });
        }
    },

    /**
     * Get KVK Award record by ID
     */
    getKvkAwardById: async (req, res) => {
        try {
            const result = await kvkAwardService.getKvkAwardById(req.params.id, req.user);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in kvkAwardController.getKvkAwardById:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch KVK award',
                error: error.message
            });
        }
    },

    /**
     * Update KVK Award record
     */
    updateKvkAward: async (req, res) => {
        try {
            const result = await kvkAwardService.updateKvkAward(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'KVK award updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in kvkAwardController.updateKvkAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update KVK award',
                error: error.message
            });
        }
    },

    /**
     * Delete KVK Award record
     */
    deleteKvkAward: async (req, res) => {
        try {
            await kvkAwardService.deleteKvkAward(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'KVK award deleted successfully'
            });
        } catch (error) {
            console.error('Error in kvkAwardController.deleteKvkAward:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete KVK award',
                error: error.message
            });
        }
    },
};

module.exports = kvkAwardController;
