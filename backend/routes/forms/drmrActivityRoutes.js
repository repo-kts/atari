const express = require('express');
const router = express.Router();
const drmrActivityController = require('../../controllers/forms/drmrActivityController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);

const kvkRoles = ['kvk_admin', 'kvk_user'];
const adminRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const allRoles = [...kvkRoles, ...adminRoles];

router.post('/', requireRole([...kvkRoles, 'super_admin']), drmrActivityController.create);
router.get('/', requireRole(allRoles), drmrActivityController.findAll);
router.get('/:id', requireRole(allRoles), drmrActivityController.findById);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), drmrActivityController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), drmrActivityController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), drmrActivityController.delete);

module.exports = router;

