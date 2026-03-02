const express = require('express');
const router = express.Router();
const csisaController = require('../../controllers/forms/csisaController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const adminRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const allRoles = [...kvkRoles, ...adminRoles];

/**
 * @route   POST /api/forms/achievements/projects/csisa
 */
router.post('/', requireRole([...kvkRoles, 'super_admin']), csisaController.create);

/**
 * @route   GET /api/forms/achievements/projects/csisa
 */
router.get('/', requireRole(allRoles), csisaController.getAll);

/**
 * @route   GET /api/forms/achievements/projects/csisa/:id
 */
router.get('/:id', requireRole(allRoles), csisaController.getById);

/**
 * @route   PATCH /api/forms/achievements/projects/csisa/:id
 */
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), csisaController.update);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), csisaController.update);

/**
 * @route   DELETE /api/forms/achievements/projects/csisa/:id
 */
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), csisaController.delete);

module.exports = router;
