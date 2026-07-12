const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const kvkAwardController = require('../../controllers/forms/kvkAwardController.js');

// Apply authentication middleware
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const adminRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const allRoles = [...kvkRoles, ...adminRoles];

// Routes
router.get('/', requirePermission('achievements_award_recognition', 'VIEW'), kvkAwardController.getAllKvkAwards);
router.get('/:id', requirePermission('achievements_award_recognition', 'VIEW'), kvkAwardController.getKvkAwardById);
router.post('/', requirePermission('achievements_award_recognition', 'ADD'), kvkAwardController.createKvkAward);
router.put('/:id', requirePermission('achievements_award_recognition', 'EDIT'), kvkAwardController.updateKvkAward);
router.patch('/:id', requirePermission('achievements_award_recognition', 'EDIT'), kvkAwardController.updateKvkAward);
router.delete('/:id', requirePermission('achievements_award_recognition', 'DELETE'), kvkAwardController.deleteKvkAward);

module.exports = router;
