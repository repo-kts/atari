const express = require('express');
const router = express.Router();
const prevalentDiseaseController = require('../../controllers/forms/prevalentDiseaseController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// Crop Routes
router.get('/crops', requireRole(allRoles), prevalentDiseaseController.cropFindAll);
router.get('/crops/:id', requireRole(allRoles), prevalentDiseaseController.cropFindById);
router.post('/crops', requireRole([...kvkRoles, 'super_admin']), prevalentDiseaseController.cropCreate);
router.put('/crops/:id', requireRole([...kvkRoles, 'super_admin']), prevalentDiseaseController.cropUpdate);
router.patch('/crops/:id', requireRole([...kvkRoles, 'super_admin']), prevalentDiseaseController.cropUpdate);
router.delete('/crops/:id', requireRole([...kvkRoles, 'super_admin']), prevalentDiseaseController.cropDelete);

// Livestock Routes
router.get('/livestock', requireRole(allRoles), prevalentDiseaseController.livestockFindAll);
router.get('/livestock/:id', requireRole(allRoles), prevalentDiseaseController.livestockFindById);
router.post('/livestock', requireRole([...kvkRoles, 'super_admin']), prevalentDiseaseController.livestockCreate);
router.put('/livestock/:id', requireRole([...kvkRoles, 'super_admin']), prevalentDiseaseController.livestockUpdate);
router.patch('/livestock/:id', requireRole([...kvkRoles, 'super_admin']), prevalentDiseaseController.livestockUpdate);
router.delete('/livestock/:id', requireRole([...kvkRoles, 'super_admin']), prevalentDiseaseController.livestockDelete);

module.exports = router;
