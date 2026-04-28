const express = require('express');
const router = express.Router();
const aryaPrevYearController = require('../../controllers/forms/aryaPrevYearController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/', requireRole(allRoles), aryaPrevYearController.getAll);
router.get('/:id', requireRole(allRoles), aryaPrevYearController.getById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), aryaPrevYearController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), aryaPrevYearController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), aryaPrevYearController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), aryaPrevYearController.delete);

module.exports = router;
