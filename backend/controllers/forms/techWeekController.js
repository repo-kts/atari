const techWeekService = require('../../services/forms/techWeekService.js');

const techWeekController = {
    create: async (req, res) => {
        try {
            const result = await techWeekService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'Technology week record created', data: result });
        } catch (err) {
            console.error('[TechWeek] create error:', err);
            res.status(500).json({ success: false, message: 'Failed to create record', error: err.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await techWeekService.getAll(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (err) {
            console.error('[TechWeek] getAll error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch records', error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await techWeekService.getById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            console.error('[TechWeek] getById error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch record', error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await techWeekService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Technology week record updated', data: result });
        } catch (err) {
            console.error('[TechWeek] update error:', err);
            res.status(500).json({ success: false, message: 'Failed to update record', error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await techWeekService.delete(req.params.id);
            res.status(200).json({ success: true, message: 'Technology week record deleted' });
        } catch (err) {
            console.error('[TechWeek] delete error:', err);
            res.status(500).json({ success: false, message: 'Failed to delete record', error: err.message });
        }
    },
};

module.exports = techWeekController;
