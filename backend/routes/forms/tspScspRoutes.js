const express = require('express');
const router = express.Router();
const tspScspController = require('../../controllers/forms/tspScspController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);

const readRoles = ['kvk_admin', 'kvk_user', 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'icar_admin', 'atari_admin'];
const writeRoles = ['kvk_admin', 'kvk_user', 'super_admin', 'icar_admin', 'atari_admin'];

router.post('/', requireRole(writeRoles), tspScspController.create);
router.get('/', requireRole(readRoles), tspScspController.getAll);
router.get('/:id', requireRole(readRoles), tspScspController.getById);
router.put('/:id', requireRole(writeRoles), tspScspController.update);
router.patch('/:id', requireRole(writeRoles), tspScspController.update);
router.delete('/:id', requireRole(writeRoles), tspScspController.delete);

module.exports = router;

