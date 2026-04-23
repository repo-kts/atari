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

router.get('/pay-scale',     otherMastersController.getAllPayScales);
router.get('/pay-scale/:id', otherMastersController.getPayScaleById);
router.post('/pay-scale',    requirePermission('all_masters_pay_scale_master', 'ADD'),    otherMastersController.createPayScale);
router.put('/pay-scale/:id', requirePermission('all_masters_pay_scale_master', 'EDIT'),   otherMastersController.updatePayScale);
router.delete('/pay-scale/:id', requirePermission('all_masters_pay_scale_master', 'DELETE'), otherMastersController.deletePayScale);

router.get('/discipline',     otherMastersController.getAllDisciplines);
router.get('/discipline/:id', otherMastersController.getDisciplineById);
router.post('/discipline',    requirePermission('all_masters_discipline_master', 'ADD'),    otherMastersController.createDiscipline);
router.put('/discipline/:id', requirePermission('all_masters_discipline_master', 'EDIT'),   otherMastersController.updateDiscipline);
router.delete('/discipline/:id', requirePermission('all_masters_discipline_master', 'DELETE'), otherMastersController.deleteDiscipline);

router.get('/asset-funding-source',     otherMastersController.getAllAssetFundingSources);
router.get('/asset-funding-source/:id', otherMastersController.getAssetFundingSourceById);
router.post('/asset-funding-source',    requirePermission('all_masters_asset_funding_source_master', 'ADD'),    otherMastersController.createAssetFundingSource);
router.put('/asset-funding-source/:id', requirePermission('all_masters_asset_funding_source_master', 'EDIT'),   otherMastersController.updateAssetFundingSource);
router.delete('/asset-funding-source/:id', requirePermission('all_masters_asset_funding_source_master', 'DELETE'), otherMastersController.deleteAssetFundingSource);

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

router.get('/budget-item', otherMastersController.getAllBudgetItems);
router.get('/budget-item/:id', otherMastersController.getBudgetItemById);

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

// ============================================
// NARI Masters Routes
// ============================================

router.get('/nari-crop-category', otherMastersController.getAllNariCropCategories);
router.get('/nari-activity', otherMastersController.getAllNariActivities);
router.get('/nari-activity/:id', otherMastersController.getNariActivityById);
router.post('/nari-activity', requirePermission('all_masters_nari_activity_master', 'ADD'), otherMastersController.createNariActivity);
router.put('/nari-activity/:id', requirePermission('all_masters_nari_activity_master', 'EDIT'), otherMastersController.updateNariActivity);
router.delete('/nari-activity/:id', requirePermission('all_masters_nari_activity_master', 'DELETE'), otherMastersController.deleteNariActivity);

router.get('/nari-nutrition-garden-type', otherMastersController.getAllNariNutritionGardenTypes);
router.get('/nari-nutrition-garden-type/:id', otherMastersController.getNariNutritionGardenTypeById);
router.post('/nari-nutrition-garden-type', requirePermission('all_masters_nari_garden_type_master', 'ADD'), otherMastersController.createNariNutritionGardenType);
router.put('/nari-nutrition-garden-type/:id', requirePermission('all_masters_nari_garden_type_master', 'EDIT'), otherMastersController.updateNariNutritionGardenType);
router.delete('/nari-nutrition-garden-type/:id', requirePermission('all_masters_nari_garden_type_master', 'DELETE'), otherMastersController.deleteNariNutritionGardenType);

// NICRA Category/Sub-category are grouped under one NICRA module
router.get('/nicra-category', otherMastersController.getAllNicraCategories);
router.get('/nicra-category/:id', otherMastersController.getNicraCategoryById);
router.post('/nicra-category', requirePermission('all_masters_nicra_master', 'ADD'), otherMastersController.createNicraCategory);
router.put('/nicra-category/:id', requirePermission('all_masters_nicra_master', 'EDIT'), otherMastersController.updateNicraCategory);
router.delete('/nicra-category/:id', requirePermission('all_masters_nicra_master', 'DELETE'), otherMastersController.deleteNicraCategory);

router.get('/nicra-sub-category', otherMastersController.getAllNicraSubCategories);
router.get('/nicra-sub-category/:id', otherMastersController.getNicraSubCategoryById);
router.post('/nicra-sub-category', requirePermission('all_masters_nicra_master', 'ADD'), otherMastersController.createNicraSubCategory);
router.put('/nicra-sub-category/:id', requirePermission('all_masters_nicra_master', 'EDIT'), otherMastersController.updateNicraSubCategory);
router.delete('/nicra-sub-category/:id', requirePermission('all_masters_nicra_master', 'DELETE'), otherMastersController.deleteNicraSubCategory);

router.get('/nicra-seed-bank-fodder-bank', otherMastersController.getAllNicraSeedBankFodderBank);
router.get('/nicra-seed-bank-fodder-bank/:id', otherMastersController.getNicraSeedBankFodderBankById);
router.post('/nicra-seed-bank-fodder-bank', requirePermission('all_masters_nicra_master', 'ADD'), otherMastersController.createNicraSeedBankFodderBank);
router.put('/nicra-seed-bank-fodder-bank/:id', requirePermission('all_masters_nicra_master', 'EDIT'), otherMastersController.updateNicraSeedBankFodderBank);
router.delete('/nicra-seed-bank-fodder-bank/:id', requirePermission('all_masters_nicra_master', 'DELETE'), otherMastersController.deleteNicraSeedBankFodderBank);

router.get('/nicra-dignitary-type', otherMastersController.getAllNicraDignitaryTypes);
router.get('/nicra-dignitary-type/:id', otherMastersController.getNicraDignitaryTypeById);
router.post('/nicra-dignitary-type', requirePermission('all_masters_nicra_master', 'ADD'), otherMastersController.createNicraDignitaryType);
router.put('/nicra-dignitary-type/:id', requirePermission('all_masters_nicra_master', 'EDIT'), otherMastersController.updateNicraDignitaryType);
router.delete('/nicra-dignitary-type/:id', requirePermission('all_masters_nicra_master', 'DELETE'), otherMastersController.deleteNicraDignitaryType);

router.get('/nicra-pi-type', otherMastersController.getAllNicraPiTypes);
router.get('/nicra-pi-type/:id', otherMastersController.getNicraPiTypeById);
router.post('/nicra-pi-type', requirePermission('all_masters_nicra_master', 'ADD'), otherMastersController.createNicraPiType);
router.put('/nicra-pi-type/:id', requirePermission('all_masters_nicra_master', 'EDIT'), otherMastersController.updateNicraPiType);
router.delete('/nicra-pi-type/:id', requirePermission('all_masters_nicra_master', 'DELETE'), otherMastersController.deleteNicraPiType);

// ============================================
// Impact Specific Area Master Routes
// ============================================

router.get('/impact-specific-area-master', otherMastersController.getAllImpactSpecificAreas);
router.get('/impact-specific-area-master/:id', otherMastersController.getImpactSpecificAreaById);
router.post('/impact-specific-area-master', requirePermission('all_masters_impact_area_master', 'ADD'), otherMastersController.createImpactSpecificArea);
router.put('/impact-specific-area-master/:id', requirePermission('all_masters_impact_area_master', 'EDIT'), otherMastersController.updateImpactSpecificArea);
router.delete('/impact-specific-area-master/:id', requirePermission('all_masters_impact_area_master', 'DELETE'), otherMastersController.deleteImpactSpecificArea);

// ============================================
// Enterprise Type Master Routes
// ============================================

router.get('/enterprise-type', otherMastersController.getAllEnterpriseTypes);
router.get('/enterprise-type/:id', otherMastersController.getEnterpriseTypeById);
router.post('/enterprise-type', requirePermission('all_masters_enterprise_type_master', 'ADD'), otherMastersController.createEnterpriseType);
router.put('/enterprise-type/:id', requirePermission('all_masters_enterprise_type_master', 'EDIT'), otherMastersController.updateEnterpriseType);
router.delete('/enterprise-type/:id', requirePermission('all_masters_enterprise_type_master', 'DELETE'), otherMastersController.deleteEnterpriseType);

// ============================================
// Account Type Master Routes
// ============================================

router.get('/account-type', otherMastersController.getAllAccountTypes);
router.get('/account-type/:id', otherMastersController.getAccountTypeById);
router.post('/account-type', requirePermission('all_masters_account_type_master', 'ADD'), otherMastersController.createAccountType);
router.put('/account-type/:id', requirePermission('all_masters_account_type_master', 'EDIT'), otherMastersController.updateAccountType);
router.delete('/account-type/:id', requirePermission('all_masters_account_type_master', 'DELETE'), otherMastersController.deleteAccountType);

// ============================================
// Programme Type Master Routes
// ============================================

router.get('/programme-type', otherMastersController.getAllProgrammeTypes);
router.get('/programme-type/:id', otherMastersController.getProgrammeTypeById);
router.post('/programme-type', requirePermission('all_masters_programme_type_master', 'ADD'), otherMastersController.createProgrammeType);
router.put('/programme-type/:id', requirePermission('all_masters_programme_type_master', 'EDIT'), otherMastersController.updateProgrammeType);
router.delete('/programme-type/:id', requirePermission('all_masters_programme_type_master', 'DELETE'), otherMastersController.deleteProgrammeType);

// ============================================
// PPV & FRA Training Type Master Routes
// ============================================

router.get('/ppv-fra-training-type', otherMastersController.getAllPpvFraTrainingTypes);
router.get('/ppv-fra-training-type/:id', otherMastersController.getPpvFraTrainingTypeById);
router.post('/ppv-fra-training-type', requirePermission('all_masters_ppv_fra_training_type_master', 'ADD'), otherMastersController.createPpvFraTrainingType);
router.put('/ppv-fra-training-type/:id', requirePermission('all_masters_ppv_fra_training_type_master', 'EDIT'), otherMastersController.updatePpvFraTrainingType);
router.delete('/ppv-fra-training-type/:id', requirePermission('all_masters_ppv_fra_training_type_master', 'DELETE'), otherMastersController.deletePpvFraTrainingType);

// ============================================
// Dignitary Type Master Routes
// ============================================

router.get('/dignitary-type', otherMastersController.getAllDignitaryTypes);
router.get('/dignitary-type/:id', otherMastersController.getDignitaryTypeById);
router.post('/dignitary-type', requirePermission('all_masters_dignitary_type_master', 'ADD'), otherMastersController.createDignitaryType);
router.put('/dignitary-type/:id', requirePermission('all_masters_dignitary_type_master', 'EDIT'), otherMastersController.updateDignitaryType);
router.delete('/dignitary-type/:id', requirePermission('all_masters_dignitary_type_master', 'DELETE'), otherMastersController.deleteDignitaryType);

// ============================================
// Financial Project Master Routes
// ============================================

router.get('/financial-project', otherMastersController.getAllFinancialProjects);
router.get('/financial-project/:id', otherMastersController.getFinancialProjectById);
router.post('/financial-project', requirePermission('all_masters_financial_project_master', 'ADD'), otherMastersController.createFinancialProject);
router.put('/financial-project/:id', requirePermission('all_masters_financial_project_master', 'EDIT'), otherMastersController.updateFinancialProject);
router.delete('/financial-project/:id', requirePermission('all_masters_financial_project_master', 'DELETE'), otherMastersController.deleteFinancialProject);

// ============================================
// Funding Agency Master Routes
// ============================================

router.get('/funding-agency', otherMastersController.getAllFundingAgencies);
router.get('/funding-agency/:id', otherMastersController.getFundingAgencyById);
router.post('/funding-agency', requirePermission('all_masters_funding_agency_master', 'ADD'), otherMastersController.createFundingAgency);
router.put('/funding-agency/:id', requirePermission('all_masters_funding_agency_master', 'EDIT'), otherMastersController.updateFundingAgency);
router.delete('/funding-agency/:id', requirePermission('all_masters_funding_agency_master', 'DELETE'), otherMastersController.deleteFundingAgency);

router.get('/vehicle-present-status', otherMastersController.getAllVehiclePresentStatuses);
router.get('/vehicle-present-status/:id', otherMastersController.getVehiclePresentStatusById);
router.post('/vehicle-present-status', requirePermission('all_masters_vehicle_present_status_master', 'ADD'), otherMastersController.createVehiclePresentStatus);
router.put('/vehicle-present-status/:id', requirePermission('all_masters_vehicle_present_status_master', 'EDIT'), otherMastersController.updateVehiclePresentStatus);
router.delete('/vehicle-present-status/:id', requirePermission('all_masters_vehicle_present_status_master', 'DELETE'), otherMastersController.deleteVehiclePresentStatus);

router.get('/equipment-present-status', otherMastersController.getAllEquipmentPresentStatuses);
router.get('/equipment-present-status/:id', otherMastersController.getEquipmentPresentStatusById);
router.post('/equipment-present-status', requirePermission('all_masters_equipment_present_status_master', 'ADD'), otherMastersController.createEquipmentPresentStatus);
router.put('/equipment-present-status/:id', requirePermission('all_masters_equipment_present_status_master', 'EDIT'), otherMastersController.updateEquipmentPresentStatus);
router.delete('/equipment-present-status/:id', requirePermission('all_masters_equipment_present_status_master', 'DELETE'), otherMastersController.deleteEquipmentPresentStatus);

module.exports = router;
