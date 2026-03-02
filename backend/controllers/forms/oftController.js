const oftService = require('../../services/forms/oftService.js');

const oftController = {
    create: async (req, res) => {
        try {
            const result = await oftService.createOft(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'OFT record created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in oftController.create:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create OFT record',
                error: error.message
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await oftService.getAllOft(req.query, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in oftController.getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch OFT records',
                error: error.message
            });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await oftService.getOftById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'OFT record not found'
                });
            }
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in oftController.getById:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch OFT record',
                error: error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            const result = await oftService.updateOft(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'OFT record updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in oftController.update:', error);
            const status = error.message.includes('not found') || error.message.includes('unauthorized') ? 403 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to update OFT record',
            });
        }
    },

    delete: async (req, res) => {
        try {
            await oftService.deleteOft(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'OFT record deleted successfully'
            });
        } catch (error) {
            console.error('Error in oftController.delete:', error);
            const status = error.message.includes('not found') || error.message.includes('unauthorized') ? 403 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to delete OFT record',
            });
        }
    },
};

module.exports = oftController;
