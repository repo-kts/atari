const express = require('express');
const router = express.Router();
const productionSupplyController = require('../../controllers/forms/productionSupplyController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/production-supply
 * @desc    Create a new Production Supply record
 * @access  KVK Role
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), productionSupplyController.create);

/**
 * @route   GET /api/forms/achievements/production-supply
 * @desc    Get all Production Supply records
 * @access  Authenticated
 */
router.get('/', requireRole(allRoles), productionSupplyController.getAll);

/**
 * @route   GET /api/forms/achievements/production-supply/:id
 * @desc    Get Production Supply record by ID
 * @access  Authenticated
 */
router.get('/:id', requireRole(allRoles), productionSupplyController.getById);

/**
 * @route   PATCH /api/forms/achievements/production-supply/:id
 * @desc    Update Production Supply record
 * @access  Owner (KVK) or Admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), productionSupplyController.update);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), productionSupplyController.update);

/**
 * @route   DELETE /api/forms/achievements/production-supply/:id
 * @desc    Delete Production Supply record
 * @access  Owner (KVK) or Admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), productionSupplyController.delete);

module.exports = router;
