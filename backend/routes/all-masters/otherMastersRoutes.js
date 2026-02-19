const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const otherMastersController = require('../../controllers/all-masters/otherMastersController.js');

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// Season Routes
// ============================================

router.get('/seasons',     requirePermission('all_masters_season_master', 'VIEW'), otherMastersController.getAllSeasons);
router.get('/seasons/:id', requirePermission('all_masters_season_master', 'VIEW'), otherMastersController.getSeasonById);
router.post('/seasons',    requirePermission('all_masters_season_master', 'ADD'),  otherMastersController.createSeason);
router.put('/seasons/:id', requirePermission('all_masters_season_master', 'EDIT'), otherMastersController.updateSeason);
router.delete('/seasons/:id', requirePermission('all_masters_season_master', 'DELETE'), otherMastersController.deleteSeason);

// ============================================
// Sanctioned Post Routes
// ============================================

router.get('/sanctioned-posts',     requirePermission('all_masters_sanctioned_post_master', 'VIEW'), otherMastersController.getAllSanctionedPosts);
router.get('/sanctioned-posts/:id', requirePermission('all_masters_sanctioned_post_master', 'VIEW'), otherMastersController.getSanctionedPostById);
router.post('/sanctioned-posts',    requirePermission('all_masters_sanctioned_post_master', 'ADD'),  otherMastersController.createSanctionedPost);
router.put('/sanctioned-posts/:id', requirePermission('all_masters_sanctioned_post_master', 'EDIT'), otherMastersController.updateSanctionedPost);
router.delete('/sanctioned-posts/:id', requirePermission('all_masters_sanctioned_post_master', 'DELETE'), otherMastersController.deleteSanctionedPost);

// ============================================
// Year Routes
// ============================================

router.get('/years',     requirePermission('all_masters_year_master', 'VIEW'), otherMastersController.getAllYears);
router.get('/years/:id', requirePermission('all_masters_year_master', 'VIEW'), otherMastersController.getYearById);
router.post('/years',    requirePermission('all_masters_year_master', 'ADD'),  otherMastersController.createYear);
router.put('/years/:id', requirePermission('all_masters_year_master', 'EDIT'), otherMastersController.updateYear);
router.delete('/years/:id', requirePermission('all_masters_year_master', 'DELETE'), otherMastersController.deleteYear);

// ============================================
// Employee Masters Routes
// ============================================

router.get('/staff-category',     requirePermission('all_masters_staff_category_master', 'VIEW'),   otherMastersController.getAllStaffCategories);
router.get('/staff-category/:id', requirePermission('all_masters_staff_category_master', 'VIEW'),   otherMastersController.getStaffCategoryById);
router.post('/staff-category',    requirePermission('all_masters_staff_category_master', 'ADD'),    otherMastersController.createStaffCategory);
router.put('/staff-category/:id', requirePermission('all_masters_staff_category_master', 'EDIT'),   otherMastersController.updateStaffCategory);
router.delete('/staff-category/:id', requirePermission('all_masters_staff_category_master', 'DELETE'), otherMastersController.deleteStaffCategory);

router.get('/pay-level',     requirePermission('all_masters_pay_level_master', 'VIEW'),   otherMastersController.getAllPayLevels);
router.get('/pay-level/:id', requirePermission('all_masters_pay_level_master', 'VIEW'),   otherMastersController.getPayLevelById);
router.post('/pay-level',    requirePermission('all_masters_pay_level_master', 'ADD'),    otherMastersController.createPayLevel);
router.put('/pay-level/:id', requirePermission('all_masters_pay_level_master', 'EDIT'),   otherMastersController.updatePayLevel);
router.delete('/pay-level/:id', requirePermission('all_masters_pay_level_master', 'DELETE'), otherMastersController.deletePayLevel);

router.get('/discipline',     requirePermission('all_masters_discipline_master', 'VIEW'),   otherMastersController.getAllDisciplines);
router.get('/discipline/:id', requirePermission('all_masters_discipline_master', 'VIEW'),   otherMastersController.getDisciplineById);
router.post('/discipline',    requirePermission('all_masters_discipline_master', 'ADD'),    otherMastersController.createDiscipline);
router.put('/discipline/:id', requirePermission('all_masters_discipline_master', 'EDIT'),   otherMastersController.updateDiscipline);
router.delete('/discipline/:id', requirePermission('all_masters_discipline_master', 'DELETE'), otherMastersController.deleteDiscipline);

// ============================================
// Extension Masters Routes
// ============================================

router.get('/extension-activity-type',     requirePermission('all_masters_extension_activity_master', 'VIEW'),   otherMastersController.getAllExtensionActivityTypes);
router.get('/extension-activity-type/:id', requirePermission('all_masters_extension_activity_master', 'VIEW'),   otherMastersController.getExtensionActivityTypeById);
router.post('/extension-activity-type',    requirePermission('all_masters_extension_activity_master', 'ADD'),    otherMastersController.createExtensionActivityType);
router.put('/extension-activity-type/:id', requirePermission('all_masters_extension_activity_master', 'EDIT'),   otherMastersController.updateExtensionActivityType);
router.delete('/extension-activity-type/:id', requirePermission('all_masters_extension_activity_master', 'DELETE'), otherMastersController.deleteExtensionActivityType);

router.get('/other-extension-activity-type',     requirePermission('all_masters_other_extension_activity_master', 'VIEW'),   otherMastersController.getAllOtherExtensionActivityTypes);
router.get('/other-extension-activity-type/:id', requirePermission('all_masters_other_extension_activity_master', 'VIEW'),   otherMastersController.getOtherExtensionActivityTypeById);
router.post('/other-extension-activity-type',    requirePermission('all_masters_other_extension_activity_master', 'ADD'),    otherMastersController.createOtherExtensionActivityType);
router.put('/other-extension-activity-type/:id', requirePermission('all_masters_other_extension_activity_master', 'EDIT'),   otherMastersController.updateOtherExtensionActivityType);
router.delete('/other-extension-activity-type/:id', requirePermission('all_masters_other_extension_activity_master', 'DELETE'), otherMastersController.deleteOtherExtensionActivityType);

// Important Day is grouped under the Events Master module (same as /events).
// This intentional grouping mirrors the frontend routeConfig where both routes
// share moduleCode 'all_masters_events_master', consistent with other grouped
// masters (e.g. OFT, FLD, Products each covering multiple sub-entities).
router.get('/important-day',     requirePermission('all_masters_events_master', 'VIEW'),   otherMastersController.getAllImportantDays);
router.get('/important-day/:id', requirePermission('all_masters_events_master', 'VIEW'),   otherMastersController.getImportantDayById);
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
router.get('/training-clientele',     requirePermission('all_masters_training_master', 'VIEW'),   otherMastersController.getAllTrainingClientele);
router.get('/training-clientele/:id', requirePermission('all_masters_training_master', 'VIEW'),   otherMastersController.getTrainingClienteleById);
router.post('/training-clientele',    requirePermission('all_masters_training_master', 'ADD'),    otherMastersController.createTrainingClientele);
router.put('/training-clientele/:id', requirePermission('all_masters_training_master', 'EDIT'),   otherMastersController.updateTrainingClientele);
router.delete('/training-clientele/:id', requirePermission('all_masters_training_master', 'DELETE'), otherMastersController.deleteTrainingClientele);

router.get('/funding-source',     requirePermission('all_masters_training_master', 'VIEW'),   otherMastersController.getAllFundingSources);
router.get('/funding-source/:id', requirePermission('all_masters_training_master', 'VIEW'),   otherMastersController.getFundingSourceById);
router.post('/funding-source',    requirePermission('all_masters_training_master', 'ADD'),    otherMastersController.createFundingSource);
router.put('/funding-source/:id', requirePermission('all_masters_training_master', 'EDIT'),   otherMastersController.updateFundingSource);
router.delete('/funding-source/:id', requirePermission('all_masters_training_master', 'DELETE'), otherMastersController.deleteFundingSource);

// ============================================
// Other Masters Routes (continued)
// ============================================

router.get('/crop-type',     requirePermission('all_masters_crop_type_master', 'VIEW'),   otherMastersController.getAllCropTypes);
router.get('/crop-type/:id', requirePermission('all_masters_crop_type_master', 'VIEW'),   otherMastersController.getCropTypeById);
router.post('/crop-type',    requirePermission('all_masters_crop_type_master', 'ADD'),    otherMastersController.createCropType);
router.put('/crop-type/:id', requirePermission('all_masters_crop_type_master', 'EDIT'),   otherMastersController.updateCropType);
router.delete('/crop-type/:id', requirePermission('all_masters_crop_type_master', 'DELETE'), otherMastersController.deleteCropType);

router.get('/infrastructure-master',     requirePermission('all_masters_infrastructure_master', 'VIEW'),   otherMastersController.getAllInfrastructureMasters);
router.get('/infrastructure-master/:id', requirePermission('all_masters_infrastructure_master', 'VIEW'),   otherMastersController.getInfrastructureMasterById);
router.post('/infrastructure-master',    requirePermission('all_masters_infrastructure_master', 'ADD'),    otherMastersController.createInfrastructureMaster);
router.put('/infrastructure-master/:id', requirePermission('all_masters_infrastructure_master', 'EDIT'),   otherMastersController.updateInfrastructureMaster);
router.delete('/infrastructure-master/:id', requirePermission('all_masters_infrastructure_master', 'DELETE'), otherMastersController.deleteInfrastructureMaster);

module.exports = router;
