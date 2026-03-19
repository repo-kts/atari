const express = require('express');
const router = express.Router();
const cfldBudgetUtilizationController = require('../../controllers/forms/cfldBudgetUtilizationController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.post('/', requireRole([...kvkRoles, 'super_admin']), cfldBudgetUtilizationController.create);
router.get('/', requireRole(allRoles), cfldBudgetUtilizationController.findAll);
router.get('/:id', requireRole(allRoles), cfldBudgetUtilizationController.findById);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), cfldBudgetUtilizationController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), cfldBudgetUtilizationController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), cfldBudgetUtilizationController.delete);

module.exports = router;
