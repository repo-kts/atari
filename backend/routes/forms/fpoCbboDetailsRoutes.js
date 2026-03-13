const express = require('express');
const router = express.Router();
const fpoCbboDetailsController = require('../../controllers/forms/fpoCbboDetailsController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/', requireRole(allRoles), fpoCbboDetailsController.findAll);
router.get('/:id', requireRole(allRoles), fpoCbboDetailsController.findById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), fpoCbboDetailsController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), fpoCbboDetailsController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), fpoCbboDetailsController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), fpoCbboDetailsController.delete);

module.exports = router;
