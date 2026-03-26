const express = require('express');
const router = express.Router();
const fldController = require('../../controllers/forms/fldController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const { ensureBody } = require('../../middleware/validateInput.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/fld
 * @desc    Create a new FLD record
 * @access  KVK roles and super_admin
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldController.create);

/**
 * @route   GET /api/forms/achievements/fld
 * @desc    Get all FLD records
 * @access  All authenticated roles
 */
router.get('/', requireRole(allRoles), fldController.getAll);

/**
 * @route   GET /api/forms/achievements/fld/:id
 * @desc    Get a single FLD record by ID
 * @access  All authenticated roles
 */
router.get('/:id', requireRole(allRoles), fldController.getById);

/**
 * @route   PATCH /api/forms/achievements/fld/:id
 * @route   PUT /api/forms/achievements/fld/:id
 * @desc    Update an existing FLD record
 * @access  KVK roles and super_admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldController.update);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldController.update);
router.post('/:id/transfer-next-year', requireRole([...kvkRoles, 'super_admin']), fldController.transferToNextYear);
router.post('/:id/result', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldController.addResult);
router.put('/:id/result', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldController.editResult);
router.get('/:id/result', requireRole(allRoles), fldController.getResult);

/**
 * @route   DELETE /api/forms/achievements/fld/:id
 * @desc    Delete an FLD record
 * @access  KVK roles and super_admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), fldController.delete);

module.exports = router;
