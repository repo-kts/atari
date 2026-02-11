const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const masterDataController = require('../../controllers/all-masters/masterDataController.js');

/**
 * Master Data Routes
 * GET routes: all admin roles (read access for hierarchy dropdowns etc.)
 * POST/PUT/DELETE routes: super_admin only (write access)
 */

// Apply authentication to all routes
router.use(authenticateToken);

const adminReadRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const adminWriteRoles = ['super_admin'];

// ============ ZONES ============
router.get('/zones', requireRole(adminReadRoles), masterDataController.getAllZones);
router.get('/zones/:id', requireRole(adminReadRoles), masterDataController.getZoneById);
router.post('/zones', requireRole(adminWriteRoles), masterDataController.createZone);
router.put('/zones/:id', requireRole(adminWriteRoles), masterDataController.updateZone);
router.delete('/zones/:id', requireRole(adminWriteRoles), masterDataController.deleteZone);

// ============ STATES ============
router.get('/states', requireRole(adminReadRoles), masterDataController.getAllStates);
router.get('/states/:id', requireRole(adminReadRoles), masterDataController.getStateById);
router.get('/states/zone/:zoneId', requireRole(adminReadRoles), masterDataController.getStatesByZone);
router.post('/states', requireRole(adminWriteRoles), masterDataController.createState);
router.put('/states/:id', requireRole(adminWriteRoles), masterDataController.updateState);
router.delete('/states/:id', requireRole(adminWriteRoles), masterDataController.deleteState);

// ============ DISTRICTS ============
router.get('/districts', requireRole(adminReadRoles), masterDataController.getAllDistricts);
router.get('/districts/:id', requireRole(adminReadRoles), masterDataController.getDistrictById);
router.get('/districts/state/:stateId', requireRole(adminReadRoles), masterDataController.getDistrictsByState);
router.post('/districts', requireRole(adminWriteRoles), masterDataController.createDistrict);
router.put('/districts/:id', requireRole(adminWriteRoles), masterDataController.updateDistrict);
router.delete('/districts/:id', requireRole(adminWriteRoles), masterDataController.deleteDistrict);

// ============ ORGANIZATIONS ============
router.get('/organizations', requireRole(adminReadRoles), masterDataController.getAllOrganizations);
router.get('/organizations/:id', requireRole(adminReadRoles), masterDataController.getOrganizationById);
router.get('/organizations/state/:stateId', requireRole(adminReadRoles), masterDataController.getOrganizationsByState);
router.post('/organizations', requireRole(adminWriteRoles), masterDataController.createOrganization);
router.put('/organizations/:id', requireRole(adminWriteRoles), masterDataController.updateOrganization);
router.delete('/organizations/:id', requireRole(adminWriteRoles), masterDataController.deleteOrganization);

// ============ UTILITY ============
router.get('/master-data/stats', requireRole(adminReadRoles), masterDataController.getStats);
router.get('/master-data/hierarchy', requireRole(adminReadRoles), masterDataController.getHierarchy);

module.exports = router;
