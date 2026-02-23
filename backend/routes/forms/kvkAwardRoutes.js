const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const kvkAwardController = require('../../controllers/forms/kvkAwardController.js');

// Apply authentication middleware
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const adminRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const allRoles = [...kvkRoles, ...adminRoles];

// Routes
router.get('/', requireRole(allRoles), kvkAwardController.getAllKvkAwards);
router.get('/:id', requireRole(allRoles), kvkAwardController.getKvkAwardById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), kvkAwardController.createKvkAward);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), kvkAwardController.updateKvkAward);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), kvkAwardController.deleteKvkAward);

module.exports = router;
