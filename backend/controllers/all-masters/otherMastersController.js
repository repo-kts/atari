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

exports.getAllDisciplines = getAll('discipline');
exports.getDisciplineById = getById('discipline');
exports.createDiscipline = create('discipline');
exports.updateDiscipline = update('discipline');
exports.deleteDiscipline = deleteEntity('discipline');

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

// ============================================
// Other Masters Controllers (continued)
// ============================================

exports.getAllCropTypes = getAll('crop-type');
exports.getCropTypeById = getById('crop-type');
exports.createCropType = create('crop-type');
exports.updateCropType = update('crop-type');
exports.deleteCropType = deleteEntity('crop-type');

exports.getAllInfrastructureMasters = getAll('infrastructure-master');
exports.getInfrastructureMasterById = getById('infrastructure-master');
exports.createInfrastructureMaster = create('infrastructure-master');
exports.updateInfrastructureMaster = update('infrastructure-master');
exports.deleteInfrastructureMaster = deleteEntity('infrastructure-master');
