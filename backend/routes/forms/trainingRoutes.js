const express = require('express');
const router = express.Router();
const trainingController = require('../../controllers/forms/trainingController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const { ensureBody } = require('../../middleware/validateInput.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/trainings
 * @desc    Create a new Training Achievement
 * @access  KVK Role
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), ensureBody(), trainingController.create);

/**
 * @route   GET /api/forms/achievements/trainings
 * @desc    Get all Training Achievements
 * @access  Authenticated
 */
router.get('/', requireRole(allRoles), trainingController.getAll);

/**
 * @route   GET /api/forms/achievements/trainings/:id
 * @desc    Get Training Achievement by ID
 * @access  Authenticated
 */
router.get('/:id', requireRole(allRoles), trainingController.getById);

/**
 * @route   PATCH /api/forms/achievements/trainings/:id
 * @route   PUT /api/forms/achievements/trainings/:id
 * @desc    Update Training Achievement
 * @access  Owner (KVK) or Admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), ensureBody(), trainingController.update);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), ensureBody(), trainingController.update);

/**
 * @route   DELETE /api/forms/achievements/trainings/:id
 * @desc    Delete Training Achievement
 * @access  Owner (KVK) or Admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), trainingController.delete);

module.exports = router;
