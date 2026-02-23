const express = require('express');
const router = express.Router();
const extensionActivityController = require('../../controllers/forms/extensionActivityController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/extension-activities
 * @desc    Create a new Extension Activity
 * @access  KVK Role
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), extensionActivityController.create);

/**
 * @route   GET /api/forms/achievements/extension-activities
 * @desc    Get all Extension Activities
 * @access  Authenticated
 */
router.get('/', requireRole(allRoles), extensionActivityController.getAll);

/**
 * @route   GET /api/forms/achievements/extension-activities/:id
 * @desc    Get Extension Activity by ID
 * @access  Authenticated
 */
router.get('/:id', requireRole(allRoles), extensionActivityController.getById);

/**
 * @route   PATCH /api/forms/achievements/extension-activities/:id
 * @desc    Update Extension Activity
 * @access  Owner (KVK) or Admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), extensionActivityController.update);

/**
 * @route   DELETE /api/forms/achievements/extension-activities/:id
 * @desc    Delete Extension Activity
 * @access  Owner (KVK) or Admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), extensionActivityController.delete);

module.exports = router;
