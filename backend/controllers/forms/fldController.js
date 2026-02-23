const fldService = require('../../services/forms/fldService.js');

const fldController = {
    create: async (req, res) => {
        try {
            const result = await fldService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'FLD record created', data: result });
        } catch (err) {
            console.error('[FLD] create error:', err);
            res.status(500).json({ success: false, message: 'Failed to create record', error: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const result = await fldService.getAll(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (err) {
            console.error('[FLD] getAll error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch records', error: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const result = await fldService.getById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            console.error('[FLD] getById error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch record', error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await fldService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'FLD record updated', data: result });
        } catch (err) {
            console.error('[FLD] update error:', err);
            res.status(500).json({ success: false, message: 'Failed to update record', error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            await fldService.delete(req.params.id);
            res.status(200).json({ success: true, message: 'FLD record deleted' });
        } catch (err) {
            console.error('[FLD] delete error:', err);
            res.status(500).json({ success: false, message: 'Failed to delete record', error: err.message });
        }
    },
};

module.exports = fldController;
