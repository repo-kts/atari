const otherExtensionActivityService = require('../../services/forms/otherExtensionActivityService.js');

const otherExtensionActivityController = {
    create: async (req, res) => {
        try {
            const result = await otherExtensionActivityService.createOtherExtensionActivity(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'Other extension activity created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in otherExtensionActivityController.create:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create other extension activity',
                error: error.message
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await otherExtensionActivityService.getAllOtherExtensionActivities(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in otherExtensionActivityController.getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch other extension activities',
                error: error.message
            });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await otherExtensionActivityService.getOtherExtensionActivityById(req.params.id);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Other extension activity not found'
                });
            }
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in otherExtensionActivityController.getById:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch other extension activity',
                error: error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            const result = await otherExtensionActivityService.updateOtherExtensionActivity(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'Other extension activity updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in otherExtensionActivityController.update:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update other extension activity',
                error: error.message
            });
        }
    },

    delete: async (req, res) => {
        try {
            await otherExtensionActivityService.deleteOtherExtensionActivity(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Other extension activity deleted successfully'
            });
        } catch (error) {
            console.error('Error in otherExtensionActivityController.delete:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete other extension activity',
                error: error.message
            });
        }
    },
};

module.exports = otherExtensionActivityController;
