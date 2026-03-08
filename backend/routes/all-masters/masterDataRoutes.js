const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission, requireAnyPermission } = require('../../middleware/auth.js');
const masterDataController = require('../../controllers/all-masters/masterDataController.js');

/**
 * Master Data Routes
 *
 * GET (read) endpoints require only authentication — master data is
 * non-sensitive reference/lookup data (zones, states, districts, etc.) used
 * as dropdown sources across many forms (About KVK, Achievements, user
 * creation, etc.). Gating reads by master-specific permissions would block
 * form users who have form permissions but not master-management permissions.
 *
 * POST/PUT/DELETE (write) endpoints require granular master module permissions
 * controlled by the Role Permission Editor.
 *
 * Master management PAGES are still protected on the frontend by sidebar
 * filtering (hasPermission) and ProtectedRoute — users without the VIEW
 * permission on a master module won't see or navigate to those pages.
 */

// Apply authentication to all routes
router.use(authenticateToken);

// ============ ZONES ============
router.get('/zones',     masterDataController.getAllZones);
router.get('/zones/:id', masterDataController.getZoneById);
router.post('/zones',    requirePermission('all_masters_zone_master', 'ADD'),  masterDataController.createZone);
router.put('/zones/:id', requirePermission('all_masters_zone_master', 'EDIT'), masterDataController.updateZone);
router.delete('/zones/:id', requirePermission('all_masters_zone_master', 'DELETE'), masterDataController.deleteZone);

// ============ STATES ============
router.get('/states',                    masterDataController.getAllStates);
router.get('/states/:id',                masterDataController.getStateById);
router.get('/states/zone/:zoneId',       masterDataController.getStatesByZone);
router.post('/states',                   requirePermission('all_masters_states_master', 'ADD'),  masterDataController.createState);
router.put('/states/:id',                requirePermission('all_masters_states_master', 'EDIT'), masterDataController.updateState);
router.delete('/states/:id',             requirePermission('all_masters_states_master', 'DELETE'), masterDataController.deleteState);

// ============ DISTRICTS ============
router.get('/districts',                    masterDataController.getAllDistricts);
router.get('/districts/:id',                masterDataController.getDistrictById);
router.get('/districts/state/:stateId',     masterDataController.getDistrictsByState);
router.post('/districts',                   requirePermission('all_masters_districts_master', 'ADD'),  masterDataController.createDistrict);
router.put('/districts/:id',                requirePermission('all_masters_districts_master', 'EDIT'), masterDataController.updateDistrict);
router.delete('/districts/:id',             requirePermission('all_masters_districts_master', 'DELETE'), masterDataController.deleteDistrict);

// ============ ORGANIZATIONS ============
router.get('/organizations',                        masterDataController.getAllOrganizations);
router.get('/organizations/:id',                    masterDataController.getOrganizationById);
router.get('/organizations/district/:districtId',   masterDataController.getOrganizationsByDistrict);
router.post('/organizations',                       requirePermission('all_masters_organization_master', 'ADD'),  masterDataController.createOrganization);
router.put('/organizations/:id',                    requirePermission('all_masters_organization_master', 'EDIT'), masterDataController.updateOrganization);
router.delete('/organizations/:id',                 requirePermission('all_masters_organization_master', 'DELETE'), masterDataController.deleteOrganization);

// ============ UNIVERSITIES ============
router.get('/universities',                         masterDataController.getAllUniversities);
router.get('/universities/:id',                     masterDataController.getUniversityById);
router.get('/universities/organization/:orgId',     masterDataController.getUniversitiesByOrganization);
router.post('/universities',                        requirePermission('all_masters_university_master', 'ADD'),  masterDataController.createUniversity);
router.put('/universities/:id',                     requirePermission('all_masters_university_master', 'EDIT'), masterDataController.updateUniversity);
router.delete('/universities/:id',                  requirePermission('all_masters_university_master', 'DELETE'), masterDataController.deleteUniversity);

// ============ UTILITY ============
// These read-only helper endpoints span all basic master modules; any VIEW permission grants access.
const BASIC_MASTER_MODULES = [
    'all_masters_zone_master',
    'all_masters_states_master',
    'all_masters_districts_master',
    'all_masters_organization_master',
    'all_masters_university_master',
];
router.get('/master-data/stats',      requireAnyPermission(BASIC_MASTER_MODULES, 'VIEW'), masterDataController.getStats);
router.get('/master-data/hierarchy',  requireAnyPermission(BASIC_MASTER_MODULES, 'VIEW'), masterDataController.getHierarchy);

module.exports = router;
