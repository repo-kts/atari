const trainingExtensionEventsService = require('../../services/all-masters/trainingExtensionEventsService.js');

/**
 * Training, Extension & Events Master Data Controller
 * HTTP request handlers for Training, Extension Activities, and Events master data operations
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

        const result = await trainingExtensionEventsService.getAll(entityName, options);
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
        const data = await trainingExtensionEventsService.getById(entityName, id);
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
        const data = await trainingExtensionEventsService.create(entityName, req.body);
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
        const data = await trainingExtensionEventsService.update(entityName, id, req.body);
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
        await trainingExtensionEventsService.delete(entityName, id);
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

// Training Type Controllers
exports.getAllTrainingTypes = getAll('training-types');
exports.getTrainingTypeById = getById('training-types');
exports.createTrainingType = create('training-types');
exports.updateTrainingType = update('training-types');
exports.deleteTrainingType = deleteEntity('training-types');

// Training Area Controllers
exports.getAllTrainingAreas = getAll('training-areas');
exports.getTrainingAreaById = getById('training-areas');
exports.createTrainingArea = create('training-areas');
exports.updateTrainingArea = update('training-areas');
exports.deleteTrainingArea = deleteEntity('training-areas');

// Training Thematic Area Controllers
exports.getAllTrainingThematicAreas = getAll('training-thematic-areas');
exports.getTrainingThematicAreaById = getById('training-thematic-areas');
exports.createTrainingThematicArea = create('training-thematic-areas');
exports.updateTrainingThematicArea = update('training-thematic-areas');
exports.deleteTrainingThematicArea = deleteEntity('training-thematic-areas');

// Extension Activity Controllers
exports.getAllExtensionActivities = getAll('extension-activities');
exports.getExtensionActivityById = getById('extension-activities');
exports.createExtensionActivity = create('extension-activities');
exports.updateExtensionActivity = update('extension-activities');
exports.deleteExtensionActivity = deleteEntity('extension-activities');

// Other Extension Activity Controllers
exports.getAllOtherExtensionActivities = getAll('other-extension-activities');
exports.getOtherExtensionActivityById = getById('other-extension-activities');
exports.createOtherExtensionActivity = create('other-extension-activities');
exports.updateOtherExtensionActivity = update('other-extension-activities');
exports.deleteOtherExtensionActivity = deleteEntity('other-extension-activities');

// Event Controllers
exports.getAllEvents = getAll('events');
exports.getEventById = getById('events');
exports.createEvent = create('events');
exports.updateEvent = update('events');
exports.deleteEvent = deleteEntity('events');

// Hierarchical filtering endpoints
exports.getTrainingAreasByType = async (req, res) => {
    try {
        const { trainingTypeId } = req.params;
        const data = await trainingExtensionEventsService.getTrainingAreasByType(trainingTypeId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching training areas by type:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getTrainingThematicAreasByArea = async (req, res) => {
    try {
        const { trainingAreaId } = req.params;
        const data = await trainingExtensionEventsService.getTrainingThematicAreasByArea(trainingAreaId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching training thematic areas by area:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Statistics endpoint
exports.getStats = async (req, res) => {
    try {
        const stats = await trainingExtensionEventsService.getStats();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching Training/Extension/Events stats:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
