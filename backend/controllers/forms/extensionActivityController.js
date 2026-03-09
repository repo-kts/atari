const extensionActivityService = require('../../services/forms/extensionActivityService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

const extensionActivityController = {
    /**
     * Create a new Extension Activity
     */
    create: async (req, res) => {
        try {
            const result = await extensionActivityService.createExtensionActivity(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'Extension activity created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in extensionActivityController.create:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create extension activity',
                error: error.message
            });
        }
    },

    /**
     * Get all Extension Activities
     */
    getAll: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await extensionActivityService.getAllExtensionActivities(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in extensionActivityController.getAll:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch extension activities',
                error: error.message
            });
        }
    },

    /**
     * Get Extension Activity by ID
     */
    getById: async (req, res) => {
        try {
            const result = await extensionActivityService.getExtensionActivityById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Extension activity not found'
                });
            }
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in extensionActivityController.getById:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch extension activity',
                error: error.message
            });
        }
    },

    /**
     * Update Extension Activity
     */
    update: async (req, res) => {
        try {
            const result = await extensionActivityService.updateExtensionActivity(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'Extension activity updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in extensionActivityController.update:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update extension activity',
                error: error.message
            });
        }
    },

    /**
     * Delete Extension Activity
     */
    delete: async (req, res) => {
        try {
            await extensionActivityService.deleteExtensionActivity(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'Extension activity deleted successfully'
            });
        } catch (error) {
            console.error('Error in extensionActivityController.delete:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete extension activity',
                error: error.message
            });
        }
    },
};

module.exports = extensionActivityController;
