const express = require('express');
const router = express.Router();
const fldExtensionController = require('../../controllers/forms/fldExtensionController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const { ensureBody } = require('../../middleware/validateInput.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/fld/extension-training
 * @desc    Create a new FLD Extension record
 * @access  KVK roles and super_admin
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldExtensionController.create);

/**
 * @route   GET /api/forms/achievements/fld/extension-training
 * @desc    Get all FLD Extension records
 * @access  All authenticated roles
 */
router.get('/', requireRole(allRoles), fldExtensionController.getAll);

/**
 * @route   GET /api/forms/achievements/fld/extension-training/:id
 * @desc    Get a single FLD Extension record by ID
 * @access  All authenticated roles
 */
router.get('/:id', requireRole(allRoles), fldExtensionController.getById);

/**
 * @route   PATCH /api/forms/achievements/fld/extension-training/:id
 * @route   PUT /api/forms/achievements/fld/extension-training/:id
 * @desc    Update an existing FLD Extension record
 * @access  KVK roles and super_admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldExtensionController.update);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldExtensionController.update);

/**
 * @route   DELETE /api/forms/achievements/fld/extension-training/:id
 * @desc    Delete an FLD Extension record
 * @access  KVK roles and super_admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), fldExtensionController.delete);

module.exports = router;
