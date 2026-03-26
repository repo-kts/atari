const express = require('express');
const router = express.Router();
const controller = require('../../controllers/forms/agriDroneDemonstrationController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.post('/', requireRole([...kvkRoles, 'super_admin']), controller.create);
router.get('/', requireRole(allRoles), controller.getAll);
router.get('/:id', requireRole(allRoles), controller.getById);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), controller.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), controller.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), controller.delete);

module.exports = router;

