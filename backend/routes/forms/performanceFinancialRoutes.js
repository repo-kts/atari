const express = require('express');
const router = express.Router();
const budgetDetailRepository = require('../../repositories/forms/budgetDetailRepository.js');
const revolvingFundRepository = require('../../repositories/forms/revolvingFundRepository.js');
const revenueGenerationRepository = require('../../repositories/forms/revenueGenerationRepository.js');
const resourceGenerationRepository = require('../../repositories/forms/resourceGenerationRepository.js');
const projectBudgetRepository = require('../../repositories/forms/projectBudgetRepository.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// Helper for route generation
const createRoutes = (path, repository) => {
    router.get(`/${path}`, requireRole(allRoles), async (req, res) => {
        try {
            const data = await repository.findAll(req.query, req.user);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    router.post(`/${path}`, requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
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
    router.put(`/${path}/:id`, requireRole([...kvkRoles, 'super_admin']), updateHandler);
    router.patch(`/${path}/:id`, requireRole([...kvkRoles, 'super_admin']), updateHandler);

    router.delete(`/${path}/:id`, requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
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

// 5. Project-wise Budget
createRoutes('project-budget', projectBudgetRepository);

module.exports = router;
