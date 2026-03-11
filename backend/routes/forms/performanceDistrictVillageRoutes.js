const express = require('express');
const router = express.Router();
const operationalAreaRepository = require('../../repositories/forms/operationalAreaRepository');
const villageAdoptionRepository = require('../../repositories/forms/villageAdoptionRepository');
const priorityThrustAreaRepository = require('../../repositories/forms/priorityThrustAreaRepository');
const { authenticateToken } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Helper for route generation
const createRoutes = (router, path, repository) => {
    router.get(`${path}`, async (req, res) => {
        try {
            const data = await repository.findAll(req.query, req.user);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    router.post(`${path}`, async (req, res) => {
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
    router.put(`${path}/:id`, updateHandler);
    router.patch(`${path}/:id`, updateHandler);

    router.delete(`${path}/:id`, async (req, res) => {
        try {
            await repository.delete(req.params.id, req.user);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

// Route configurations
const routeConfigs = [
    { path: '/operational-areas', repository: operationalAreaRepository },
    { path: '/village-adoptions', repository: villageAdoptionRepository },
    { path: '/priority-thrust-areas', repository: priorityThrustAreaRepository },
];

// Create standard CRUD routes for each configuration
routeConfigs.forEach(config => {
    createRoutes(router, config.path, config.repository);
});

module.exports = router;
