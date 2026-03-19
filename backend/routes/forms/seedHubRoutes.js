const express = require('express');
const router = express.Router();
const seedHubController = require('../../controllers/forms/seedHubController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/', requireRole(allRoles), seedHubController.getAll);
router.get('/:id', requireRole(allRoles), seedHubController.getById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), seedHubController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), seedHubController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), seedHubController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), seedHubController.delete);

module.exports = router;
