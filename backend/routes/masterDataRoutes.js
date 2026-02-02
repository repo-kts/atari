const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const masterDataController = require('../controllers/masterDataController');

/**
 * Master Data Routes
 * All routes require super_admin role
 */

// Apply authentication and role check to all routes
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// ============ ZONES ============
router.get('/zones', masterDataController.getAllZones);
router.get('/zones/:id', masterDataController.getZoneById);
router.post('/zones', masterDataController.createZone);
router.put('/zones/:id', masterDataController.updateZone);
router.delete('/zones/:id', masterDataController.deleteZone);

// ============ STATES ============
router.get('/states', masterDataController.getAllStates);
router.get('/states/:id', masterDataController.getStateById);
router.get('/states/zone/:zoneId', masterDataController.getStatesByZone);
router.post('/states', masterDataController.createState);
router.put('/states/:id', masterDataController.updateState);
router.delete('/states/:id', masterDataController.deleteState);

// ============ DISTRICTS ============
router.get('/districts', masterDataController.getAllDistricts);
router.get('/districts/:id', masterDataController.getDistrictById);
router.get('/districts/state/:stateId', masterDataController.getDistrictsByState);
router.post('/districts', masterDataController.createDistrict);
router.put('/districts/:id', masterDataController.updateDistrict);
router.delete('/districts/:id', masterDataController.deleteDistrict);

// ============ ORGANIZATIONS ============
router.get('/organizations', masterDataController.getAllOrganizations);
router.get('/organizations/:id', masterDataController.getOrganizationById);
router.get('/organizations/state/:stateId', masterDataController.getOrganizationsByState);
router.post('/organizations', masterDataController.createOrganization);
router.put('/organizations/:id', masterDataController.updateOrganization);
router.delete('/organizations/:id', masterDataController.deleteOrganization);

// ============ UTILITY ============
router.get('/master-data/stats', masterDataController.getStats);
router.get('/master-data/hierarchy', masterDataController.getHierarchy);

module.exports = router;
