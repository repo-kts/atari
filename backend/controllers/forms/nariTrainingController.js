const nariTrainingService = require('../../services/forms/nariTrainingService.js');

const mapError = (error) => {
    const msg = String(error?.message || '');
    if (/unauthorized/i.test(msg)) return { status: 401, message: 'Unauthorized' };
    if (/not found/i.test(msg)) return { status: 404, message: 'Record not found' };
    if (/valid.*required|invalid/i.test(msg)) return { status: 400, message: 'Invalid request data' };
    return { status: 500, message: 'Internal server error' };
};

const nariTrainingController = {
    getAll: async (req, res) => {
        try {
            const results = await nariTrainingService.getAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error in nariTrainingController.getAll:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await nariTrainingService.getById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    create: async (req, res) => {
        try {
            const result = await nariTrainingService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in nariTrainingController.create:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await nariTrainingService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    delete: async (req, res) => {
        try {
            await nariTrainingService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    }
};

module.exports = nariTrainingController;
