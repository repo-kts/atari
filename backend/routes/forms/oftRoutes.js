const express = require('express');
const router = express.Router();
const oftController = require('../../controllers/forms/oftController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

/**
 * @route   POST /api/forms/achievements/oft
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), oftController.create);

/**
 * @route   GET /api/forms/achievements/oft
 */
router.get('/', requireRole(allRoles), oftController.getAll);

/**
 * @route   GET /api/forms/achievements/oft/:id
 */
router.get('/:id', requireRole(allRoles), oftController.getById);

/**
 * @route   PATCH /api/forms/achievements/oft/:id
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), oftController.update);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), oftController.update);

/**
 * @route   DELETE /api/forms/achievements/oft/:id
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), oftController.delete);

module.exports = router;
