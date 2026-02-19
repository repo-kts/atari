const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const otherMastersController = require('../../controllers/all-masters/otherMastersController.js');

// Apply authentication and authorization middleware
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// ============================================
// Season Routes
// ============================================

router.get('/seasons', otherMastersController.getAllSeasons);
router.get('/seasons/:id', otherMastersController.getSeasonById);
router.post('/seasons', otherMastersController.createSeason);
router.put('/seasons/:id', otherMastersController.updateSeason); 
router.delete('/seasons/:id', otherMastersController.deleteSeason);

// ============================================
// Sanctioned Post Routes
// ============================================

router.get('/sanctioned-posts', otherMastersController.getAllSanctionedPosts);
router.get('/sanctioned-posts/:id', otherMastersController.getSanctionedPostById);
router.post('/sanctioned-posts', otherMastersController.createSanctionedPost);
router.put('/sanctioned-posts/:id', otherMastersController.updateSanctionedPost);
router.delete('/sanctioned-posts/:id', otherMastersController.deleteSanctionedPost);

// ============================================
// Year Routes
// ============================================

router.get('/years', otherMastersController.getAllYears);
router.get('/years/:id', otherMastersController.getYearById);
router.post('/years', otherMastersController.createYear);
router.put('/years/:id', otherMastersController.updateYear);
router.delete('/years/:id', otherMastersController.deleteYear);

// ============================================
// Employee Masters Routes
// ============================================

router.get('/staff-category', otherMastersController.getAllStaffCategories);
router.get('/staff-category/:id', otherMastersController.getStaffCategoryById);
router.post('/staff-category', otherMastersController.createStaffCategory);
router.put('/staff-category/:id', otherMastersController.updateStaffCategory);
router.delete('/staff-category/:id', otherMastersController.deleteStaffCategory);

router.get('/pay-level', otherMastersController.getAllPayLevels);
router.get('/pay-level/:id', otherMastersController.getPayLevelById);
router.post('/pay-level', otherMastersController.createPayLevel);
router.put('/pay-level/:id', otherMastersController.updatePayLevel);
router.delete('/pay-level/:id', otherMastersController.deletePayLevel);

router.get('/discipline', otherMastersController.getAllDisciplines);
router.get('/discipline/:id', otherMastersController.getDisciplineById);
router.post('/discipline', otherMastersController.createDiscipline);
router.put('/discipline/:id', otherMastersController.updateDiscipline);
router.delete('/discipline/:id', otherMastersController.deleteDiscipline);

// ============================================
// Extension Masters Routes
// ============================================

router.get('/extension-activity-type', otherMastersController.getAllExtensionActivityTypes);
router.get('/extension-activity-type/:id', otherMastersController.getExtensionActivityTypeById);
router.post('/extension-activity-type', otherMastersController.createExtensionActivityType);
router.put('/extension-activity-type/:id', otherMastersController.updateExtensionActivityType);
router.delete('/extension-activity-type/:id', otherMastersController.deleteExtensionActivityType);

router.get('/other-extension-activity-type', otherMastersController.getAllOtherExtensionActivityTypes);
router.get('/other-extension-activity-type/:id', otherMastersController.getOtherExtensionActivityTypeById);
router.post('/other-extension-activity-type', otherMastersController.createOtherExtensionActivityType);
router.put('/other-extension-activity-type/:id', otherMastersController.updateOtherExtensionActivityType);
router.delete('/other-extension-activity-type/:id', otherMastersController.deleteOtherExtensionActivityType);

router.get('/important-day', otherMastersController.getAllImportantDays);
router.get('/important-day/:id', otherMastersController.getImportantDayById);
router.post('/important-day', otherMastersController.createImportantDay);
router.put('/important-day/:id', otherMastersController.updateImportantDay);
router.delete('/important-day/:id', otherMastersController.deleteImportantDay);

// ============================================
// Training Masters Routes
// ============================================

router.get('/training-clientele', otherMastersController.getAllTrainingClientele);
router.get('/training-clientele/:id', otherMastersController.getTrainingClienteleById);
router.post('/training-clientele', otherMastersController.createTrainingClientele);
router.put('/training-clientele/:id', otherMastersController.updateTrainingClientele);
router.delete('/training-clientele/:id', otherMastersController.deleteTrainingClientele);

router.get('/funding-source', otherMastersController.getAllFundingSources);
router.get('/funding-source/:id', otherMastersController.getFundingSourceById);
router.post('/funding-source', otherMastersController.createFundingSource);
router.put('/funding-source/:id', otherMastersController.updateFundingSource);
router.delete('/funding-source/:id', otherMastersController.deleteFundingSource);

// ============================================
// Other Masters Routes (continued)
// ============================================

router.get('/crop-type', otherMastersController.getAllCropTypes);
router.get('/crop-type/:id', otherMastersController.getCropTypeById);
router.post('/crop-type', otherMastersController.createCropType);
router.put('/crop-type/:id', otherMastersController.updateCropType);
router.delete('/crop-type/:id', otherMastersController.deleteCropType);

router.get('/infrastructure-master', otherMastersController.getAllInfrastructureMasters);
router.get('/infrastructure-master/:id', otherMastersController.getInfrastructureMasterById);
router.post('/infrastructure-master', otherMastersController.createInfrastructureMaster);
router.put('/infrastructure-master/:id', otherMastersController.updateInfrastructureMaster);
router.delete('/infrastructure-master/:id', otherMastersController.deleteInfrastructureMaster);

module.exports = router;
