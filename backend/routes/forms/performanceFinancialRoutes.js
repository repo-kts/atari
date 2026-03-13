const express = require('express');
const router = express.Router();
const budgetDetailRepository = require('../../repositories/forms/budgetDetailRepository');
const revolvingFundRepository = require('../../repositories/forms/revolvingFundRepository');
const revenueGenerationRepository = require('../../repositories/forms/revenueGenerationRepository');
const resourceGenerationRepository = require('../../repositories/forms/resourceGenerationRepository');
const { authenticateToken } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Helper for route generation
const createRoutes = (path, repository) => {
    router.get(`/${path}`, async (req, res) => {
        try {
            const data = await repository.findAll(req.query, req.user);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    router.post(`/${path}`, async (req, res) => {
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
    router.put(`/${path}/:id`, updateHandler);
    router.patch(`/${path}/:id`, updateHandler);

    router.delete(`/${path}/:id`, async (req, res) => {
        try {
            await repository.delete(req.params.id, req.user);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

// 1. Budget Details
createRoutes('budget-details', budgetDetailRepository);

// 2. Revolving Fund Status
createRoutes('revolving-fund', revolvingFundRepository);

// 3. Revenue Generation
createRoutes('revenue-generation', revenueGenerationRepository);

// 4. Resource Generation
createRoutes('resource-generation', resourceGenerationRepository);

module.exports = router;
