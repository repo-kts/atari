const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const kvkAwardController = require('../../controllers/forms/kvkAwardController.js');

// Apply authentication middleware
router.use(authenticateToken);

// Role groups
const kvkOnly = ['kvk'];
const adminsOnly = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const allRoles = [...kvkOnly, ...adminsOnly];

// Routes
router.get('/', requireRole(allRoles), kvkAwardController.getAllKvkAwards);
router.get('/:id', requireRole(allRoles), kvkAwardController.getKvkAwardById);
router.post('/', requireRole(kvkOnly), kvkAwardController.createKvkAward);
router.put('/:id', requireRole(kvkOnly), kvkAwardController.updateKvkAward);
router.delete('/:id', requireRole(kvkOnly), kvkAwardController.deleteKvkAward);

module.exports = router;
