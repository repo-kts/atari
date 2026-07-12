const express = require('express');
const router = express.Router();
const soilWaterController = require('../../controllers/forms/soilWaterController.js');
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');

// Apply authentication middleware
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const adminRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const allRoles = [...kvkRoles, ...adminRoles];

// Equipment routes
router.get('/equipments', requirePermission('achievements_soil_water_testing', 'VIEW'), soilWaterController.getAllEquipment);
router.post('/equipments', requirePermission('achievements_soil_water_testing', 'ADD'), soilWaterController.createEquipment);
router.get('/equipments/:id', requirePermission('achievements_soil_water_testing', 'VIEW'), soilWaterController.getEquipmentById);
router.put('/equipments/:id', requirePermission('achievements_soil_water_testing', 'EDIT'), soilWaterController.updateEquipment);
router.patch('/equipments/:id', requirePermission('achievements_soil_water_testing', 'EDIT'), soilWaterController.updateEquipment);
router.delete('/equipments/:id', requirePermission('achievements_soil_water_testing', 'DELETE'), soilWaterController.deleteEquipment);

// Analysis routes
router.get('/analysis', requirePermission('achievements_soil_water_testing', 'VIEW'), soilWaterController.getAllAnalysis);
router.post('/analysis', requirePermission('achievements_soil_water_testing', 'ADD'), soilWaterController.createAnalysis);
router.get('/analysis/:id', requirePermission('achievements_soil_water_testing', 'VIEW'), soilWaterController.getAnalysisById);
router.put('/analysis/:id', requirePermission('achievements_soil_water_testing', 'EDIT'), soilWaterController.updateAnalysis);
router.patch('/analysis/:id', requirePermission('achievements_soil_water_testing', 'EDIT'), soilWaterController.updateAnalysis);
router.delete('/analysis/:id', requirePermission('achievements_soil_water_testing', 'DELETE'), soilWaterController.deleteAnalysis);

// World Soil Day routes
router.get('/world-soil-day', requirePermission('achievements_world_soil_day', 'VIEW'), soilWaterController.getAllWorldSoilDay);
router.post('/world-soil-day', requirePermission('achievements_world_soil_day', 'ADD'), soilWaterController.createWorldSoilDay);
router.get('/world-soil-day/:id', requirePermission('achievements_world_soil_day', 'VIEW'), soilWaterController.getWorldSoilDayById);
router.put('/world-soil-day/:id', requirePermission('achievements_world_soil_day', 'EDIT'), soilWaterController.updateWorldSoilDay);
router.patch('/world-soil-day/:id', requirePermission('achievements_world_soil_day', 'EDIT'), soilWaterController.updateWorldSoilDay);
router.delete('/world-soil-day/:id', requirePermission('achievements_world_soil_day', 'DELETE'), soilWaterController.deleteWorldSoilDay);

// Master route
router.get('/analysis-masters', soilWaterController.getAllAnalysisMasters);

module.exports = router;
