const mobileAppService = require('../../services/forms/mobileAppService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');

const mobileAppController = {
    create: async (req, res) => {
        try {
            const result = await mobileAppService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'Mobile App record created successfully', data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    findAll: async (req, res) => {
        try {
            const result = await mobileAppService.findAll(req.query, req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    findById: async (req, res) => {
        try {
            const result = await mobileAppService.findById(req.params.id, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await mobileAppService.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'Mobile App record updated successfully', data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            await mobileAppService.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Mobile App record deleted successfully' });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    }
};

module.exports = mobileAppController;
