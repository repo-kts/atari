const productionSupplyService = require('../../services/forms/productionSupplyService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

const productionSupplyController = {
    /**
     * Create a new Production Supply record
     */
    create: async (req, res) => {
        try {
            const result = await productionSupplyService.createProductionSupply(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'Production supply record created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in productionSupplyController.create:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create production supply record',
                error: error.message
            });
        }
    },

    /**
     * Get all Production Supply records
     */
    getAll: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await productionSupplyService.getAllProductionSupply(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in productionSupplyController.getAll:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch production supply records',
                error: error.message
            });
        }
    },

    /**
     * Get Production Supply record by ID
     */
    getById: async (req, res) => {
        try {
            const result = await productionSupplyService.getProductionSupplyById(req.params.id, req.user);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in productionSupplyController.getById:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch production supply record',
                error: error.message
            });
        }
    },

    /**
     * Update Production Supply record
     */
    update: async (req, res) => {
        try {
            const result = await productionSupplyService.updateProductionSupply(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'Production supply record updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in productionSupplyController.update:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update production supply record',
                error: error.message
            });
        }
    },

    /**
     * Delete Production Supply record
     */
    delete: async (req, res) => {
        try {
            await productionSupplyService.deleteProductionSupply(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'Production supply record deleted successfully'
            });
        } catch (error) {
            console.error('Error in productionSupplyController.delete:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete production supply record',
                error: error.message
            });
        }
    },
};

module.exports = productionSupplyController; 
