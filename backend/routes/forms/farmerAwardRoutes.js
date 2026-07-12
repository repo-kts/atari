const express = require('express');
const router = express.Router();
const farmerAwardController = require('../../controllers/forms/farmerAwardController.js');
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);


/**
 * @route   POST /api/forms/achievements/farmer-awards
 * @desc    Create a new Farmer Award
 * @access  KVK Role
 */
router.post('/', requirePermission('achievements_award_farmer', 'ADD'), farmerAwardController.createFarmerAward);

/**
 * @route   GET /api/forms/achievements/farmer-awards
 * @desc    Get all Farmer Awards
 * @access  Authenticated (KVK gets their own, Admin gets all)
 */
router.get('/', requirePermission('achievements_award_farmer', 'VIEW'), farmerAwardController.getAllFarmerAwards);

/**
 * @route   GET /api/forms/achievements/farmer-awards/:id
 * @desc    Get Farmer Award by ID
 * @access  Authenticated (Ownership check in service)
 */
router.get('/:id', requirePermission('achievements_award_farmer', 'VIEW'), farmerAwardController.getFarmerAwardById);

/**
 * @route   PUT /api/forms/achievements/farmer-awards/:id
 * @desc    Update Farmer Award
 * @access  Owner (KVK) or Admin
 */
router.put('/:id', requirePermission('achievements_award_farmer', 'EDIT'), farmerAwardController.updateFarmerAward);

/**
 * @route   PATCH /api/forms/achievements/farmer-awards/:id
 * @desc    Update Farmer Award
 * @access  Owner (KVK) or Admin
 */
router.patch('/:id', requirePermission('achievements_award_farmer', 'EDIT'), farmerAwardController.updateFarmerAward);

/**
 * @route   DELETE /api/forms/achievements/farmer-awards/:id
 * @desc    Delete Farmer Award
 * @access  Owner (KVK) or Admin
 */
router.delete('/:id', requirePermission('achievements_award_farmer', 'DELETE'), farmerAwardController.deleteFarmerAward);

module.exports = router;
