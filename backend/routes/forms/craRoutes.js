const express = require('express');
const router = express.Router();
const craController = require('../../controllers/forms/craExtensionActivityController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// CRA Details Routes
router.post('/details', requireRole([...kvkRoles, 'super_admin']), craController.createDetails);
router.get('/details', requireRole(allRoles), craController.getAllDetails);
router.get('/details/:id', requireRole(allRoles), craController.getDetailsById);
router.put('/details/:id', requireRole([...kvkRoles, 'super_admin']), craController.updateDetails);
router.patch('/details/:id', requireRole([...kvkRoles, 'super_admin']), craController.updateDetails);
router.delete('/details/:id', requireRole([...kvkRoles, 'super_admin']), craController.deleteDetails);

// Extension Activity Routes
router.post('/extension', requireRole([...kvkRoles, 'super_admin']), craController.create);
router.get('/extension', requireRole(allRoles), craController.getAll);
router.get('/extension/:id', requireRole(allRoles), craController.getById);
router.put('/extension/:id', requireRole([...kvkRoles, 'super_admin']), craController.update);
router.patch('/extension/:id', requireRole([...kvkRoles, 'super_admin']), craController.update);
router.delete('/extension/:id', requireRole([...kvkRoles, 'super_admin']), craController.delete);

module.exports = router;
