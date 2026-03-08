const express = require('express');
const router = express.Router();
const fldTechnicalFeedbackController = require('../../controllers/forms/fldTechnicalFeedbackController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const { ensureBody } = require('../../middleware/validateInput.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/fld/technical-feedback
 * @desc    Create a new FLD Technical Feedback record
 * @access  KVK roles and super_admin
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldTechnicalFeedbackController.create);

/**
 * @route   GET /api/forms/achievements/fld/technical-feedback
 * @desc    Get all FLD Technical Feedback records
 * @access  All authenticated roles
 */
router.get('/', requireRole(allRoles), fldTechnicalFeedbackController.getAll);

/**
 * @route   GET /api/forms/achievements/fld/technical-feedback/:id
 * @desc    Get a single FLD Technical Feedback record by ID
 * @access  All authenticated roles
 */
router.get('/:id', requireRole(allRoles), fldTechnicalFeedbackController.getById);

/**
 * @route   PATCH /api/forms/achievements/fld/technical-feedback/:id
 * @route   PUT /api/forms/achievements/fld/technical-feedback/:id
 * @desc    Update an existing FLD Technical Feedback record
 * @access  KVK roles and super_admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldTechnicalFeedbackController.update);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), ensureBody(), fldTechnicalFeedbackController.update);

/**
 * @route   DELETE /api/forms/achievements/fld/technical-feedback/:id
 * @desc    Delete an FLD Technical Feedback record
 * @access  KVK roles and super_admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), fldTechnicalFeedbackController.delete);

module.exports = router;
