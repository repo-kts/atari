const oftService = require('../../services/forms/oftService.js');

const oftController = {
    create: async (req, res) => {
        try {
            const result = await oftService.createOft(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const result = await oftService.getAllOft(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getById: async (req, res) => {
        try {
            const result = await oftService.getOftById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await oftService.updateOft(req.params.id, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            await oftService.deleteOft(req.params.id);
            res.status(200).json({ success: true, message: 'Deleted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = oftController;
