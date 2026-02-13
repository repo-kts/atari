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
