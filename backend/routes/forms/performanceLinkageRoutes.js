const express = require('express');
const router = express.Router();
const functionalLinkageRepository = require('../../repositories/forms/functionalLinkageRepository.js');
const specialProgrammeRepository = require('../../repositories/forms/specialProgrammeRepository.js');
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

// 1. Functional Linkage
createRoutes('functional-linkages', functionalLinkageRepository);

// 2. Special Programmes
createRoutes('special-programmes', specialProgrammeRepository);

module.exports = router;
