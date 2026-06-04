const fpoManagementService = require('../../services/forms/fpoManagementService.js');

const mapError = (error) => {
    const msg = String(error?.message || '');
    if (/unauthorized/i.test(msg)) return { status: 401, message: 'Unauthorized' };
    if (/not found/i.test(msg)) return { status: 404, message: 'Record not found' };
    if (/valid.*required|invalid/i.test(msg)) return { status: 400, message: 'Invalid request data' };
    return { status: 500, message: 'Internal server error' };
};

const fpoManagementController = {
    create: async (req, res) => {
        try {
            const result = await fpoManagementService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating FPO Management record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await fpoManagementService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching FPO Management records:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await fpoManagementService.findById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching FPO Management record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await fpoManagementService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating FPO Management record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    delete: async (req, res) => {
        try {
            await fpoManagementService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting FPO Management record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    }
};

module.exports = fpoManagementController;
