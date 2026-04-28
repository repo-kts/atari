const express = require('express');
const router = express.Router();
const drmrDetailsController = require('../../controllers/forms/drmrDetailsController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const adminRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const allRoles = [...kvkRoles, ...adminRoles];

router.post('/', requireRole([...kvkRoles, 'super_admin']), drmrDetailsController.create);
router.get('/', requireRole(allRoles), drmrDetailsController.findAll);
router.get('/:id', requireRole(allRoles), drmrDetailsController.findById);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), drmrDetailsController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), drmrDetailsController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), drmrDetailsController.delete);

module.exports = router;
