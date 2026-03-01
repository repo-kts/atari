const express = require('express');
const router = express.Router();
const agriDroneController = require('../../controllers/forms/agriDroneController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.post('/', requireRole([...kvkRoles, 'super_admin']), agriDroneController.create);
router.get('/', requireRole(allRoles), agriDroneController.getAll);
router.get('/:id', requireRole(allRoles), agriDroneController.getById);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), agriDroneController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), agriDroneController.delete);

module.exports = router;
