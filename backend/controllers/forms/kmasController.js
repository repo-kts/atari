const kmasService = require('../../services/forms/kmasService.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

const kmasController = {
    create: async (req, res) => {
        try {
            const result = await kmasService.create(req.body, req.user);
            res.status(201).json({ success: true, message: 'KMAS record created successfully', data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    findAll: async (req, res) => {
        try {
            const result = await kmasService.findAll(req.query, req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    findById: async (req, res) => {
        try {
            const result = await kmasService.findById(req.params.id, req.user);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await kmasService.update(req.params.id, req.body, req.user);
            res.status(200).json({ success: true, message: 'KMAS record updated successfully', data: result });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            await kmasService.delete(req.params.id, req.user);
            res.status(200).json({ success: true, message: 'KMAS record deleted successfully' });
        } catch (error) {
            res.status(error instanceof RepositoryError ? error.statusCode : 500).json({ success: false, message: error.message });
        }
    }
};

module.exports = kmasController;
