const vipVisitorsService = require('../../services/forms/vipVisitorsService.js');

const vipVisitorsController = {
    findAll: async (req, res) => {
        try {
            const data = await vipVisitorsService.findAll(req.query, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const data = await vipVisitorsService.findById(req.params.id, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const data = await vipVisitorsService.create(req.body, req.user);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const data = await vipVisitorsService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await vipVisitorsService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    findAllDignitaryTypes: async (req, res) => {
        try {
            const data = await vipVisitorsService.findAllDignitaryTypes();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

module.exports = vipVisitorsController;
