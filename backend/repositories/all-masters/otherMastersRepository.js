const prisma = require('../../config/prisma.js');

/**
 * Other Masters Repository
 * Optimized repository for Season, Sanctioned Post, and Year master data operations
 * Reusable pattern for simple master entities
 */

// Entity configuration mapping
const ENTITY_CONFIG = {
    'seasons': {
        model: 'season',
        idField: 'seasonId',
        nameField: 'seasonName',
        includes: {
            _count: {
                select: {
                    cfldCrops: true,
                    craCropingSystems: true,
                    craFarmingSystems: true,
                },
            },
        },
    },
    'sanctioned-posts': {
        model: 'sanctionedPost',
        idField: 'sanctionedPostId',
        nameField: 'postName',
        includes: {
            _count: {
                select: {
                    staff: true,
                },
            },
        },
    },
    'years': {
        model: 'yearMaster',
        idField: 'yearId',
        nameField: 'yearName',
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
        throw new Error(`Unknown entity type: ${entityName}`);
    }
    return config;
}

/**
 * Generic find all method with pagination, sorting and filtering
 */
const findAll = async (entityType, options = {}) => {
    const config = getEntityConfig(entityType);

    const { page = 1, limit = 100, search = '', sortBy = 'id', sortOrder = 'asc' } = options;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build filtering
    const where = {};
    if (search) {
        where[config.nameField] = {
            contains: search,
            mode: 'insensitive',
        };
    }

    // Build sorting
    let actualSortBy = sortBy;
    if (sortBy === 'id') actualSortBy = config.idField;
    if (sortBy === 'name') actualSortBy = config.nameField;

    try {
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

        return {
            data,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Generic find by ID
 */
const findById = async (entityType, id) => {
    const config = getEntityConfig(entityType);
    return prisma[config.model].findUnique({
        where: { [config.idField]: parseInt(id) },
        include: config.includes,
    });
};

/**
 * Generic create
 */
const create = async (entityType, data) => {
    const config = getEntityConfig(entityType);
    
    // Build sanitized data object with only allowed fields
    // For simple masters, we only want the name field
    const sanitizedData = {};
    
    // Only include the name field (these are simple master entities)
    if (data[config.nameField]) {
        sanitizedData[config.nameField] = data[config.nameField];
    }
    
    try {
        // Verify the model exists in Prisma client
        if (!prisma[config.model]) {
            throw new Error(`Prisma model '${config.model}' not found. Available models: ${Object.keys(prisma).filter(k => !k.startsWith('_') && typeof prisma[k] === 'object').join(', ')}`);
        }
        
        return await prisma[config.model].create({
            data: sanitizedData,
        });
    } catch (error) {
        // If it's a unique constraint error, provide better message
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'unknown field';
            const isNameField = field === config.nameField || 
                               field === config.nameField.replace(/([A-Z])/g, '_$1').toLowerCase() ||
                               field === 'post_name' && config.nameField === 'postName';
            
            if (isNameField) {
                const betterError = new Error(`${config.nameField} '${sanitizedData[config.nameField]}' already exists`);
                betterError.statusCode = 409;
                throw betterError;
            }
        }
        
        throw error;
    }
};

/**
 * Generic update
 */
const update = async (entityType, id, data) => {
    const config = getEntityConfig(entityType);
    return prisma[config.model].update({
        where: { [config.idField]: parseInt(id) },
        data,
    });
};

/**
 * Generic delete
 */
const deleteEntity = async (entityType, id) => {
    const config = getEntityConfig(entityType);
    return prisma[config.model].delete({
        where: { [config.idField]: parseInt(id) },
    });
};

/**
 * Check if name exists (for validation)
 */
const nameExists = async (entityType, name, excludeId = null) => {
    const config = getEntityConfig(entityType);

    const where = {
        [config.nameField]: {
            equals: name,
            mode: 'insensitive',
        },
    };

    if (excludeId) {
        where[config.idField] = { not: parseInt(excludeId) };
    }

    const count = await prisma[config.model].count({ where });
    return count > 0;
};

/**
 * Validate references (for entities with foreign keys)
 */
const validateReferences = async (entityType, data) => {
    // Other masters are simple entities with no foreign keys
    // This is a placeholder for future extensibility
    return true;
};

module.exports = {
    ENTITY_CONFIG,
    findAll,
    findById,
    create,
    update,
    deleteEntity,
    nameExists,
    validateReferences,
};
