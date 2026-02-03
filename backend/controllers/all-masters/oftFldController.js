const oftFldService = require('../../services/all-masters/oftFldService.js');

/**
 * OFT & FLD Master Data Controller
 * HTTP request handlers for OFT, FLD, and CFLD master data operations
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
    } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        res.status(500).json({
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
        const { id } = req.params;
        const data = await oftFldService.getById(entityName, id);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(`Error fetching ${entityName} by ID:`, error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
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
        const data = await oftFldService.create(entityName, req.body);
        res.status(201).json({
            success: true,
            data,
            message: `${entityName} created successfully`,
        });
    } catch (error) {
        console.error(`Error creating ${entityName}:`, error);
        const statusCode = error.message.includes('already exists') ? 409 : 400;
        res.status(statusCode).json({
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
        const { id } = req.params;
        const data = await oftFldService.update(entityName, id, req.body);
        res.json({
            success: true,
            data,
            message: `${entityName} updated successfully`,
        });
    } catch (error) {
        console.error(`Error updating ${entityName}:`, error);
        const statusCode = error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
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
        const { id } = req.params;
        await oftFldService.delete(entityName, id);
        res.json({
            success: true,
            message: `${entityName} deleted successfully`,
        });
    } catch (error) {
        console.error(`Error deleting ${entityName}:`, error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
};

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

// CFLD Controllers
exports.getAllCfldCrops = getAll('cfld-crops');
exports.getCfldCropById = getById('cfld-crops');
exports.createCfldCrop = create('cfld-crops');
exports.updateCfldCrop = update('cfld-crops');
exports.deleteCfldCrop = deleteEntity('cfld-crops');

// Hierarchical filtering endpoints
exports.getOftThematicAreasBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const data = await oftFldService.getOftThematicAreasBySubject(subjectId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching OFT thematic areas by subject:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getFldThematicAreasBySector = async (req, res) => {
    try {
        const { sectorId } = req.params;
        const data = await oftFldService.getFldThematicAreasBySector(sectorId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching FLD thematic areas by sector:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getFldCategoriesBySector = async (req, res) => {
    try {
        const { sectorId } = req.params;
        const data = await oftFldService.getFldCategoriesBySector(sectorId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching FLD categories by sector:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getFldSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const data = await oftFldService.getFldSubcategoriesByCategory(categoryId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching FLD subcategories by category:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getFldCropsBySubcategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        const data = await oftFldService.getFldCropsBySubcategory(subCategoryId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching FLD crops by subcategory:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getCfldCropsBySeasonAndType = async (req, res) => {
    try {
        const { seasonId, typeId } = req.params;
        const data = await oftFldService.getCfldCropsBySeasonAndType(seasonId, typeId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching CFLD crops by season and type:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

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
exports.getStats = async (req, res) => {
    try {
        const stats = await oftFldService.getStats();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching OFT/FLD stats:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
