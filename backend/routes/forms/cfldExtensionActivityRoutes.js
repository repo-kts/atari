const express = require('express');
const router = express.Router();
const cfldExtensionActivityController = require('../../controllers/forms/cfldExtensionActivityController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// Master list of extension activity types (from extension_activity table)
router.get('/activity-types', requireRole(allRoles), cfldExtensionActivityController.getActivityTypes);

router.post('/', requireRole([...kvkRoles, 'super_admin']), cfldExtensionActivityController.create);
router.get('/', requireRole(allRoles), cfldExtensionActivityController.findAll);
router.get('/:id', requireRole(allRoles), cfldExtensionActivityController.findById);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), cfldExtensionActivityController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), cfldExtensionActivityController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), cfldExtensionActivityController.delete);

module.exports = router;

