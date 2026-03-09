const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const otherMastersController = require('../../controllers/all-masters/otherMastersController.js');

/**
 * Other Masters Routes
 *
 * GET (read) endpoints require only authentication — master data is
 * non-sensitive reference/lookup data used as dropdown sources across many
 * forms. Gating reads by master-specific permissions would block form users
 * who have form permissions but not master-management permissions.
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

// ============================================
// Season Routes
// ============================================

router.get('/seasons',     otherMastersController.getAllSeasons);
router.get('/seasons/:id', otherMastersController.getSeasonById);
router.post('/seasons',    requirePermission('all_masters_season_master', 'ADD'),  otherMastersController.createSeason);
router.put('/seasons/:id', requirePermission('all_masters_season_master', 'EDIT'), otherMastersController.updateSeason);
router.delete('/seasons/:id', requirePermission('all_masters_season_master', 'DELETE'), otherMastersController.deleteSeason);

// ============================================
// Sanctioned Post Routes
// ============================================

router.get('/sanctioned-posts',     otherMastersController.getAllSanctionedPosts);
router.get('/sanctioned-posts/:id', otherMastersController.getSanctionedPostById);
router.post('/sanctioned-posts',    requirePermission('all_masters_sanctioned_post_master', 'ADD'),  otherMastersController.createSanctionedPost);
router.put('/sanctioned-posts/:id', requirePermission('all_masters_sanctioned_post_master', 'EDIT'), otherMastersController.updateSanctionedPost);
router.delete('/sanctioned-posts/:id', requirePermission('all_masters_sanctioned_post_master', 'DELETE'), otherMastersController.deleteSanctionedPost);

// ============================================
// Year Routes
// ============================================

router.get('/years',     otherMastersController.getAllYears);
router.get('/years/:id', otherMastersController.getYearById);
router.post('/years',    requirePermission('all_masters_year_master', 'ADD'),  otherMastersController.createYear);
router.put('/years/:id', requirePermission('all_masters_year_master', 'EDIT'), otherMastersController.updateYear);
router.delete('/years/:id', requirePermission('all_masters_year_master', 'DELETE'), otherMastersController.deleteYear);

// ============================================
// Employee Masters Routes
// ============================================

router.get('/staff-category',     otherMastersController.getAllStaffCategories);
router.get('/staff-category/:id', otherMastersController.getStaffCategoryById);
router.post('/staff-category',    requirePermission('all_masters_staff_category_master', 'ADD'),    otherMastersController.createStaffCategory);
router.put('/staff-category/:id', requirePermission('all_masters_staff_category_master', 'EDIT'),   otherMastersController.updateStaffCategory);
router.delete('/staff-category/:id', requirePermission('all_masters_staff_category_master', 'DELETE'), otherMastersController.deleteStaffCategory);

router.get('/pay-level',     otherMastersController.getAllPayLevels);
router.get('/pay-level/:id', otherMastersController.getPayLevelById);
router.post('/pay-level',    requirePermission('all_masters_pay_level_master', 'ADD'),    otherMastersController.createPayLevel);
router.put('/pay-level/:id', requirePermission('all_masters_pay_level_master', 'EDIT'),   otherMastersController.updatePayLevel);
router.delete('/pay-level/:id', requirePermission('all_masters_pay_level_master', 'DELETE'), otherMastersController.deletePayLevel);

router.get('/discipline',     otherMastersController.getAllDisciplines);
router.get('/discipline/:id', otherMastersController.getDisciplineById);
router.post('/discipline',    requirePermission('all_masters_discipline_master', 'ADD'),    otherMastersController.createDiscipline);
router.put('/discipline/:id', requirePermission('all_masters_discipline_master', 'EDIT'),   otherMastersController.updateDiscipline);
router.delete('/discipline/:id', requirePermission('all_masters_discipline_master', 'DELETE'), otherMastersController.deleteDiscipline);

// ============================================
// Extension Masters Routes
// ============================================

router.get('/extension-activity-type',     otherMastersController.getAllExtensionActivityTypes);
router.get('/extension-activity-type/:id', otherMastersController.getExtensionActivityTypeById);
router.post('/extension-activity-type',    requirePermission('all_masters_extension_activity_master', 'ADD'),    otherMastersController.createExtensionActivityType);
router.put('/extension-activity-type/:id', requirePermission('all_masters_extension_activity_master', 'EDIT'),   otherMastersController.updateExtensionActivityType);
router.delete('/extension-activity-type/:id', requirePermission('all_masters_extension_activity_master', 'DELETE'), otherMastersController.deleteExtensionActivityType);

router.get('/other-extension-activity-type',     otherMastersController.getAllOtherExtensionActivityTypes);
router.get('/other-extension-activity-type/:id', otherMastersController.getOtherExtensionActivityTypeById);
router.post('/other-extension-activity-type',    requirePermission('all_masters_other_extension_activity_master', 'ADD'),    otherMastersController.createOtherExtensionActivityType);
router.put('/other-extension-activity-type/:id', requirePermission('all_masters_other_extension_activity_master', 'EDIT'),   otherMastersController.updateOtherExtensionActivityType);
router.delete('/other-extension-activity-type/:id', requirePermission('all_masters_other_extension_activity_master', 'DELETE'), otherMastersController.deleteOtherExtensionActivityType);

// Important Day is grouped under the Events Master module (same as /events).
// This intentional grouping mirrors the frontend routeConfig where both routes
// share moduleCode 'all_masters_events_master', consistent with other grouped
// masters (e.g. OFT, FLD, Products each covering multiple sub-entities).
router.get('/important-day',     otherMastersController.getAllImportantDays);
router.get('/important-day/:id', otherMastersController.getImportantDayById);
router.post('/important-day',    requirePermission('all_masters_events_master', 'ADD'),    otherMastersController.createImportantDay);
router.put('/important-day/:id', requirePermission('all_masters_events_master', 'EDIT'),   otherMastersController.updateImportantDay);
router.delete('/important-day/:id', requirePermission('all_masters_events_master', 'DELETE'), otherMastersController.deleteImportantDay);

// ============================================
// Training Masters Routes
// ============================================

// Training Clientele and Funding Source are both grouped under the Training Master
// module. This intentional grouping mirrors the frontend routeConfig where
// TRAINING_TYPE, TRAINING_AREA, TRAINING_THEMATIC, TRAINING_CLIENTELE, and
// FUNDING_SOURCE all share moduleCode 'all_masters_training_master'.
router.get('/training-clientele',     otherMastersController.getAllTrainingClientele);
router.get('/training-clientele/:id', otherMastersController.getTrainingClienteleById);
router.post('/training-clientele',    requirePermission('all_masters_training_master', 'ADD'),    otherMastersController.createTrainingClientele);
router.put('/training-clientele/:id', requirePermission('all_masters_training_master', 'EDIT'),   otherMastersController.updateTrainingClientele);
router.delete('/training-clientele/:id', requirePermission('all_masters_training_master', 'DELETE'), otherMastersController.deleteTrainingClientele);

router.get('/funding-source',     otherMastersController.getAllFundingSources);
router.get('/funding-source/:id', otherMastersController.getFundingSourceById);
router.post('/funding-source',    requirePermission('all_masters_training_master', 'ADD'),    otherMastersController.createFundingSource);
router.put('/funding-source/:id', requirePermission('all_masters_training_master', 'EDIT'),   otherMastersController.updateFundingSource);
router.delete('/funding-source/:id', requirePermission('all_masters_training_master', 'DELETE'), otherMastersController.deleteFundingSource);

// ============================================
// Other Masters Routes (continued)
// ============================================

router.get('/crop-type',     otherMastersController.getAllCropTypes);
router.get('/crop-type/:id', otherMastersController.getCropTypeById);
router.post('/crop-type',    requirePermission('all_masters_crop_type_master', 'ADD'),    otherMastersController.createCropType);
router.put('/crop-type/:id', requirePermission('all_masters_crop_type_master', 'EDIT'),   otherMastersController.updateCropType);
router.delete('/crop-type/:id', requirePermission('all_masters_crop_type_master', 'DELETE'), otherMastersController.deleteCropType);

router.get('/infrastructure-master',     otherMastersController.getAllInfrastructureMasters);
router.get('/infrastructure-master/:id', otherMastersController.getInfrastructureMasterById);
router.post('/infrastructure-master',    requirePermission('all_masters_infrastructure_master', 'ADD'),    otherMastersController.createInfrastructureMaster);
router.put('/infrastructure-master/:id', requirePermission('all_masters_infrastructure_master', 'EDIT'),   otherMastersController.updateInfrastructureMaster);
router.delete('/infrastructure-master/:id', requirePermission('all_masters_infrastructure_master', 'DELETE'), otherMastersController.deleteInfrastructureMaster);

// ============================================
// Soil Water Testing Masters Routes
// ============================================

router.get('/soil-water-analysis',     otherMastersController.getAllSoilWaterAnalyses);
router.get('/soil-water-analysis/:id', otherMastersController.getSoilWaterAnalysisById);
router.post('/soil-water-analysis',    requirePermission('all_masters_soil_water_analysis_master', 'ADD'),    otherMastersController.createSoilWaterAnalysis);
router.put('/soil-water-analysis/:id', requirePermission('all_masters_soil_water_analysis_master', 'EDIT'), otherMastersController.updateSoilWaterAnalysis);
router.delete('/soil-water-analysis/:id', requirePermission('all_masters_soil_water_analysis_master', 'DELETE'), otherMastersController.deleteSoilWaterAnalysis);

module.exports = router;
