const meetingsService = require('../../services/forms/meetingsService');

const createControllerLayer = (service) => ({
    findAll: async (req, res) => {
        try {
            const data = await service.findAll(req.query, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    findById: async (req, res) => {
        try {
            const data = await service.findById(req.params.id, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    },
    create: async (req, res) => {
        try {
            const data = await service.create(req.body, req.user);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const data = await service.update(req.params.id, req.body, req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            await service.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
});

const meetingsController = {
    sac: createControllerLayer(meetingsService.sac),
    other: createControllerLayer(meetingsService.other),
};

module.exports = meetingsController;
