const drmrActivityService = require('../../services/forms/drmrActivityService');

const mapError = (error) => {
    const msg = String(error?.message || '');
    if (/unauthorized/i.test(msg)) return { status: 401, message: 'Unauthorized' };
    if (/not found/i.test(msg)) return { status: 404, message: 'Record not found' };
    if (/required/i.test(msg)) return { status: 400, message: msg };
    return { status: 500, message: 'Internal server error' };
};

const drmrActivityController = {
    create: async (req, res) => {
        try {
            const result = await drmrActivityService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating DRMR Activity record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await drmrActivityService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching DRMR Activity records:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await drmrActivityService.findById(req.params.id, req.user);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching DRMR Activity record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await drmrActivityService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating DRMR Activity record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    delete: async (req, res) => {
        try {
            await drmrActivityService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting DRMR Activity record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },
};

module.exports = drmrActivityController;

