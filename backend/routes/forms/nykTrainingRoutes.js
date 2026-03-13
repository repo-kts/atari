const express = require('express');
const router = express.Router();
const nykTrainingController = require('../../controllers/forms/nykTrainingController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

router.get('/', requireRole(allRoles), nykTrainingController.findAll);
router.get('/:id', requireRole(allRoles), nykTrainingController.findById);
router.post('/', requireRole([...kvkRoles, 'super_admin']), nykTrainingController.create);
router.put('/:id', requireRole([...kvkRoles, 'super_admin']), nykTrainingController.update);
router.patch('/:id', requireRole([...kvkRoles, 'super_admin']), nykTrainingController.update);
router.delete('/:id', requireRole([...kvkRoles, 'super_admin']), nykTrainingController.delete);

module.exports = router;
