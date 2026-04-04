const craExtensionActivityRepository = require('../../repositories/forms/craExtensionActivityRepository.js');
const craDetailsRepository = require('../../repositories/forms/craDetailsRepository.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');

const craExtensionActivityController = {
    // Details Handlers
    createDetails: async (req, res) => {
        try {
            const result = await craDetailsRepository.create(req.body, null, req.user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk('craDetails', result?.kvkId || req.user?.kvkId);
            res.status(201).json({
                success: true,
                message: 'CRA Details created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in craExtensionActivityController.createDetails:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to create CRA details' });
        }
    },

    getAllDetails: async (req, res) => {
        try {
            const result = await craDetailsRepository.findAll(req.query, req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            console.error('Error in craExtensionActivityController.getAllDetails:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch CRA details' });
        }
    },

    getDetailsById: async (req, res) => {
        try {
            const result = await craDetailsRepository.findById(req.params.id, req.user);
            if (!result) return res.status(404).json({ success: false, message: 'CRA details not found' });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in craExtensionActivityController.getDetailsById:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch CRA details' });
        }
    },

    updateDetails: async (req, res) => {
        try {
            const result = await craDetailsRepository.update(req.params.id, req.body, req.user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk('craDetails', result?.kvkId || req.user?.kvkId);
            res.status(200).json({ success: true, message: 'CRA details updated successfully', data: result });
        } catch (error) {
            console.error('Error in craExtensionActivityController.updateDetails:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to update CRA details' });
        }
    },

    deleteDetails: async (req, res) => {
        try {
            const existing = await craDetailsRepository.findById(req.params.id, req.user);
            await craDetailsRepository.delete(req.params.id, req.user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk('craDetails', existing?.kvkId || req.user?.kvkId);
            res.status(200).json({ success: true, message: 'CRA details deleted successfully' });
        } catch (error) {
            console.error('Error in craExtensionActivityController.deleteDetails:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete CRA details' });
        }
    },

    // Extension Activity Handlers
    create: async (req, res) => {
        try {
            const result = await craExtensionActivityRepository.create(req.body, null, req.user);
            res.status(201).json({
                success: true,
                message: 'Extension activity created successfully for CRA',
                data: result
            });
        } catch (error) {
            console.error('Error in craExtensionActivityController.create:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create extension activity',
                error: error.message
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const filters = req.query || {};
            const result = await craExtensionActivityRepository.findAll(filters, req.user);
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error('Error in craExtensionActivityController.getAll:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch extension activities',
                error: error.message
            });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await craExtensionActivityRepository.findById(req.params.id, req.user);
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
            console.error('Error in craExtensionActivityController.getById:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch extension activity',
                error: error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            const result = await craExtensionActivityRepository.update(req.params.id, req.body, req.user);
            res.status(200).json({
                success: true,
                message: 'Extension activity updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in craExtensionActivityController.update:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update extension activity',
                error: error.message
            });
        }
    },

    delete: async (req, res) => {
        try {
            await craExtensionActivityRepository.delete(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'Extension activity deleted successfully'
            });
        } catch (error) {
            console.error('Error in craExtensionActivityController.delete:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete extension activity',
                error: error.message
            });
        }
    },
};

module.exports = craExtensionActivityController;
