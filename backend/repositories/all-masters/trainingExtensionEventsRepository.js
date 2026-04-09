const prisma = require('../../config/prisma.js');
const { normalizeListLimit, DEFAULT_MASTER_LIST_PAGE_SIZE } = require('../../constants/masterListPagination.js');
const { ValidationError, NotFoundError, ConflictError, translatePrismaError } = require('../../utils/errorHandler');

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
        requiredFields: ['trainingTypeName'],
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
        requiredFields: ['trainingTypeId', 'trainingAreaName'],
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
        requiredFields: ['trainingAreaId', 'trainingThematicAreaName'],
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
        requiredFields: ['extensionName'],
        includes: {},
    },
    'other-extension-activities': {
        model: 'otherExtensionActivity',
        idField: 'otherExtensionActivityId',
        nameField: 'otherExtensionName',
        tableName: 'other_extension_activity',
        idColumn: 'other_extension_activity_id',
        requiredFields: ['otherExtensionName'],
        includes: {},
    },

    // Events Entity
    'events': {
        model: 'event',
        idField: 'eventId',
        nameField: 'eventName',
        tableName: 'event',
        idColumn: 'event_id',
        requiredFields: ['eventName'],
        includes: {},
    },
};

/**
 * Get entity configuration
 * @param {string} entityName - Entity name
 * @returns {object} Entity configuration
 * @throws {ValidationError} If entity name is invalid
 */
function getEntityConfig(entityName) {
    if (!entityName || typeof entityName !== 'string') {
        throw new ValidationError('Entity name is required and must be a string');
    }

    const config = ENTITY_CONFIG[entityName];
    if (!config) {
        throw new ValidationError(`Invalid entity name: ${entityName}`);
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
        search = '',
        sortBy,
        sortOrder = 'asc',
        filters = {},
    } = options;

    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = normalizeListLimit(options.limit, DEFAULT_MASTER_LIST_PAGE_SIZE);
    const actualSortBy = sortBy || config.idField;
    const skip = (page - 1) * limit;
    const take = limit;

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

    return { data, total, page, limit: take };
}

/**
 * Find entity by ID
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<object>}
 * @throws {ValidationError} If ID is invalid
 * @throws {NotFoundError} If entity not found
 */
async function findById(entityName, id) {
    const config = getEntityConfig(entityName);

    // Validate ID
    if (id === undefined || id === null || id === '') {
        throw new ValidationError(`Missing ID field: ${config.idField}`, config.idField);
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError(`Invalid ID: ${id}. Expected a positive number.`, config.idField);
    }

    try {
        const entity = await prisma[config.model].findUnique({
            where: { [config.idField]: parsedId },
            include: config.includes,
        });

        if (!entity) {
            throw new NotFoundError(`${entityName} with ID ${parsedId}`);
        }

        return entity;
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ValidationError) {
            throw error;
        }
        throw translatePrismaError(error, entityName, 'findById');
    }
}

/**
 * Sanitize data: remove nested objects, _count, timestamps, and the ID field.
 * Only keep scalar values Prisma can accept.
 * Master data entities don't have kvkId, so exclude it.
 * @param {object} config - Entity configuration
 * @param {object} data - Data to sanitize
 * @returns {object} Sanitized data
 * @throws {ValidationError} If required fields are missing
 */
function sanitizeData(config, data) {
    if (!data || typeof data !== 'object') {
        throw new ValidationError('Data must be a non-null object');
    }

    const sanitized = {};
    // Fields to exclude for master data entities
    const excludeFields = ['kvkId', 'kvk_id'];

    // Validate all required fields (including foreign keys and name field)
    if (config.requiredFields && Array.isArray(config.requiredFields)) {
        for (const field of config.requiredFields) {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                throw new ValidationError(`${field} is required`, field);
            }
        }
    } else {
        // Fallback: Validate required name field if requiredFields not specified
        if (config.nameField && !data[config.nameField]) {
            throw new ValidationError(`${config.nameField} is required`, config.nameField);
        }
    }

    for (const [key, value] of Object.entries(data)) {
        if (key === config.idField || key === '_count' || key === 'id' || key === '_id') continue;
        if (key === 'createdAt' || key === 'updatedAt') continue;
        if (excludeFields.includes(key)) continue; // Exclude kvkId for master data entities
        if (value !== null && typeof value === 'object') continue;
        if (value === undefined) continue;

        // Skip empty strings for ID fields (they shouldn't be in the payload)
        if (key.endsWith('Id') && (value === null || value === '' || value === undefined)) {
            continue;
        }

        // Validate and sanitize name field
        if (key === config.nameField) {
            const trimmed = typeof value === 'string' ? value.trim() : String(value);
            if (!trimmed || trimmed.length === 0) {
                throw new ValidationError(`${config.nameField} cannot be empty`, config.nameField);
            }
            if (trimmed.length > 255) {
                throw new ValidationError(`${config.nameField} must be less than 255 characters`, config.nameField);
            }
            sanitized[key] = trimmed;
        } else if (key.endsWith('Id') && value !== null) {
            const parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed <= 0) {
                throw new ValidationError(`Invalid ${key}: must be a positive number`, key);
            }
            sanitized[key] = parsed;
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
 * @throws {ValidationError} If validation fails
 * @throws {ConflictError} If duplicate exists
 */
async function create(entityName, data) {
    const config = getEntityConfig(entityName);

    if (!data || typeof data !== 'object') {
        throw new ValidationError('Data is required and must be an object');
    }

    const sanitized = sanitizeData(config, data);

    try {
        return await prisma[config.model].create({
            data: sanitized,
            include: config.includes,
        });
    } catch (error) {
        // Handle sequence issues
        if (error.code === 'P2011' || error.code === 'P2002' ||
            (error.message && error.message.includes('Null constraint violation'))) {
            console.log(`Attempting sequence fix for ${config.model} after error: ${error.message}`);
            try {
                const fixed = await fixSequence(config);
                if (fixed !== null) {
                    return await prisma[config.model].create({
                        data: sanitized,
                        include: config.includes,
                    });
                }
            } catch (retryError) {
                // If retry fails, translate the original error
                throw translatePrismaError(error, entityName, 'create');
            }
        }

        // Translate Prisma errors to user-friendly errors
        throw translatePrismaError(error, entityName, 'create');
    }
}

/**
 * Update entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @param {object} data - Updated data
 * @returns {Promise<object>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If entity not found
 * @throws {ConflictError} If duplicate exists
 */
async function update(entityName, id, data) {
    const config = getEntityConfig(entityName);

    // Validate ID
    if (id === undefined || id === null || id === '') {
        throw new ValidationError(`Missing ID field: ${config.idField}`, config.idField);
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError(`Invalid ID: ${id}. Expected a positive number.`, config.idField);
    }

    if (!data || typeof data !== 'object') {
        throw new ValidationError('Data is required and must be an object');
    }

    // Check if entity exists before updating
    const existing = await prisma[config.model].findUnique({
        where: { [config.idField]: parsedId },
    });

    if (!existing) {
        throw new NotFoundError(`${entityName} with ID ${parsedId}`);
    }

    const sanitized = sanitizeData(config, data);

    try {
        return await prisma[config.model].update({
            where: { [config.idField]: parsedId },
            data: sanitized,
            include: config.includes,
        });
    } catch (error) {
        throw translatePrismaError(error, entityName, 'update');
    }
}

/**
 * Check for dependent records before deletion
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<object>} Dependent records info
 */
async function checkDependents(entityName, id) {
    const config = getEntityConfig(entityName);
    const parsedId = parseInt(id);

    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError('Invalid ID for checking dependents', config.idField);
    }

    // Check _count if available in includes
    if (config.includes && config.includes._count && config.includes._count.select) {
        // Properly structure _count query - Prisma expects _count: { select: {...} }
        const entity = await prisma[config.model].findUnique({
            where: { [config.idField]: parsedId },
            select: {
                _count: {
                    select: config.includes._count.select
                }
            },
        });

        if (entity && entity._count) {
            const dependentCounts = Object.entries(entity._count)
                .filter(([_, count]) => count > 0);

            if (dependentCounts.length > 0) {
                return {
                    hasDependents: true,
                    counts: Object.fromEntries(dependentCounts),
                };
            }
        }
    }

    return { hasDependents: false };
}

/**
 * Delete entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<object>}
 * @throws {ValidationError} If ID is invalid
 * @throws {NotFoundError} If entity not found
 * @throws {ConflictError} If entity has dependent records
 */
async function deleteEntity(entityName, id) {
    const config = getEntityConfig(entityName);

    // Validate ID
    if (id === undefined || id === null || id === '') {
        throw new ValidationError(`Cannot delete ${entityName}: missing ID field`, config.idField);
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError(`Cannot delete ${entityName}: invalid ID: ${id}`, config.idField);
    }

    // Check if entity exists before deleting
    const existing = await prisma[config.model].findUnique({
        where: { [config.idField]: parsedId },
    });

    if (!existing) {
        throw new NotFoundError(`${entityName} with ID ${parsedId}`);
    }

    // Check for dependent records
    const dependents = await checkDependents(entityName, parsedId);
    if (dependents.hasDependents) {
        const dependentTypes = Object.keys(dependents.counts).join(', ');
        throw new ConflictError(
            `Cannot delete ${entityName}: has dependent records (${dependentTypes}). Please remove dependent records first.`
        );
    }

    try {
        return await prisma[config.model].delete({
            where: { [config.idField]: parsedId },
        });
    } catch (error) {
        throw translatePrismaError(error, entityName, 'delete');
    }
}

/**
 * Find training areas by training type ID
 * @param {number} trainingTypeId - Training Type ID
 * @returns {Promise<Array>}
 * @throws {ValidationError} If trainingTypeId is invalid
 */
async function findTrainingAreasByType(trainingTypeId) {
    if (!trainingTypeId) {
        throw new ValidationError('Training Type ID is required', 'trainingTypeId');
    }

    const parsedId = parseInt(trainingTypeId);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError('Invalid training type ID: must be a positive number', 'trainingTypeId');
    }

    try {
        return await prisma.trainingArea.findMany({
            where: { trainingTypeId: parsedId },
            include: ENTITY_CONFIG['training-areas'].includes,
            orderBy: { trainingAreaName: 'asc' },
        });
    } catch (error) {
        throw translatePrismaError(error, 'Training Area', 'findByType');
    }
}

/**
 * Find training thematic areas by training area ID
 * @param {number} trainingAreaId - Training Area ID
 * @returns {Promise<Array>}
 * @throws {ValidationError} If trainingAreaId is invalid
 */
async function findTrainingThematicAreasByArea(trainingAreaId) {
    if (!trainingAreaId) {
        throw new ValidationError('Training Area ID is required', 'trainingAreaId');
    }

    const parsedId = parseInt(trainingAreaId);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError('Invalid training area ID: must be a positive number', 'trainingAreaId');
    }

    try {
        return await prisma.trainingThematicArea.findMany({
            where: { trainingAreaId: parsedId },
            include: ENTITY_CONFIG['training-thematic-areas'].includes,
            orderBy: { trainingThematicAreaName: 'asc' },
        });
    } catch (error) {
        throw translatePrismaError(error, 'Training Thematic Area', 'findByArea');
    }
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
 * @throws {ValidationError} If reference is invalid
 */
async function validateReferences(entityName, data) {
    if (!data || typeof data !== 'object') {
        return true; // Empty data is valid, validation happens elsewhere
    }

    try {
        switch (entityName) {
            case 'training-areas':
                if (data.trainingTypeId) {
                    const parsedId = parseInt(data.trainingTypeId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid training type ID', 'trainingTypeId');
                    }
                    const trainingType = await prisma.trainingType.findUnique({
                        where: { trainingTypeId: parsedId },
                    });
                    if (!trainingType) {
                        throw new ValidationError(`Training Type with ID ${parsedId} not found`, 'trainingTypeId');
                    }
                }
                break;

            case 'training-thematic-areas':
                if (data.trainingAreaId) {
                    const parsedId = parseInt(data.trainingAreaId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid training area ID', 'trainingAreaId');
                    }
                    const trainingArea = await prisma.trainingArea.findUnique({
                        where: { trainingAreaId: parsedId },
                    });
                    if (!trainingArea) {
                        throw new ValidationError(`Training Area with ID ${parsedId} not found`, 'trainingAreaId');
                    }
                }
                break;

            default:
                return true;
        }

        return true;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw translatePrismaError(error, entityName, 'validateReferences');
    }
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
    getEntityConfig,
};
