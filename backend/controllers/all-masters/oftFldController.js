const oftFldService = require('../../services/all-masters/oftFldService.js');
const { DEFAULT_MASTER_LIST_PAGE_SIZE, normalizeListLimit } = require('../../constants/masterListPagination.js');
const { asyncHandler } = require('../../utils/errorHandler.js');

/**
 * OFT & FLD Master Data Controller
 * HTTP request handlers for OFT, FLD, and CFLD master data operations
 */

/**
 * Generic handler to get all entities
 */
const getAll = (entityName) => asyncHandler(async (req, res) => {
    const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: normalizeListLimit(req.query.limit, DEFAULT_MASTER_LIST_PAGE_SIZE),
        search: req.query.search || '',
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder || 'asc',
        filters: req.query.filters ? JSON.parse(req.query.filters) : {},
    };

    const result = await oftFldService.getAll(entityName, options);
    res.json({
        success: true,
        data: result.data,
        pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
        },
    });
});

/**
 * Generic handler to get entity by ID
 */
const getById = (entityName) => asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await oftFldService.getById(entityName, id);
    res.json({
        success: true,
        data,
    });
});

/**
 * Generic handler to create entity
 */
const create = (entityName) => asyncHandler(async (req, res) => {
    const data = await oftFldService.create(entityName, req.body);
    res.status(201).json({
        success: true,
        data,
        message: `${entityName} created successfully`,
    });
});

/**
 * Generic handler to update entity
 */
const update = (entityName) => asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await oftFldService.update(entityName, id, req.body);
    res.json({
        success: true,
        data,
        message: `${entityName} updated successfully`,
    });
});

/**
 * Generic handler to delete entity
 */
const deleteEntity = (entityName) => asyncHandler(async (req, res) => {
    const { id } = req.params;
    await oftFldService.delete(entityName, id);
    res.json({
        success: true,
        message: `${entityName} deleted successfully`,
    });
});

// OFT Controllers
exports.getAllOftSubjects = getAll('oft-subjects');
exports.getOftSubjectById = getById('oft-subjects');
exports.createOftSubject = create('oft-subjects');
exports.updateOftSubject = update('oft-subjects');
exports.deleteOftSubject = deleteEntity('oft-subjects');

exports.getAllOftThematicAreas = getAll('oft-thematic-areas');
exports.getOftThematicAreaById = getById('oft-thematic-areas');
exports.createOftThematicArea = create('oft-thematic-areas');
exports.updateOftThematicArea = update('oft-thematic-areas');
exports.deleteOftThematicArea = deleteEntity('oft-thematic-areas');

// FLD Controllers
exports.getAllSectors = getAll('fld-sectors');
exports.getSectorById = getById('fld-sectors');
exports.createSector = create('fld-sectors');
exports.updateSector = update('fld-sectors');
exports.deleteSector = deleteEntity('fld-sectors');

exports.getAllFldThematicAreas = getAll('fld-thematic-areas');
exports.getFldThematicAreaById = getById('fld-thematic-areas');
exports.createFldThematicArea = create('fld-thematic-areas');
exports.updateFldThematicArea = update('fld-thematic-areas');
exports.deleteFldThematicArea = deleteEntity('fld-thematic-areas');

exports.getAllFldCategories = getAll('fld-categories');
exports.getFldCategoryById = getById('fld-categories');
exports.createFldCategory = create('fld-categories');
exports.updateFldCategory = update('fld-categories');
exports.deleteFldCategory = deleteEntity('fld-categories');

exports.getAllFldSubcategories = getAll('fld-subcategories');
exports.getFldSubcategoryById = getById('fld-subcategories');
exports.createFldSubcategory = create('fld-subcategories');
exports.updateFldSubcategory = update('fld-subcategories');
exports.deleteFldSubcategory = deleteEntity('fld-subcategories');

exports.getAllFldCrops = getAll('fld-crops');
exports.getFldCropById = getById('fld-crops');
exports.createFldCrop = create('fld-crops');
exports.updateFldCrop = update('fld-crops');
exports.deleteFldCrop = deleteEntity('fld-crops');

// FLD Activity Controllers
exports.getAllFldActivities = getAll('fld-activities');
exports.getFldActivityById = getById('fld-activities');
exports.createFldActivity = create('fld-activities');
exports.updateFldActivity = update('fld-activities');
exports.deleteFldActivity = deleteEntity('fld-activities');

// CFLD Controllers
exports.getAllCfldCrops = getAll('cfld-crops');
exports.getCfldCropById = getById('cfld-crops');
exports.createCfldCrop = create('cfld-crops');
exports.updateCfldCrop = update('cfld-crops');
exports.deleteCfldCrop = deleteEntity('cfld-crops');

// Hierarchical filtering endpoints
exports.getOftThematicAreasBySubject = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const data = await oftFldService.getOftThematicAreasBySubject(subjectId);
    res.json({
        success: true,
        data,
    });
});

exports.getFldThematicAreasBySector = asyncHandler(async (req, res) => {
    const { sectorId } = req.params;
    const data = await oftFldService.getFldThematicAreasBySector(sectorId);
    res.json({
        success: true,
        data,
    });
});

exports.getFldCategoriesBySector = asyncHandler(async (req, res) => {
    const { sectorId } = req.params;
    const data = await oftFldService.getFldCategoriesBySector(sectorId);
    res.json({
        success: true,
        data,
    });
});

exports.getFldSubcategoriesByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const data = await oftFldService.getFldSubcategoriesByCategory(categoryId);
    res.json({
        success: true,
        data,
    });
});

exports.getFldCropsBySubcategory = asyncHandler(async (req, res) => {
    const { subCategoryId } = req.params;
    const data = await oftFldService.getFldCropsBySubcategory(subCategoryId);
    res.json({
        success: true,
        data,
    });
});

exports.getCfldCropsBySeasonAndType = asyncHandler(async (req, res) => {
    const { seasonId, typeId } = req.params;
    const data = await oftFldService.getCfldCropsBySeasonAndType(seasonId, typeId);
    res.json({
        success: true,
        data,
    });
});

// Season Controllers
exports.getAllSeasons = getAll('seasons');
exports.getSeasonById = getById('seasons');
exports.createSeason = create('seasons');
exports.updateSeason = update('seasons');
exports.deleteSeason = deleteEntity('seasons');

// CropType Controllers
exports.getAllCropTypes = getAll('crop-types');
exports.getCropTypeById = getById('crop-types');
exports.createCropType = create('crop-types');
exports.updateCropType = update('crop-types');
exports.deleteCropType = deleteEntity('crop-types');

// Statistics endpoint
exports.getStats = asyncHandler(async (req, res) => {
    const stats = await oftFldService.getStats();
    res.json({
        success: true,
        data: stats,
    });
});
