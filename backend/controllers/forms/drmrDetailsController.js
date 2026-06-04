const drmrDetailsService = require('../../services/forms/drmrDetailsService.js');

const mapError = (error) => {
    const msg = String(error?.message || '');
    if (/unauthorized/i.test(msg)) return { status: 401, message: 'Unauthorized' };
    if (/not found/i.test(msg)) return { status: 404, message: 'Record not found' };
    return { status: 500, message: 'Internal server error' };
};

const drmrDetailsController = {
    create: async (req, res) => {
        try {
            const result = await drmrDetailsService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating DRMR Details record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await drmrDetailsService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching DRMR Details records:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await drmrDetailsService.findById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching DRMR Details record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await drmrDetailsService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error updating DRMR Details record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    },

    delete: async (req, res) => {
        try {
            await drmrDetailsService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting DRMR Details record:', error);
            const { status, message } = mapError(error);
            res.status(status).json({ success: false, message });
        }
    }
};

module.exports = drmrDetailsController;
