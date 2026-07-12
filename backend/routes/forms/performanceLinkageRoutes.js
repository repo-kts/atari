const express = require('express');
const router = express.Router();
const functionalLinkageRepository = require('../../repositories/forms/functionalLinkageRepository.js');
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Helper for route generation
const createRoutes = (path, repository, moduleCode) => {
    router.get(`/${path}`, requirePermission(moduleCode, 'VIEW'), async (req, res) => {
        try {
            const data = await repository.findAll(req.query, req.user);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    router.post(`/${path}`, requirePermission(moduleCode, 'ADD'), async (req, res) => {
        try {
            const data = await repository.create(req.body, req.user);
            res.status(201).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    const updateHandler = async (req, res) => {
        try {
            const data = await repository.update(req.params.id, req.body, req.user);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    router.put(`/${path}/:id`, requirePermission(moduleCode, 'EDIT'), updateHandler);
    router.patch(`/${path}/:id`, requirePermission(moduleCode, 'EDIT'), updateHandler);

    router.delete(`/${path}/:id`, requirePermission(moduleCode, 'DELETE'), async (req, res) => {
        try {
            await repository.delete(req.params.id, req.user);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

// 1. Functional Linkage
createRoutes('functional-linkages', functionalLinkageRepository, 'performance_indicators_linkages');

module.exports = router;
