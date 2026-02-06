const publicationService = require('../../services/all-masters/publicationService.js');

/**
 * Publication Master Controller
 * Request handlers for Publication master data
 */

// Helper: Generic response handler
const handleResponse = async (res, promise) => {
    try {
        const result = await promise;
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
};

// Helper: Generic getAll handler
const getAll = (entityType) => async (req, res) => {
    try {
        const result = await publicationService.getAll(entityType, req.query);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
};

// ============================================
// Publication Routes Handlers
// ============================================

exports.getAllPublicationItems = getAll('publication-items');

exports.getPublicationItemById = (req, res) =>
    handleResponse(res, publicationService.getById('publication-items', req.params.id));

exports.createPublicationItem = (req, res) =>
    handleResponse(res, publicationService.createPublicationItem(req.body));

exports.updatePublicationItem = (req, res) =>
    handleResponse(res, publicationService.updatePublicationItem(req.params.id, req.body));

exports.deletePublicationItem = (req, res) =>
    handleResponse(res, publicationService.deleteEntity('publication-items', req.params.id));

// ============================================
// Statistics
// ============================================

exports.getStats = (req, res) =>
    handleResponse(res, publicationService.getStats());
