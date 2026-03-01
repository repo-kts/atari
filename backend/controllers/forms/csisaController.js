const csisaService = require('../../services/forms/csisaService.js');

const csisaController = {
    create: async (req, res) => {
        try {
            const result = await csisaService.createCSISA(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'CSISA record created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in csisaController.create:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create CSISA record',
                error: error.message
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await csisaService.getAllCSISA(req.query, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in csisaController.getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch CSISA records',
                error: error.message
            });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await csisaService.getCSISAById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'CSISA record not found'
                });
            }
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in csisaController.getById:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch CSISA record',
                error: error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            const result = await csisaService.updateCSISA(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'CSISA record updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in csisaController.update:', error);
            const status = error.message.includes('not found') || error.message.includes('unauthorized') ? 403 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to update CSISA record',
            });
        }
    },

    delete: async (req, res) => {
        try {
            await csisaService.deleteCSISA(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'CSISA record deleted successfully'
            });
        } catch (error) {
            console.error('Error in csisaController.delete:', error);
            const status = error.message.includes('not found') || error.message.includes('unauthorized') ? 403 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to delete CSISA record',
            });
        }
    },
};

module.exports = csisaController;
