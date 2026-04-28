const express = require('express');
const router = express.Router();
const raweFetController = require('../../controllers/forms/raweFetController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// Apply authentication to all routes
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/attachment-types', requireRole(allRoles), raweFetController.findAllAttachmentTypes);
router.get('/', requireRole(allRoles), raweFetController.findAll);
router.get('/:id', requireRole(allRoles), raweFetController.findById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), raweFetController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), raweFetController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), raweFetController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), raweFetController.delete);

module.exports = router;
