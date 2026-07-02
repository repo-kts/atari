const express = require('express');
const router = express.Router();
const poshanMaahController = require('../../controllers/forms/poshanMaahController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/', requireRole(allRoles), poshanMaahController.findAll);
router.get('/:id', requireRole(allRoles), poshanMaahController.findById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), poshanMaahController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), poshanMaahController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), poshanMaahController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), poshanMaahController.delete);

module.exports = router;
