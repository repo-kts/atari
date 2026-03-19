const express = require('express');
const router = express.Router();
const otherExtensionActivityController = require('../../controllers/forms/otherExtensionActivityController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'icar_admin', 'atari_admin'];

/**
 * @route   POST /api/forms/achievements/other-extension-activities
 * @desc    Create a new Other Extension Activity
 * @access  KVK Role, Super Admin, ICAR Admin, ATARI Admin
 */
router.post('/', requireRole([...kvkRoles, 'super_admin', 'icar_admin', 'atari_admin']), otherExtensionActivityController.create);

/**
 * @route   GET /api/forms/achievements/other-extension-activities
 * @desc    Get all Other Extension Activities
 * @access  All authenticated roles
 */
router.get('/', requireRole(allRoles), otherExtensionActivityController.getAll);

/**
 * @route   GET /api/forms/achievements/other-extension-activities/:id
 * @desc    Get Other Extension Activity by ID
 * @access  All authenticated roles
 */
router.get('/:id', requireRole(allRoles), otherExtensionActivityController.getById);

/**
 * @route   PUT /api/forms/achievements/other-extension-activities/:id
 * @desc    Update Other Extension Activity
 * @access  KVK Role or Super Admin
 */
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), otherExtensionActivityController.update);

/**
 * @route   PATCH /api/forms/achievements/other-extension-activities/:id
 * @desc    Update Other Extension Activity
 * @access  KVK Role or Super Admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), otherExtensionActivityController.update);

/**
 * @route   DELETE /api/forms/achievements/other-extension-activities/:id
 * @desc    Delete Other Extension Activity
 * @access  KVK Role or Super Admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), otherExtensionActivityController.delete);

module.exports = router;
