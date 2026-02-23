const express = require('express');
const router = express.Router();
const scientistAwardController = require('../../controllers/forms/scientistAwardController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/scientist-awards
 * @desc    Create a new Scientist Award
 * @access  KVK Role
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), scientistAwardController.createScientistAward);

/**
 * @route   GET /api/forms/achievements/scientist-awards
 * @desc    Get all Scientist Awards
 * @access  Authenticated (KVK gets their own, Admin gets all)
 */
router.get('/', requireRole(allRoles), scientistAwardController.getAllScientistAwards);

/**
 * @route   GET /api/forms/achievements/scientist-awards/:id
 * @desc    Get Scientist Award by ID
 * @access  Authenticated (Ownership check in service)
 */
router.get('/:id', requireRole(allRoles), scientistAwardController.getScientistAwardById);

/**
 * @route   PATCH /api/forms/achievements/scientist-awards/:id
 * @desc    Update Scientist Award
 * @access  Owner (KVK) or Admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), scientistAwardController.updateScientistAward);

/**
 * @route   DELETE /api/forms/achievements/scientist-awards/:id
 * @desc    Delete Scientist Award
 * @access  Owner (KVK) or Admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), scientistAwardController.deleteScientistAward);

module.exports = router;
