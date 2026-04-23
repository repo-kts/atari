const otherMastersService = require('../../services/all-masters/otherMastersService.js');

/**
 * Other Masters Controller
 * HTTP request handlers for Season, Sanctioned Post, and Year master data operations
 */

/**
 * Generic handler to get all entities
 */
const getAll = (entityName) => async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 100,
            search: req.query.search || '',
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder || 'asc',
            filters: req.query.filters ? JSON.parse(req.query.filters) : {},
        };

        const result = await otherMastersService.getAll(entityName, options);
        res.json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
        });
    }
};

/**
 * Generic handler to get entity by ID
 */
const getById = (entityName) => async (req, res) => {
    try {
        const data = await otherMastersService.getById(entityName, req.params.id);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(`Error fetching ${entityName} by ID:`, error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
        });
    }
};

/**
 * Generic handler to create entity
 */
const create = (entityName) => async (req, res) => {
    try {
        const data = await otherMastersService.create(entityName, req.body);
        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(`Error creating ${entityName}:`, error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
        });
    }
};

/**
 * Generic handler to update entity
 */
const update = (entityName) => async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                error: 'ID parameter is required',
            });
        }
        const data = await otherMastersService.update(entityName, req.params.id, req.body);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(`Error updating ${entityName}:`, error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
        });
    }
};

/**
 * Generic handler to delete entity
 */
const deleteEntity = (entityName) => async (req, res) => {
    try {
        await otherMastersService.deleteEntity(entityName, req.params.id);
        res.json({
            success: true,
            message: `${entityName} deleted successfully`,
        });
    } catch (error) {
        console.error(`Error deleting ${entityName}:`, error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
        });
    }
};

// ============================================
// Season Controllers
// ============================================

exports.getAllSeasons = getAll('seasons');
exports.getSeasonById = getById('seasons');
exports.createSeason = create('seasons');
exports.updateSeason = update('seasons');
exports.deleteSeason = deleteEntity('seasons');

// ============================================
// Sanctioned Post Controllers
// ============================================

exports.getAllSanctionedPosts = getAll('sanctioned-posts');
exports.getSanctionedPostById = getById('sanctioned-posts');
exports.createSanctionedPost = create('sanctioned-posts');
exports.updateSanctionedPost = update('sanctioned-posts');
exports.deleteSanctionedPost = deleteEntity('sanctioned-posts');

// ============================================
// Year Controllers
// ============================================

exports.getAllYears = getAll('years');
exports.getYearById = getById('years');
exports.createYear = create('years');
exports.updateYear = update('years');
exports.deleteYear = deleteEntity('years');

// ============================================
// Employee Masters Controllers
// ============================================

exports.getAllStaffCategories = getAll('staff-category');
exports.getStaffCategoryById = getById('staff-category');
exports.createStaffCategory = create('staff-category');
exports.updateStaffCategory = update('staff-category');
exports.deleteStaffCategory = deleteEntity('staff-category');

exports.getAllPayLevels = getAll('pay-level');
exports.getPayLevelById = getById('pay-level');
exports.createPayLevel = create('pay-level');
exports.updatePayLevel = update('pay-level');
exports.deletePayLevel = deleteEntity('pay-level');

exports.getAllPayScales = getAll('pay-scale');
exports.getPayScaleById = getById('pay-scale');
exports.createPayScale = create('pay-scale');
exports.updatePayScale = update('pay-scale');
exports.deletePayScale = deleteEntity('pay-scale');

exports.getAllDisciplines = getAll('discipline');
exports.getDisciplineById = getById('discipline');
exports.createDiscipline = create('discipline');
exports.updateDiscipline = update('discipline');
exports.deleteDiscipline = deleteEntity('discipline');

exports.getAllAssetFundingSources = getAll('asset-funding-source');
exports.getAssetFundingSourceById = getById('asset-funding-source');
exports.createAssetFundingSource = create('asset-funding-source');
exports.updateAssetFundingSource = update('asset-funding-source');
exports.deleteAssetFundingSource = deleteEntity('asset-funding-source');

exports.getAllEquipmentTypes = getAll('equipment-type');
exports.getEquipmentTypeById = getById('equipment-type');
exports.createEquipmentType = create('equipment-type');
exports.updateEquipmentType = update('equipment-type');
exports.deleteEquipmentType = deleteEntity('equipment-type');

exports.getAllEquipmentMasters = getAll('equipment-master');
exports.getEquipmentMasterById = getById('equipment-master');
exports.createEquipmentMaster = create('equipment-master');
exports.updateEquipmentMaster = update('equipment-master');
exports.deleteEquipmentMaster = deleteEntity('equipment-master');

// ============================================
// Extension Masters Controllers
// ============================================

exports.getAllExtensionActivityTypes = getAll('extension-activity-type');
exports.getExtensionActivityTypeById = getById('extension-activity-type');
exports.createExtensionActivityType = create('extension-activity-type');
exports.updateExtensionActivityType = update('extension-activity-type');
exports.deleteExtensionActivityType = deleteEntity('extension-activity-type');

exports.getAllOtherExtensionActivityTypes = getAll('other-extension-activity-type');
exports.getOtherExtensionActivityTypeById = getById('other-extension-activity-type');
exports.createOtherExtensionActivityType = create('other-extension-activity-type');
exports.updateOtherExtensionActivityType = update('other-extension-activity-type');
exports.deleteOtherExtensionActivityType = deleteEntity('other-extension-activity-type');

exports.getAllImportantDays = getAll('important-day');
exports.getImportantDayById = getById('important-day');
exports.createImportantDay = create('important-day');
exports.updateImportantDay = update('important-day');
exports.deleteImportantDay = deleteEntity('important-day');

// ============================================
// Training Masters Controllers
// ============================================

exports.getAllTrainingClientele = getAll('training-clientele');
exports.getTrainingClienteleById = getById('training-clientele');
exports.createTrainingClientele = create('training-clientele');
exports.updateTrainingClientele = update('training-clientele');
exports.deleteTrainingClientele = deleteEntity('training-clientele');

exports.getAllFundingSources = getAll('funding-source');
exports.getFundingSourceById = getById('funding-source');
exports.createFundingSource = create('funding-source');
exports.updateFundingSource = update('funding-source');
exports.deleteFundingSource = deleteEntity('funding-source');

exports.getAllUnits = getAll('unit');
exports.getUnitById = getById('unit');
exports.createUnit = create('unit');
exports.updateUnit = update('unit');
exports.deleteUnit = deleteEntity('unit');

// ============================================
// Other Masters Controllers (continued)
// ============================================

exports.getAllCropTypes = getAll('crop-type');
exports.getCropTypeById = getById('crop-type');
exports.createCropType = create('crop-type');
exports.updateCropType = update('crop-type');
exports.deleteCropType = deleteEntity('crop-type');

exports.getAllBudgetItems = getAll('budget-item');
exports.getBudgetItemById = getById('budget-item');
exports.createBudgetItem = create('budget-item');
exports.updateBudgetItem = update('budget-item');
exports.deleteBudgetItem = deleteEntity('budget-item');

exports.getAllInfrastructureMasters = getAll('infrastructure-master');
exports.getInfrastructureMasterById = getById('infrastructure-master');
exports.createInfrastructureMaster = create('infrastructure-master');
exports.updateInfrastructureMaster = update('infrastructure-master');
exports.deleteInfrastructureMaster = deleteEntity('infrastructure-master');

// ============================================
// Soil Water Analysis Masters Controllers
// ============================================

exports.getAllSoilWaterAnalyses = getAll('soil-water-analysis');
exports.getSoilWaterAnalysisById = getById('soil-water-analysis');
exports.createSoilWaterAnalysis = create('soil-water-analysis');
exports.updateSoilWaterAnalysis = update('soil-water-analysis');
exports.deleteSoilWaterAnalysis = deleteEntity('soil-water-analysis');

// ============================================
// NARI Masters Controllers
// ============================================

exports.getAllNariCropCategories = getAll('nari-crop-category');
exports.getAllNariActivities = getAll('nari-activity');
exports.getNariActivityById = getById('nari-activity');
exports.createNariActivity = create('nari-activity');
exports.updateNariActivity = update('nari-activity');
exports.deleteNariActivity = deleteEntity('nari-activity');

exports.getAllNariNutritionGardenTypes = getAll('nari-nutrition-garden-type');
exports.getNariNutritionGardenTypeById = getById('nari-nutrition-garden-type');
exports.createNariNutritionGardenType = create('nari-nutrition-garden-type');
exports.updateNariNutritionGardenType = update('nari-nutrition-garden-type');
exports.deleteNariNutritionGardenType = deleteEntity('nari-nutrition-garden-type');

// ============================================
// NICRA Masters Controllers
// ============================================

exports.getAllNicraCategories = getAll('nicra-category');
exports.getNicraCategoryById = getById('nicra-category');
exports.createNicraCategory = create('nicra-category');
exports.updateNicraCategory = update('nicra-category');
exports.deleteNicraCategory = deleteEntity('nicra-category');

exports.getAllNicraSubCategories = getAll('nicra-sub-category');
exports.getNicraSubCategoryById = getById('nicra-sub-category');
exports.createNicraSubCategory = create('nicra-sub-category');
exports.updateNicraSubCategory = update('nicra-sub-category');
exports.deleteNicraSubCategory = deleteEntity('nicra-sub-category');

exports.getAllNicraSeedBankFodderBank = getAll('nicra-seed-bank-fodder-bank');
exports.getNicraSeedBankFodderBankById = getById('nicra-seed-bank-fodder-bank');
exports.createNicraSeedBankFodderBank = create('nicra-seed-bank-fodder-bank');
exports.updateNicraSeedBankFodderBank = update('nicra-seed-bank-fodder-bank');
exports.deleteNicraSeedBankFodderBank = deleteEntity('nicra-seed-bank-fodder-bank');

exports.getAllNicraDignitaryTypes = getAll('nicra-dignitary-type');
exports.getNicraDignitaryTypeById = getById('nicra-dignitary-type');
exports.createNicraDignitaryType = create('nicra-dignitary-type');
exports.updateNicraDignitaryType = update('nicra-dignitary-type');
exports.deleteNicraDignitaryType = deleteEntity('nicra-dignitary-type');

exports.getAllNicraPiTypes = getAll('nicra-pi-type');
exports.getNicraPiTypeById = getById('nicra-pi-type');
exports.createNicraPiType = create('nicra-pi-type');
exports.updateNicraPiType = update('nicra-pi-type');
exports.deleteNicraPiType = deleteEntity('nicra-pi-type');

// ============================================
// Impact Specific Area Master Controllers
// ============================================

exports.getAllImpactSpecificAreas = getAll('impact-specific-area-master');
exports.getImpactSpecificAreaById = getById('impact-specific-area-master');
exports.createImpactSpecificArea = create('impact-specific-area-master');
exports.updateImpactSpecificArea = update('impact-specific-area-master');
exports.deleteImpactSpecificArea = deleteEntity('impact-specific-area-master');

// ============================================
// Enterprise Type Master Controllers
// ============================================

exports.getAllEnterpriseTypes = getAll('enterprise-type');
exports.getEnterpriseTypeById = getById('enterprise-type');
exports.createEnterpriseType = create('enterprise-type');
exports.updateEnterpriseType = update('enterprise-type');
exports.deleteEnterpriseType = deleteEntity('enterprise-type');

// ============================================
// Account Type Master Controllers
// ============================================

exports.getAllAccountTypes = getAll('account-type');
exports.getAccountTypeById = getById('account-type');
exports.createAccountType = create('account-type');
exports.updateAccountType = update('account-type');
exports.deleteAccountType = deleteEntity('account-type');

// ============================================
// Programme Type Master Controllers
// ============================================

exports.getAllProgrammeTypes = getAll('programme-type');
exports.getProgrammeTypeById = getById('programme-type');
exports.createProgrammeType = create('programme-type');
exports.updateProgrammeType = update('programme-type');
exports.deleteProgrammeType = deleteEntity('programme-type');

// ============================================
// PPV & FRA Training Type Master Controllers
// ============================================

exports.getAllPpvFraTrainingTypes = getAll('ppv-fra-training-type');
exports.getPpvFraTrainingTypeById = getById('ppv-fra-training-type');
exports.createPpvFraTrainingType = create('ppv-fra-training-type');
exports.updatePpvFraTrainingType = update('ppv-fra-training-type');
exports.deletePpvFraTrainingType = deleteEntity('ppv-fra-training-type');

// ============================================
// Dignitary Type Master Controllers
// ============================================

exports.getAllDignitaryTypes = getAll('dignitary-type');
exports.getDignitaryTypeById = getById('dignitary-type');
exports.createDignitaryType = create('dignitary-type');
exports.updateDignitaryType = update('dignitary-type');
exports.deleteDignitaryType = deleteEntity('dignitary-type');

// ============================================
// Financial Project Master Controllers
// ============================================

exports.getAllFinancialProjects = getAll('financial-project');
exports.getFinancialProjectById = getById('financial-project');
exports.createFinancialProject = create('financial-project');
exports.updateFinancialProject = update('financial-project');
exports.deleteFinancialProject = deleteEntity('financial-project');

// ============================================
// Funding Agency Master Controllers
// ============================================

exports.getAllFundingAgencies = getAll('funding-agency');
exports.getFundingAgencyById = getById('funding-agency');
exports.createFundingAgency = create('funding-agency');
exports.updateFundingAgency = update('funding-agency');
exports.deleteFundingAgency = deleteEntity('funding-agency');

exports.getAllVehiclePresentStatuses = getAll('vehicle-present-status');
exports.getVehiclePresentStatusById = getById('vehicle-present-status');
exports.createVehiclePresentStatus = create('vehicle-present-status');
exports.updateVehiclePresentStatus = update('vehicle-present-status');
exports.deleteVehiclePresentStatus = deleteEntity('vehicle-present-status');

exports.getAllEquipmentPresentStatuses = getAll('equipment-present-status');
exports.getEquipmentPresentStatusById = getById('equipment-present-status');
exports.createEquipmentPresentStatus = create('equipment-present-status');
exports.updateEquipmentPresentStatus = update('equipment-present-status');
exports.deleteEquipmentPresentStatus = deleteEntity('equipment-present-status');