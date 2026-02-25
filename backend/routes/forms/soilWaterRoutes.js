const express = require('express');
const router = express.Router();
const soilWaterController = require('../../controllers/forms/soilWaterController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// Apply authentication middleware
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const adminRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const allRoles = [...kvkRoles, ...adminRoles];

// Equipment routes
router.get('/equipments', requireRole(allRoles), soilWaterController.getAllEquipment);
router.post('/equipments', requireRole([...kvkRoles, 'super_admin']), soilWaterController.createEquipment);
router.patch('/equipments/:id', requireRole([...kvkRoles, 'super_admin']), soilWaterController.updateEquipment);
router.delete('/equipments/:id', requireRole([...kvkRoles, 'super_admin']), soilWaterController.deleteEquipment);

// Analysis routes
router.get('/analysis', requireRole(allRoles), soilWaterController.getAllAnalysis);
router.post('/analysis', requireRole([...kvkRoles, 'super_admin']), soilWaterController.createAnalysis);
router.patch('/analysis/:id', requireRole([...kvkRoles, 'super_admin']), soilWaterController.updateAnalysis);
router.delete('/analysis/:id', requireRole([...kvkRoles, 'super_admin']), soilWaterController.deleteAnalysis);

// World Soil Day routes
router.get('/world-soil-day', requireRole(allRoles), soilWaterController.getAllWorldSoilDay);
router.post('/world-soil-day', requireRole([...kvkRoles, 'super_admin']), soilWaterController.createWorldSoilDay);
router.patch('/world-soil-day/:id', requireRole([...kvkRoles, 'super_admin']), soilWaterController.updateWorldSoilDay);
router.delete('/world-soil-day/:id', requireRole([...kvkRoles, 'super_admin']), soilWaterController.deleteWorldSoilDay);

// Master route
router.get('/analysis-masters', soilWaterController.getAllAnalysisMasters);

module.exports = router;
