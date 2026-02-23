const celebrationDaysService = require('../../services/forms/celebrationDaysService.js');

const celebrationDaysController = {
    create: async (req, res) => {
        try {
            const result = await celebrationDaysService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'Celebration day record created', data: result });
        } catch (err) {
            console.error('[CelebrationDays] create error:', err);
            res.status(500).json({ success: false, message: 'Failed to create record', error: err.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await celebrationDaysService.getAll(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (err) {
            console.error('[CelebrationDays] getAll error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch records', error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const result = await celebrationDaysService.getById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Record not found' });
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            console.error('[CelebrationDays] getById error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch record', error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const result = await celebrationDaysService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Celebration day record updated', data: result });
        } catch (err) {
            console.error('[CelebrationDays] update error:', err);
            res.status(500).json({ success: false, message: 'Failed to update record', error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await celebrationDaysService.delete(req.params.id);
            res.status(200).json({ success: true, message: 'Celebration day record deleted' });
        } catch (err) {
            console.error('[CelebrationDays] delete error:', err);
            res.status(500).json({ success: false, message: 'Failed to delete record', error: err.message });
        }
    },
};

module.exports = celebrationDaysController;
