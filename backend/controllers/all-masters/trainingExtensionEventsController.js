const trainingExtensionEventsService = require('../../services/all-masters/trainingExtensionEventsService.js');
const { asyncHandler } = require('../../utils/errorHandler');

/**
 * Training, Extension & Events Master Data Controller
 * HTTP request handlers for Training, Extension Activities, and Events master data operations
 */

/**
 * Generic handler to get all entities
 */
const getAll = (entityName) => asyncHandler(async (req, res) => {
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
});

/**
 * Generic handler to get entity by ID
 */
const getById = (entityName) => asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await trainingExtensionEventsService.getById(entityName, id);
    res.json({
        success: true,
        data,
    });
});

/**
 * Generic handler to create entity
 */
const create = (entityName) => asyncHandler(async (req, res) => {
    const data = await trainingExtensionEventsService.create(entityName, req.body);
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
    const data = await trainingExtensionEventsService.update(entityName, id, req.body);
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
    await trainingExtensionEventsService.delete(entityName, id);
    res.json({
        success: true,
        message: `${entityName} deleted successfully`,
    });
});

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
exports.getTrainingAreasByType = asyncHandler(async (req, res) => {
    const { trainingTypeId } = req.params;
    const data = await trainingExtensionEventsService.getTrainingAreasByType(trainingTypeId);
    res.json({
        success: true,
        data,
    });
});

exports.getTrainingThematicAreasByArea = asyncHandler(async (req, res) => {
    const { trainingAreaId } = req.params;
    const data = await trainingExtensionEventsService.getTrainingThematicAreasByArea(trainingAreaId);
    res.json({
        success: true,
        data,
    });
});

// Statistics endpoint
exports.getStats = asyncHandler(async (req, res) => {
    const stats = await trainingExtensionEventsService.getStats();
    res.json({
        success: true,
        data: stats,
    });
});
