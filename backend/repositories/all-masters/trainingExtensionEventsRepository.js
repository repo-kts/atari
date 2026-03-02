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
        tableName: 'training_type',
        idColumn: 'training_type_id',
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
        tableName: 'training_area',
        idColumn: 'training_area_id',
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
        tableName: 'training_thematic_area',
        idColumn: 'training_thematic_area_id',
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
        tableName: 'extension_activity',
        idColumn: 'extension_activity_id',
        includes: {},
    },
    'other-extension-activities': {
        model: 'otherExtensionActivity',
        idField: 'otherExtensionActivityId',
        nameField: 'otherExtensionName',
        tableName: 'other_extension_activity',
        idColumn: 'other_extension_activity_id',
        includes: {},
    },

    // Events Entity
    'events': {
        model: 'event',
        idField: 'eventId',
        nameField: 'eventName',
        tableName: 'event',
        idColumn: 'event_id',
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
 * Sanitize data: remove nested objects, _count, timestamps, and the ID field.
 * Only keep scalar values Prisma can accept.
 */
function sanitizeData(config, data) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        // Skip ID field, _count, timestamps, and nested objects
        if (key === config.idField || key === '_count' || key === 'id' || key === '_id') continue;
        if (key === 'createdAt' || key === 'updatedAt') continue;
        if (value !== null && typeof value === 'object') continue;
        if (value === undefined) continue;
        // Parse FK fields as integers
        if (key.endsWith('Id') && value !== null) {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed)) sanitized[key] = parsed;
        } else {
            sanitized[key] = typeof value === 'string' ? value.trim() : value;
        }
    }
    return sanitized;
}

/**
 * Fix PostgreSQL sequence for auto-increment columns that may be out of sync.
 */
async function fixSequence(config) {
    try {
        const maxIdResult = await prisma.$queryRawUnsafe(
            `SELECT COALESCE(MAX(${config.idColumn}), 0) as max_id FROM ${config.tableName}`
        );
        const maxId = Number(maxIdResult[0]?.max_id || 0);
        const nextId = maxId > 0 ? maxId + 1 : 1;
        const seqName = `${config.tableName}_${config.idColumn}_seq`;
        await prisma.$executeRawUnsafe(
            `SELECT setval('"${seqName}"', ${nextId}, false)`
        );
        return nextId;
    } catch (err) {
        console.error(`Error fixing sequence for ${config.model}:`, err.message);
        return null;
    }
}

/**
 * Create new entity
 * @param {string} entityName - Entity name
 * @param {object} data - Entity data
 * @returns {Promise<object>}
 */
async function create(entityName, data) {
    const config = getEntityConfig(entityName);
    const sanitized = sanitizeData(config, data);

    try {
        return await prisma[config.model].create({
            data: sanitized,
            include: config.includes,
        });
    } catch (error) {
        if (error.code === 'P2011' || error.code === 'P2002' ||
            (error.message && error.message.includes('Null constraint violation'))) {
            console.log(`Attempting sequence fix for ${config.model} after error: ${error.message}`);
            const fixed = await fixSequence(config);
            if (fixed !== null) {
                return await prisma[config.model].create({
                    data: sanitized,
                    include: config.includes,
                });
            }
        }
        throw error;
    }
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
    const sanitized = sanitizeData(config, data);

    return await prisma[config.model].update({
        where: { [config.idField]: parseInt(id) },
        data: sanitized,
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
