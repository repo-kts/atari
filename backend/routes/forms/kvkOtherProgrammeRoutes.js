const express = require('express');
const router = express.Router();
const kvkOtherProgrammeService = require('../../services/forms/kvkOtherProgrammeService.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/', requireRole(allRoles), async (req, res) => {
    try {
        const data = await kvkOtherProgrammeService.getAll(req.query, req.user);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.get('/:id', requireRole(allRoles), async (req, res) => {
    try {
        const data = await kvkOtherProgrammeService.getById(req.params.id, req.user);
        if (!data) return res.status(404).json({ message: 'Record not found' });
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post('/', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await kvkOtherProgrammeService.create(req.body, req.user);
        res.status(201).json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.put('/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await kvkOtherProgrammeService.update(req.params.id, req.body, req.user);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await kvkOtherProgrammeService.delete(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    } 
});

module.exports = router;
