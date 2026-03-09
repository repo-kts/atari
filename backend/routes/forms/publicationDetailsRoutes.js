const express = require('express');
const router = express.Router();
const publicationDetailsController = require('../../controllers/forms/publicationDetailsController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/publication-details
 * @desc    Create a new Publication Details record
 * @access  KVK Role
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), publicationDetailsController.create);

/**
 * @route   GET /api/forms/achievements/publication-details
 * @desc    Get all Publication Details records
 * @access  Authenticated
 */
router.get('/', requireRole(allRoles), publicationDetailsController.getAll);

/**
 * @route   GET /api/forms/achievements/publication-details/:id
 * @desc    Get Publication Details record by ID
 * @access  Authenticated
 */
router.get('/:id', requireRole(allRoles), publicationDetailsController.getById);

/**
 * @route   PATCH /api/forms/achievements/publication-details/:id
 * @desc    Update Publication Details record
 * @access  Owner (KVK) or Admin
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), publicationDetailsController.update);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), publicationDetailsController.update);

/**
 * @route   DELETE /api/forms/achievements/publication-details/:id
 * @desc    Delete Publication Details record
 * @access  Owner (KVK) or Admin
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), publicationDetailsController.delete);

module.exports = router;
