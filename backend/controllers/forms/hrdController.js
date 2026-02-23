const hrdService = require('../../services/forms/hrdService.js');

const hrdController = {
    create: async (req, res) => {
        try {
            const result = await hrdService.createHrdProgram(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'HRD program created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in hrdController.create:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create HRD program',
                error: error.message
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await hrdService.getAllHrdPrograms(req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in hrdController.getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch HRD programs',
                error: error.message
            });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await hrdService.getHrdProgramById(req.params.id);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'HRD program not found'
                });
            }
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in hrdController.getById:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch HRD program',
                error: error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            const result = await hrdService.updateHrdProgram(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'HRD program updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in hrdController.update:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update HRD program',
                error: error.message
            });
        }
    },

    delete: async (req, res) => {
        try {
            await hrdService.deleteHrdProgram(req.params.id);
            res.status(200).json({
                success: true,
                message: 'HRD program deleted successfully'
            });
        } catch (error) {
            console.error('Error in hrdController.delete:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete HRD program',
                error: error.message
            });
        }
    },
};

module.exports = hrdController;
