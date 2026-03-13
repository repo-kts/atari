const express = require('express');
const router = express.Router();
const swachhtaBharatController = require('../../controllers/forms/swachhtaBharatController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// Use auth middleware for all routes
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// Swachhta Hi Sewa
router.post('/sewa', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.hiSewa.create);
router.get('/sewa', requireRole(allRoles), swachhtaBharatController.hiSewa.findAll);
router.get('/sewa/:id', requireRole(allRoles), swachhtaBharatController.hiSewa.findById);
router.put('/sewa/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.hiSewa.update);
router.patch('/sewa/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.hiSewa.update);
router.delete('/sewa/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.hiSewa.delete);

// Swachhta Pakhwada
router.post('/pakhwada', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.pakhwada.create);
router.get('/pakhwada', requireRole(allRoles), swachhtaBharatController.pakhwada.findAll);
router.get('/pakhwada/:id', requireRole(allRoles), swachhtaBharatController.pakhwada.findById);
router.put('/pakhwada/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.pakhwada.update);
router.patch('/pakhwada/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.pakhwada.update);
router.delete('/pakhwada/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.pakhwada.delete);

// Swachh Quarterly Expenditure (Budget)
router.post('/budget', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.budget.create);
router.get('/budget', requireRole(allRoles), swachhtaBharatController.budget.findAll);
router.get('/budget/:id', requireRole(allRoles), swachhtaBharatController.budget.findById);
router.put('/budget/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.budget.update);
router.patch('/budget/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.budget.update);
router.delete('/budget/:id', requireRole([...kvkRoles, 'super_admin']), swachhtaBharatController.budget.delete);

module.exports = router;
