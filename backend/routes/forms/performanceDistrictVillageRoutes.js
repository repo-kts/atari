const express = require('express');
const router = express.Router();
const operationalAreaRepository = require('../../repositories/forms/operationalAreaRepository.js');
const villageAdoptionRepository = require('../../repositories/forms/villageAdoptionRepository.js');
const priorityThrustAreaRepository = require('../../repositories/forms/priorityThrustAreaRepository.js');
const districtLevelDataRepository = require('../../repositories/forms/districtLevelDataRepository.js');
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const { sendFormRouteError } = require('../../utils/errorHandler.js');

// All routes require authentication
router.use(authenticateToken);

// Helper for route generation
const createRoutes = (router, path, repository, moduleCode) => {
    router.get(`${path}`, requirePermission(moduleCode, 'VIEW'), async (req, res) => {
        try {
            const data = await repository.findAll(req.query, req.user);
            res.json(data);
        } catch (error) {
            sendFormRouteError(res, error);
        }
    });

    router.post(`${path}`, requirePermission(moduleCode, 'ADD'), async (req, res) => {
        try {
            const data = await repository.create(req.body, req.user);
            res.status(201).json(data);
        } catch (error) {
            sendFormRouteError(res, error);
        }
    });

    const updateHandler = async (req, res) => {
        try {
            const data = await repository.update(req.params.id, req.body, req.user);
            res.json(data);
        } catch (error) {
            sendFormRouteError(res, error);
        }
    };
    router.put(`${path}/:id`, requirePermission(moduleCode, 'EDIT'), updateHandler);
    router.patch(`${path}/:id`, requirePermission(moduleCode, 'EDIT'), updateHandler);

    router.delete(`${path}/:id`, requirePermission(moduleCode, 'DELETE'), async (req, res) => {
        try {
            await repository.delete(req.params.id, req.user);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            sendFormRouteError(res, error);
        }
    });
};

// Route configurations
const routeConfigs = [
    { path: '/operational-areas', repository: operationalAreaRepository, moduleCode: 'performance_indicators_operational_area' },
    { path: '/village-adoptions', repository: villageAdoptionRepository, moduleCode: 'performance_indicators_village_adoption' },
    { path: '/priority-thrust-areas', repository: priorityThrustAreaRepository, moduleCode: 'performance_indicators_priority_thrust_area' },
    { path: '/district-levels', repository: districtLevelDataRepository, moduleCode: 'performance_indicators_district_level_data' },
];

// Create standard CRUD routes for each configuration
routeConfigs.forEach(config => {
    createRoutes(router, config.path, config.repository, config.moduleCode);
});

module.exports = router;
