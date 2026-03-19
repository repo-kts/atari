const msgDetailsService = require('../../services/forms/msgDetailsService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

const msgDetailsController = {
    create: async (req, res) => {
        try {
            const result = await msgDetailsService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'Message Details record created successfully', data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    findAll: async (req, res) => {
        try {
            const result = await msgDetailsService.findAll(req.query, req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    findById: async (req, res) => {
        try {
            const result = await msgDetailsService.findById(req.params.id, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await msgDetailsService.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'Message Details record updated successfully', data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            await msgDetailsService.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'Message Details record deleted successfully' });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    }
};

module.exports = msgDetailsController;
