const kvkAwardService = require('../../services/forms/kvkAwardService.js');

const kvkAwardController = {
    createKvkAward: async (req, res, next) => {
        try {
            const result = await kvkAwardService.createKvkAward(req.body, req.user);
            res.status(201).json({ success: true, message: 'KVK award created successfully', data: result });
        } catch (error) {
            next(error);
        }
    },

    getAllKvkAwards: async (req, res, next) => {
        try {
            const result = await kvkAwardService.getAllKvkAwards(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            next(error);
        }
    },

    getKvkAwardById: async (req, res, next) => {
        try {
            const result = await kvkAwardService.getKvkAwardById(req.params.id, req.user);
            if (!result) {
                return res.status(404).json({ success: false, message: 'KVK award not found' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    updateKvkAward: async (req, res, next) => {
        try {
            const result = await kvkAwardService.updateKvkAward(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'KVK award updated successfully', data: result });
        } catch (error) {
            next(error);
        }
    },

    deleteKvkAward: async (req, res, next) => {
        try {
            await kvkAwardService.deleteKvkAward(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'KVK award deleted successfully' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = kvkAwardController;
