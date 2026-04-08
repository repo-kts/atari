const techWeekRepository = require('../../repositories/forms/techWeekRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');

const techWeekController = {
    create: async (req, res) => {
        try {
            const result = await techWeekRepository.create(req.body, req.user);
            const kvkId = result?.kvkId ?? req.user?.kvkId;
            await reportCacheInvalidationService.invalidateDataSourceForKvk('technologyWeekCelebrationReport', kvkId);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in techWeekController:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({ 
                success: false, 
                message: error.message || 'An error occurred',
                error: error.message 
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await techWeekRepository.findAll(req.query, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in techWeekController:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({ 
                success: false, 
                message: error.message || 'An error occurred',
                error: error.message 
            });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await techWeekRepository.findById(req.params.id, req.user);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in techWeekController:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({ 
                success: false, 
                message: error.message || 'An error occurred',
                error: error.message 
            });
        }
    },

    update: async (req, res) => {
        try {
            const result = await techWeekRepository.update(req.params.id, req.body, req.user);
            const kvkId = result?.kvkId ?? req.user?.kvkId;
            await reportCacheInvalidationService.invalidateDataSourceForKvk('technologyWeekCelebrationReport', kvkId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in techWeekController:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({ 
                success: false, 
                message: error.message || 'An error occurred',
                error: error.message 
            });
        }
    },

    delete: async (req, res) => {
        try {
            const existing = await techWeekRepository.findById(req.params.id, req.user);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
            }
            await techWeekRepository.delete(req.params.id, req.user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk('technologyWeekCelebrationReport', existing.kvkId);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            console.error('Error in techWeekController:', error);
            const statusCode = error instanceof RepositoryError ? error.statusCode : 500;
            res.status(statusCode).json({ 
                success: false, 
                message: error.message || 'An error occurred',
                error: error.message 
            });
        }
    }
};

module.exports = techWeekController;
