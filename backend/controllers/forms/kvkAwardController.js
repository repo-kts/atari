const kvkAwardService = require('../../services/forms/kvkAwardService.js');

const kvkAwardController = {
    createKvkAward: async (req, res) => {
        try {
            const result = await kvkAwardService.createKvkAward(req.body, req.user);
            res.status(201).json({ success: true, message: 'KVK award created successfully', data: result });
        } catch (error) {
            console.error('Error in kvkAwardController.create:', error);
            res.status(500).json({ success: false, message: 'Failed to create KVK award' });
        }
    },

    getAllKvkAwards: async (req, res) => {
        try {
            const result = await kvkAwardService.getAllKvkAwards(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            console.error('Error in kvkAwardController.getAll:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch KVK awards' });
        }
    },

    getKvkAwardById: async (req, res) => {
        try {
            const result = await kvkAwardService.getKvkAwardById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({ success: false, message: 'KVK award not found' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in kvkAwardController.getById:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch KVK award' });
        }
    },

    updateKvkAward: async (req, res) => {
        try {
            const result = await kvkAwardService.updateKvkAward(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'KVK award updated successfully', data: result });
        } catch (error) {
            console.error('Error in kvkAwardController.update:', error);
            res.status(500).json({ success: false, message: 'Failed to update KVK award' });
        }
    },

    deleteKvkAward: async (req, res) => {
        try {
            await kvkAwardService.deleteKvkAward(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'KVK award deleted successfully' });
        } catch (error) {
            console.error('Error in kvkAwardController.delete:', error);
            res.status(500).json({ success: false, message: 'Failed to delete KVK award' });
        }
    },
};

module.exports = kvkAwardController;
