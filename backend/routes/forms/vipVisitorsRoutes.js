const express = require('express');
const router = express.Router();
const vipVisitorsController = require('../../controllers/forms/vipVisitorsController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/dignitary-types', requireRole(allRoles), vipVisitorsController.findAllDignitaryTypes);
router.get('/', requireRole(allRoles), vipVisitorsController.findAll);
router.get('/:id', requireRole(allRoles), vipVisitorsController.findById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), vipVisitorsController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), vipVisitorsController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), vipVisitorsController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), vipVisitorsController.delete);

module.exports = router;
