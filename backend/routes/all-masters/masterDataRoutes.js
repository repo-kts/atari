const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const masterDataController = require('../../controllers/all-masters/masterDataController.js');

/**
 * Master Data Routes
 * Access is controlled by the Role Permission Editor (granular per module).
 * GET  → VIEW,  POST → ADD,  PUT → EDIT,  DELETE → DELETE
 */

// Apply authentication to all routes
router.use(authenticateToken);

// ============ ZONES ============
router.get('/zones',     requirePermission('all_masters_zone_master', 'VIEW'), masterDataController.getAllZones);
router.get('/zones/:id', requirePermission('all_masters_zone_master', 'VIEW'), masterDataController.getZoneById);
router.post('/zones',    requirePermission('all_masters_zone_master', 'ADD'),  masterDataController.createZone);
router.put('/zones/:id', requirePermission('all_masters_zone_master', 'EDIT'), masterDataController.updateZone);
router.delete('/zones/:id', requirePermission('all_masters_zone_master', 'DELETE'), masterDataController.deleteZone);

// ============ STATES ============
router.get('/states',                    requirePermission('all_masters_states_master', 'VIEW'), masterDataController.getAllStates);
router.get('/states/:id',                requirePermission('all_masters_states_master', 'VIEW'), masterDataController.getStateById);
router.get('/states/zone/:zoneId',       requirePermission('all_masters_states_master', 'VIEW'), masterDataController.getStatesByZone);
router.post('/states',                   requirePermission('all_masters_states_master', 'ADD'),  masterDataController.createState);
router.put('/states/:id',                requirePermission('all_masters_states_master', 'EDIT'), masterDataController.updateState);
router.delete('/states/:id',             requirePermission('all_masters_states_master', 'DELETE'), masterDataController.deleteState);

// ============ DISTRICTS ============
router.get('/districts',                    requirePermission('all_masters_districts_master', 'VIEW'), masterDataController.getAllDistricts);
router.get('/districts/:id',                requirePermission('all_masters_districts_master', 'VIEW'), masterDataController.getDistrictById);
router.get('/districts/state/:stateId',     requirePermission('all_masters_districts_master', 'VIEW'), masterDataController.getDistrictsByState);
router.post('/districts',                   requirePermission('all_masters_districts_master', 'ADD'),  masterDataController.createDistrict);
router.put('/districts/:id',                requirePermission('all_masters_districts_master', 'EDIT'), masterDataController.updateDistrict);
router.delete('/districts/:id',             requirePermission('all_masters_districts_master', 'DELETE'), masterDataController.deleteDistrict);

// ============ ORGANIZATIONS ============
router.get('/organizations',                        requirePermission('all_masters_organization_master', 'VIEW'), masterDataController.getAllOrganizations);
router.get('/organizations/:id',                    requirePermission('all_masters_organization_master', 'VIEW'), masterDataController.getOrganizationById);
router.get('/organizations/district/:districtId',   requirePermission('all_masters_organization_master', 'VIEW'), masterDataController.getOrganizationsByDistrict);
router.post('/organizations',                       requirePermission('all_masters_organization_master', 'ADD'),  masterDataController.createOrganization);
router.put('/organizations/:id',                    requirePermission('all_masters_organization_master', 'EDIT'), masterDataController.updateOrganization);
router.delete('/organizations/:id',                 requirePermission('all_masters_organization_master', 'DELETE'), masterDataController.deleteOrganization);

// ============ UNIVERSITIES ============
router.get('/universities',                         requirePermission('all_masters_university_master', 'VIEW'), masterDataController.getAllUniversities);
router.get('/universities/:id',                     requirePermission('all_masters_university_master', 'VIEW'), masterDataController.getUniversityById);
router.get('/universities/organization/:orgId',     requirePermission('all_masters_university_master', 'VIEW'), masterDataController.getUniversitiesByOrganization);
router.post('/universities',                        requirePermission('all_masters_university_master', 'ADD'),  masterDataController.createUniversity);
router.put('/universities/:id',                     requirePermission('all_masters_university_master', 'EDIT'), masterDataController.updateUniversity);
router.delete('/universities/:id',                  requirePermission('all_masters_university_master', 'DELETE'), masterDataController.deleteUniversity);

// ============ UTILITY ============
// These are read-only helper endpoints used across admin features (hierarchy/stats).
// Guarded by zone_master VIEW as the lowest-common master permission.
router.get('/master-data/stats',      requirePermission('all_masters_zone_master', 'VIEW'), masterDataController.getStats);
router.get('/master-data/hierarchy',  requirePermission('all_masters_zone_master', 'VIEW'), masterDataController.getHierarchy);

module.exports = router;
