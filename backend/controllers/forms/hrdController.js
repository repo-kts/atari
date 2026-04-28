const hrdService = require('../../services/forms/hrdService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');

const hrdController = {
    /**
     * Create a new HRD Program record
     */
    create: async (req, res) => {
        try {
            const result = await hrdService.create(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'HRD program created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in hrdController.create:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create HRD program',
                error: error.message
            });
        }
    },

    /**
     * Get all HRD Program records
     */
    findAll: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await hrdService.findAll(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in hrdController.findAll:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch HRD programs',
                error: error.message
            });
        }
    },

    /**
     * Get HRD Program record by ID
     */
    findById: async (req, res) => {
        try {
            const result = await hrdService.findById(req.params.id, req.user);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in hrdController.findById:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch HRD program',
                error: error.message
            });
        }
    },

    /**
     * Update HRD Program record
     */
    update: async (req, res) => {
        try {
            const result = await hrdService.update(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'HRD program updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in hrdController.update:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update HRD program',
                error: error.message
            });
        }
    },

    /**
     * Delete HRD Program record
     */
    delete: async (req, res) => {
        try {
            await hrdService.delete(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'HRD program deleted successfully'
            });
        } catch (error) {
            console.error('Error in hrdController.delete:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete HRD program',
                error: error.message
            });
        }
    },
};

module.exports = hrdController;
