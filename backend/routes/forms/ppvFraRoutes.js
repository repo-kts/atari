const express = require('express');
const router = express.Router();
const ppvFraController = require('../../controllers/forms/ppvFraController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// Training & Awareness routes
router.get('/training', requireRole(allRoles), ppvFraController.findAllTrainings);
router.get('/training/:id', requireRole(allRoles), ppvFraController.findTrainingById);
router.post('/training', requireRole([...kvkRoles, 'super_admin']), ppvFraController.createTraining);
router.put('/training/:id', requireRole([...kvkRoles, 'super_admin']), ppvFraController.updateTraining);
router.patch('/training/:id', requireRole([...kvkRoles, 'super_admin']), ppvFraController.updateTraining);
router.delete('/training/:id', requireRole([...kvkRoles, 'super_admin']), ppvFraController.deleteTraining);

// Plant Varieties routes
router.get('/plant-varieties', requireRole(allRoles), ppvFraController.findAllPlantVarieties);
router.get('/plant-varieties/:id', requireRole(allRoles), ppvFraController.findPlantVarietyById);
router.post('/plant-varieties', requireRole([...kvkRoles, 'super_admin']), ppvFraController.createPlantVariety);
router.put('/plant-varieties/:id', requireRole([...kvkRoles, 'super_admin']), ppvFraController.updatePlantVariety);
router.patch('/plant-varieties/:id', requireRole([...kvkRoles, 'super_admin']), ppvFraController.updatePlantVariety);
router.delete('/plant-varieties/:id', requireRole([...kvkRoles, 'super_admin']), ppvFraController.deletePlantVariety);

module.exports = router;
