const express = require('express');
const router = express.Router();
const scientistAwardController = require('../../controllers/forms/scientistAwardController.js');
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);


/**
 * @route   POST /api/forms/achievements/scientist-awards
 * @desc    Create a new Scientist Award
 * @access  KVK Role
 */
router.post('/', requirePermission('achievements_award_scientist', 'ADD'), scientistAwardController.createScientistAward);

/**
 * @route   GET /api/forms/achievements/scientist-awards
 * @desc    Get all Scientist Awards
 * @access  Authenticated (KVK gets their own, Admin gets all)
 */
router.get('/', requirePermission('achievements_award_scientist', 'VIEW'), scientistAwardController.getAllScientistAwards);

/**
 * @route   GET /api/forms/achievements/scientist-awards/:id
 * @desc    Get Scientist Award by ID
 * @access  Authenticated (Ownership check in service)
 */
router.get('/:id', requirePermission('achievements_award_scientist', 'VIEW'), scientistAwardController.getScientistAwardById);

/**
 * @route   PUT /api/forms/achievements/scientist-awards/:id
 * @desc    Update Scientist Award
 * @access  Owner (KVK) or Admin
 */
router.put('/:id', requirePermission('achievements_award_scientist', 'EDIT'), scientistAwardController.updateScientistAward);

/**
 * @route   PATCH /api/forms/achievements/scientist-awards/:id
 * @desc    Update Scientist Award
 * @access  Owner (KVK) or Admin
 */
router.patch('/:id', requirePermission('achievements_award_scientist', 'EDIT'), scientistAwardController.updateScientistAward);

/**
 * @route   DELETE /api/forms/achievements/scientist-awards/:id
 * @desc    Delete Scientist Award
 * @access  Owner (KVK) or Admin
 */
router.delete('/:id', requirePermission('achievements_award_scientist', 'DELETE'), scientistAwardController.deleteScientistAward);

module.exports = router;
