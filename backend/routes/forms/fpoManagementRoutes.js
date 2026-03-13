const express = require('express');
const router = express.Router();
const fpoManagementController = require('../../controllers/forms/fpoManagementController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/', requireRole(allRoles), fpoManagementController.findAll);
router.get('/:id', requireRole(allRoles), fpoManagementController.findById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), fpoManagementController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), fpoManagementController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), fpoManagementController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), fpoManagementController.delete);

module.exports = router;
