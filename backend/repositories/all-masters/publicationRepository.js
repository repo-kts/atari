const prisma = require('../../config/prisma.js');

/**
 * Publication Master Repository
 * Optimized repository for Publication master data operations
 */

// Entity configuration mapping
const ENTITY_CONFIG = {
    'publication-items': {
        model: 'publication',
        idField: 'publicationId',
        nameField: 'publicationName',
        tableName: 'publication',
        idColumn: 'publication_id',
        includes: {},
    },
};

/**
 * Generic find all method with pagination, sorting and filtering
 */
const findAll = async (entityType, options = {}) => {
    const config = ENTITY_CONFIG[entityType];
    if (!config) throw new Error(`Unknown entity type: ${entityType}`);

    const { page = 1, limit = 10, search = '', sortBy = 'id', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build filtering
    const where = {};
    if (search) {
        where[config.nameField] = {
            contains: search,
            mode: 'insensitive', // Case-insensitive search
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
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Generic find by ID
 */
const findById = async (entityType, id) => {
    const config = ENTITY_CONFIG[entityType];
    if (!config) throw new Error(`Unknown entity type: ${entityType}`);

    return prisma[config.model].findUnique({
        where: { [config.idField]: parseInt(id) },
        include: config.includes,
    });
};

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
 * Sanitize data: only keep the name field (simple master entity)
 */
function sanitizeData(config, data) {
    const sanitized = {};
    if (data[config.nameField]) {
        sanitized[config.nameField] = typeof data[config.nameField] === 'string'
            ? data[config.nameField].trim()
            : data[config.nameField];
    }
    return sanitized;
}

/**
 * Generic create - only send scalar fields Prisma expects
 */
const create = async (entityType, data) => {
    const config = ENTITY_CONFIG[entityType];
    if (!config) throw new Error(`Unknown entity type: ${entityType}`);

    const sanitized = sanitizeData(config, data);

    try {
        return await prisma[config.model].create({
            data: sanitized,
        });
    } catch (error) {
        if (error.code === 'P2011' || error.code === 'P2002' ||
            (error.message && error.message.includes('Null constraint violation'))) {
            console.log(`Attempting sequence fix for ${config.model} after error: ${error.message}`);
            const fixed = await fixSequence(config);
            if (fixed !== null) {
                return await prisma[config.model].create({
                    data: sanitized,
                });
            }
        }
        throw error;
    }
};

/**
 * Generic update
 */
const update = async (entityType, id, data) => {
    const config = ENTITY_CONFIG[entityType];
    if (!config) throw new Error(`Unknown entity type: ${entityType}`);

    const sanitized = sanitizeData(config, data);

    return prisma[config.model].update({
        where: { [config.idField]: parseInt(id) },
        data: sanitized,
    });
};

/**
 * Generic delete
 */
const deleteEntity = async (entityType, id) => {
    const config = ENTITY_CONFIG[entityType];
    if (!config) throw new Error(`Unknown entity type: ${entityType}`);

    return prisma[config.model].delete({
        where: { [config.idField]: parseInt(id) },
    });
};

/**
 * Check if name exists (for validation)
 */
const nameExists = async (entityType, name, excludeId = null) => {
    const config = ENTITY_CONFIG[entityType];
    if (!config) throw new Error(`Unknown entity type: ${entityType}`);

    const where = {
        [config.nameField]: {
            equals: name,
            mode: 'insensitive'
        }
    };

    if (excludeId) {
        where[config.idField] = { not: parseInt(excludeId) };
    }

    const count = await prisma[config.model].count({ where });
    return count > 0;
};

/**
 * Get statistics
 */
const getStats = async () => {
    const [
        items // Publication items
    ] = await Promise.all([
        prisma.publication.count() // Correct model name is 'publication' (lowercase usually via client, but check schema map)
        // Actually prisma client usually uses model name from schema.prisma (PascalCase 'Publication' or mapped?)
        // The ENTITY_CONFIG uses 'publication' (lowercase).
        // Standard prisma client instance usually has properties in lowercase/camelCase for models.
        // Schema says: model Publication. So it should be prisma.publication.
    ]);

    return {
        publications: {
            items
        }
    };
};

module.exports = {
    ENTITY_CONFIG,
    findAll,
    findById,
    create,
    update,
    deleteEntity,
    nameExists,
    getStats
};
