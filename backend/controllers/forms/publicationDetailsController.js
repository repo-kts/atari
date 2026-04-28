const publicationDetailsService = require('../../services/forms/publicationDetailsService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');

const publicationDetailsController = {
    /**
     * Create a new Publication Details record
     */
    create: async (req, res) => {
        try {
            const result = await publicationDetailsService.createPublicationDetails(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'Publication details created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in publicationDetailsController.create:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create publication details',
                error: error.message
            });
        }
    },

    /**
     * Get all Publication Details records
     */
    getAll: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await publicationDetailsService.getAllPublicationDetails(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in publicationDetailsController.getAll:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch publication details',
                error: error.message
            });
        }
    },

    /**
     * Get Publication Details record by ID
     */
    getById: async (req, res) => {
        try {
            const result = await publicationDetailsService.getPublicationDetailsById(req.params.id, req.user);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in publicationDetailsController.getById:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch publication details',
                error: error.message
            });
        }
    },

    /**
     * Update Publication Details record
     */
    update: async (req, res) => {
        try {
            const result = await publicationDetailsService.updatePublicationDetails(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'Publication details updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in publicationDetailsController.update:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update publication details',
                error: error.message
            });
        }
    },

    /**
     * Delete Publication Details record
     */
    delete: async (req, res) => {
        try {
            await publicationDetailsService.deletePublicationDetails(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'Publication details deleted successfully'
            });
        } catch (error) {
            console.error('Error in publicationDetailsController.delete:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete publication details',
                error: error.message
            });
        }
    },
};

module.exports = publicationDetailsController;
