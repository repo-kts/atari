const prisma = require('../../config/prisma.js');
const { normalizeListLimit, DEFAULT_MASTER_LIST_PAGE_SIZE } = require('../../constants/masterListPagination.js');

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

    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = normalizeListLimit(options.limit, DEFAULT_MASTER_LIST_PAGE_SIZE);
    const { search = '', sortBy = 'id', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const take = limit;

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
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
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
    
    // Validate ID
    if (id === undefined || id === null || id === '') {
        throw new Error(`Missing ID field: ${config.idField}`);
    }
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        throw new Error(`Invalid ID: ${id}. Expected a number.`);
    }

    return prisma[config.model].findUnique({
        where: { [config.idField]: parsedId },
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
/**
 * Check for dependent records before deletion
 */
const checkDependentRecords = async (entityType, config, id) => {
    // Check _count if available in includes
    if (config.includes && config.includes._count && config.includes._count.select) {
        // Properly structure _count query - Prisma expects _count: { select: {...} }
        const entity = await prisma[config.model].findUnique({
            where: { [config.idField]: id },
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
};

const deleteEntity = async (entityType, id) => {
    const config = ENTITY_CONFIG[entityType];
    if (!config) throw new Error(`Unknown entity type: ${entityType}`);
    
    // Validate ID
    if (id === undefined || id === null || id === '') {
        throw new Error(`Cannot delete ${entityType}: missing ID field`);
    }
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        throw new Error(`Cannot delete ${entityType}: invalid ID: ${id}`);
    }
    
    // Check for dependent records
    const dependentCheck = await checkDependentRecords(entityType, config, parsedId);
    if (dependentCheck.hasDependents) {
        const dependentNames = Object.keys(dependentCheck.counts).join(', ');
        throw new Error(`Cannot delete ${entityType}: has dependent records (${dependentNames})`);
    }

    try {
        return await prisma[config.model].delete({
            where: { [config.idField]: parsedId },
        });
    } catch (error) {
        // Handle foreign key constraint violations
        if (error.code === 'P2003') {
            throw new Error(`Cannot delete ${entityType}: has dependent records. Please try again or contact support.`);
        }
        // Handle record not found
        if (error.code === 'P2025') {
            throw new Error(`${entityType} not found`);
        }
        // Re-throw other errors
        throw error;
    }
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
