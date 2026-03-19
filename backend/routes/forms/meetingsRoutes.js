const express = require('express');
const router = express.Router();
const meetingsController = require('../../controllers/forms/meetingsController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// Use auth middleware for all routes
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// SAC Meetings
router.post('/sac', requireRole([...kvkRoles, 'super_admin']), meetingsController.sac.create);
router.get('/sac', requireRole(allRoles), meetingsController.sac.findAll);
router.get('/sac/:id', requireRole(allRoles), meetingsController.sac.findById);
router.put('/sac/:id', requireRole([...kvkRoles, 'super_admin']), meetingsController.sac.update);
router.patch('/sac/:id', requireRole([...kvkRoles, 'super_admin']), meetingsController.sac.update);
router.delete('/sac/:id', requireRole([...kvkRoles, 'super_admin']), meetingsController.sac.delete);

// Other Meetings
router.post('/other', requireRole([...kvkRoles, 'super_admin']), meetingsController.other.create);
router.get('/other', requireRole(allRoles), meetingsController.other.findAll);
router.get('/other/:id', requireRole(allRoles), meetingsController.other.findById);
router.put('/other/:id', requireRole([...kvkRoles, 'super_admin']), meetingsController.other.update);
router.patch('/other/:id', requireRole([...kvkRoles, 'super_admin']), meetingsController.other.update);
router.delete('/other/:id', requireRole([...kvkRoles, 'super_admin']), meetingsController.other.delete);

module.exports = router;
