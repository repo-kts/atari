const express = require('express');
const router = express.Router();
const farmerAwardController = require('../../controllers/forms/farmerAwardController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/forms/achievements/farmer-awards
 * @desc    Create a new Farmer Award
 * @access  KVK Role
 */
router.post('/', requireRole(['kvk', 'super_admin']), farmerAwardController.createFarmerAward);

/**
 * @route   GET /api/forms/achievements/farmer-awards
 * @desc    Get all Farmer Awards
 * @access  Authenticated (KVK gets their own, Admin gets all)
 */
router.get('/', farmerAwardController.getAllFarmerAwards);

/**
 * @route   GET /api/forms/achievements/farmer-awards/:id
 * @desc    Get Farmer Award by ID
 * @access  Authenticated (Ownership check in service)
 */
router.get('/:id', farmerAwardController.getFarmerAwardById);

/**
 * @route   PATCH /api/forms/achievements/farmer-awards/:id
 * @desc    Update Farmer Award
 * @access  Owner (KVK) or Admin
 */
router.patch('/:id', requireRole(['kvk', 'super_admin']), farmerAwardController.updateFarmerAward);

/**
 * @route   DELETE /api/forms/achievements/farmer-awards/:id
 * @desc    Delete Farmer Award
 * @access  Owner (KVK) or Admin
 */
router.delete('/:id', requireRole(['kvk', 'super_admin']), farmerAwardController.deleteFarmerAward);

module.exports = router;
