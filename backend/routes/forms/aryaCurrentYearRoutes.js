const express = require('express');
const router = express.Router();
const aryaCurrentYearController = require('../../controllers/forms/aryaCurrentYearController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/', requireRole(allRoles), aryaCurrentYearController.getAll);
router.get('/:id', requireRole(allRoles), aryaCurrentYearController.getById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), aryaCurrentYearController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), aryaCurrentYearController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), aryaCurrentYearController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), aryaCurrentYearController.delete);

module.exports = router;
