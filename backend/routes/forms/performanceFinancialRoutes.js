const express = require('express');
const router = express.Router();
const budgetDetailRepository = require('../../repositories/forms/budgetDetailRepository.js');
const revolvingFundRepository = require('../../repositories/forms/revolvingFundRepository.js');
const revenueGenerationRepository = require('../../repositories/forms/revenueGenerationRepository.js');
const resourceGenerationRepository = require('../../repositories/forms/resourceGenerationRepository.js');
const projectBudgetRepository = require('../../repositories/forms/projectBudgetRepository.js');
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

// 1. Budget Details
createRoutes('budget-details', budgetDetailRepository, 'performance_indicators_budget_details');

// 2. Revolving Fund Status
createRoutes('revolving-fund', revolvingFundRepository, 'performance_indicators_revolving_fund');

// 3. Revenue Generation
createRoutes('revenue-generation', revenueGenerationRepository, 'performance_indicators_revenue_generation');

// 4. Resource Generation
createRoutes('resource-generation', resourceGenerationRepository, 'performance_indicators_resource_generation');

// 5. Project-wise Budget
createRoutes('project-budget', projectBudgetRepository, 'performance_indicators_project_budget');

module.exports = router;
