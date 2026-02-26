const express = require('express');
const router = express.Router();
const techWeekController = require('../../controllers/forms/techWeekController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.post('/', requireRole([...kvkRoles, 'super_admin']), techWeekController.create);
router.get('/', requireRole(allRoles), techWeekController.getAll);
router.get('/:id', requireRole(allRoles), techWeekController.getById);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), techWeekController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), techWeekController.delete);

module.exports = router;
