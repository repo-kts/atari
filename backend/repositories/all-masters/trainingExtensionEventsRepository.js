const prisma = require('../../config/prisma.js');

/**
 * Training, Extension & Events Master Data Repository
 * Ultra-optimized repository for Training, Extension Activities, and Events master data CRUD operations
 */

// Entity configuration mapping
const ENTITY_CONFIG = {
    // Training Entities
    'training-types': {
        model: 'trainingType',
        idField: 'trainingTypeId',
        nameField: 'trainingTypeName',
        includes: {
            _count: {
                select: {
                    trainingAreas: true,
                },
            },
        },
    },
    'training-areas': {
        model: 'trainingArea',
        idField: 'trainingAreaId',
        nameField: 'trainingAreaName',
        includes: {
            trainingType: {
                select: {
                    trainingTypeId: true,
                    trainingTypeName: true,
                },
            },
            _count: {
                select: {
                    thematicAreas: true,
                },
            },
        },
    },
    'training-thematic-areas': {
        model: 'trainingThematicArea',
        idField: 'trainingThematicAreaId',
        nameField: 'trainingThematicAreaName',
        includes: {
            trainingArea: {
                select: {
                    trainingAreaId: true,
                    trainingAreaName: true,
                    trainingType: {
                        select: {
                            trainingTypeId: true,
                            trainingTypeName: true,
                        },
                    },
                },
            },
        },
    },

    // Extension Activity Entities
    'extension-activities': {
        model: 'extensionActivity',
        idField: 'extensionActivityId',
        nameField: 'extensionName',
        includes: {},
    },
    'other-extension-activities': {
        model: 'otherExtensionActivity',
        idField: 'otherExtensionActivityId',
        nameField: 'otherExtensionName',
        includes: {},
    },

    // Events Entity
    'events': {
        model: 'event',
        idField: 'eventId',
        nameField: 'eventName',
        includes: {},
    },
};

/**
 * Get entity configuration
 * @param {string} entityName - Entity name
 * @returns {object} Entity configuration
 */
function getEntityConfig(entityName) {
    const config = ENTITY_CONFIG[entityName];
    if (!config) {
        throw new Error(`Invalid entity name: ${entityName}`);
    }
    return config;
}

/**
 * Find all entities with pagination, filtering, and sorting
 * @param {string} entityName - Entity name
 * @param {object} options - Query options
 * @returns {Promise<{data: Array, total: number}>}
 */
async function findAll(entityName, options = {}) {
    const config = getEntityConfig(entityName);
    const {
        page = 1,
        limit = 100,
        search = '',
        sortBy,
        sortOrder = 'asc',
        filters = {},
    } = options;

    const actualSortBy = sortBy || config.idField;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    // Build where clause
    const where = { ...filters };

    // Add search filter
    if (search) {
        where[config.nameField] = {
            contains: search,
            mode: 'insensitive',
        };
    }

    // Execute queries in parallel for better performance
    const [data, total] = await Promise.all([
        prisma[config.model].findMany({
            where,
            include: config.includes,
            skip,
            take,
            orderBy: {
                [actualSortBy]: sortOrder,
            },
        }),
        prisma[config.model].count({ where }),
    ]);

    return { data, total };
}

/**
 * Find entity by ID
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<object|null>}
 */
async function findById(entityName, id) {
    const config = getEntityConfig(entityName);

    return await prisma[config.model].findUnique({
        where: { [config.idField]: parseInt(id) },
        include: config.includes,
    });
}

/**
 * Create new entity
 * @param {string} entityName - Entity name
 * @param {object} data - Entity data
 * @returns {Promise<object>}
 */
async function create(entityName, data) {
    const config = getEntityConfig(entityName);

    return await prisma[config.model].create({
        data,
        include: config.includes,
    });
}

/**
 * Update entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @param {object} data - Updated data
 * @returns {Promise<object>}
 */
async function update(entityName, id, data) {
    const config = getEntityConfig(entityName);

    return await prisma[config.model].update({
        where: { [config.idField]: parseInt(id) },
        data,
        include: config.includes,
    });
}

/**
 * Delete entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<object>}
 */
async function deleteEntity(entityName, id) {
    const config = getEntityConfig(entityName);

    return await prisma[config.model].delete({
        where: { [config.idField]: parseInt(id) },
    });
}

/**
 * Find training areas by training type ID
 * @param {number} trainingTypeId - Training Type ID
 * @returns {Promise<Array>}
 */
async function findTrainingAreasByType(trainingTypeId) {
    return await prisma.trainingArea.findMany({
        where: { trainingTypeId: parseInt(trainingTypeId) },
        include: ENTITY_CONFIG['training-areas'].includes,
        orderBy: { trainingAreaName: 'asc' },
    });
}

/**
 * Find training thematic areas by training area ID
 * @param {number} trainingAreaId - Training Area ID
 * @returns {Promise<Array>}
 */
async function findTrainingThematicAreasByArea(trainingAreaId) {
    return await prisma.trainingThematicArea.findMany({
        where: { trainingAreaId: parseInt(trainingAreaId) },
        include: ENTITY_CONFIG['training-thematic-areas'].includes,
        orderBy: { trainingThematicAreaName: 'asc' },
    });
}

/**
 * Check if entity name exists (for duplicate validation)
 * @param {string} entityName - Entity name
 * @param {string} name - Name to check
 * @param {number} excludeId - ID to exclude from check (for updates)
 * @param {object} additionalFilters - Additional filters
 * @returns {Promise<boolean>}
 */
async function nameExists(entityName, name, excludeId = null, additionalFilters = {}) {
    const config = getEntityConfig(entityName);

    const where = {
        [config.nameField]: name,
        ...additionalFilters,
    };

    if (excludeId) {
        where[config.idField] = {
            not: parseInt(excludeId),
        };
    }

    const count = await prisma[config.model].count({ where });
    return count > 0;
}

/**
 * Validate foreign key references
 * @param {string} entityName - Entity name
 * @param {object} data - Data to validate
 * @returns {Promise<boolean>}
 */
async function validateReferences(entityName, data) {
    switch (entityName) {
        case 'training-areas':
            if (data.trainingTypeId) {
                const trainingType = await prisma.trainingType.findUnique({
                    where: { trainingTypeId: parseInt(data.trainingTypeId) },
                });
                return !!trainingType;
            }
            break;

        case 'training-thematic-areas':
            if (data.trainingAreaId) {
                const trainingArea = await prisma.trainingArea.findUnique({
                    where: { trainingAreaId: parseInt(data.trainingAreaId) },
                });
                return !!trainingArea;
            }
            break;

        default:
            return true;
    }

    return true;
}

/**
 * Get statistics for dashboard
 * @returns {Promise<object>}
 */
async function getStats() {
    const [
        trainingTypes,
        trainingAreas,
        trainingThematicAreas,
        extensionActivities,
        otherExtensionActivities,
        events,
    ] = await Promise.all([
        prisma.trainingType.count(),
        prisma.trainingArea.count(),
        prisma.trainingThematicArea.count(),
        prisma.extensionActivity.count(),
        prisma.otherExtensionActivity.count(),
        prisma.event.count(),
    ]);

    return {
        training: {
            types: trainingTypes,
            areas: trainingAreas,
            thematicAreas: trainingThematicAreas,
        },
        extension: {
            activities: extensionActivities,
            otherActivities: otherExtensionActivities,
        },
        events: {
            total: events,
        },
    };
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteEntity,
    findTrainingAreasByType,
    findTrainingThematicAreasByArea,
    nameExists,
    validateReferences,
    getStats,
};
