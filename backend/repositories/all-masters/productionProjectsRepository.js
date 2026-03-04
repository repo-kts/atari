const prisma = require('../../config/prisma.js');

/**
 * Production & Projects Master Data Repository
 * Ultra-optimized repository for Production and Projects master data CRUD operations
 */

// Entity configuration mapping
const ENTITY_CONFIG = {
    // Product Entities
    'product-categories': {
        model: 'productCategory',
        idField: 'productCategoryId',
        nameField: 'productCategoryName',
        writableFields: ['productCategoryName'],
        tableName: 'product_category',
        idColumn: 'product_category_id',
        includes: {
            _count: {
                select: {
                    productTypes: true,
                    products: true,
                },
            },
        },
        dependencyLabels: {
            productTypes: 'product types',
            products: 'products',
        },
    },
    'product-types': {
        model: 'productType',
        idField: 'productTypeId',
        nameField: 'productCategoryType',
        writableFields: ['productCategoryType', 'productCategoryId'],
        tableName: 'product_type',
        idColumn: 'product_type_id',
        includes: {
            productCategory: {
                select: {
                    productCategoryId: true,
                    productCategoryName: true,
                },
            },
            _count: {
                select: {
                    products: true,
                },
            },
        },
        dependencyLabels: {
            products: 'products',
        },
    },
    'products': {
        model: 'product',
        idField: 'productId',
        nameField: 'productName',
        writableFields: ['productName', 'productCategoryId', 'productTypeId'],
        tableName: 'product',
        idColumn: 'product_id',
        includes: {
            productCategory: {
                select: {
                    productCategoryId: true,
                    productCategoryName: true,
                },
            },
            productType: {
                select: {
                    productTypeId: true,
                    productCategoryType: true,
                },
            },
        },
    },

    // CRA Entities
    'cra-cropping-systems': {
        model: 'craCropingSystem',
        idField: 'craCropingSystemId',
        nameField: 'cropName',
        writableFields: ['cropName', 'seasonId'],
        tableName: 'cra_croping_system',
        idColumn: 'cra_croping_system_id',
        includes: {
            season: {
                select: {
                    seasonId: true,
                    seasonName: true,
                },
            },
        },
    },
    'cra-farming-systems': {
        model: 'craFarmingSystem',
        idField: 'craFarmingSystemId',
        nameField: 'farmingSystemName',
        writableFields: ['farmingSystemName', 'seasonId'],
        tableName: 'cra_farming_system',
        idColumn: 'cra_farming_system_id',
        includes: {
            season: {
                select: {
                    seasonId: true,
                    seasonName: true,
                },
            },
        },
    },

    // ARYA Entity
    'arya-enterprises': {
        model: 'enterprise',
        idField: 'enterpriseId',
        nameField: 'enterpriseName',
        writableFields: ['enterpriseName'],
        tableName: 'enterprise_master',
        idColumn: 'enterprise_id',
        includes: {},
        deleteCountSelect: {
            aryaCurrentYearRecords: true,
            aryaPrevYearRecords: true,
        },
        dependencyLabels: {
            aryaCurrentYearRecords: 'ARYA current year records',
            aryaPrevYearRecords: 'ARYA previous year records',
        },
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
function sanitizeData(config, data = {}) {
    const writableFields = new Set(config.writableFields || [config.nameField]);
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        // Skip ID field, _count, timestamps, and nested objects
        if (key === config.idField || key === '_count' || key === 'id' || key === '_id') continue;
        if (key === 'createdAt' || key === 'updatedAt') continue;
        if (!writableFields.has(key)) continue;
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
    if (Object.keys(sanitized).length === 0) {
        const error = new Error(`No valid fields provided for ${entityName}`);
        error.statusCode = 400;
        throw error;
    }

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
    if (Object.keys(sanitized).length === 0) {
        const error = new Error(`No valid fields provided for ${entityName} update`);
        error.statusCode = 400;
        throw error;
    }

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
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        const error = new Error(`Invalid ID: ${id}`);
        error.statusCode = 400;
        throw error;
    }
    const where = { [config.idField]: parsedId };

    const select = { [config.idField]: true };
    const countSelect = config.deleteCountSelect || config.includes?._count?.select;
    if (countSelect) {
        select._count = { select: countSelect };
    }

    const existing = await prisma[config.model].findUnique({
        where,
        select,
    });

    if (!existing) {
        const error = new Error(`${entityName} with ID ${id} not found`);
        error.statusCode = 404;
        throw error;
    }

    const dependencySummary = [];
    if (existing._count) {
        for (const [key, count] of Object.entries(existing._count)) {
            if (Number(count) > 0) {
                const label = config.dependencyLabels?.[key] || key;
                dependencySummary.push(`${count} ${label}`);
            }
        }
    }

    if (dependencySummary.length > 0) {
        const error = new Error(
            `Cannot delete ${entityName}: linked records exist (${dependencySummary.join(', ')}). Delete dependent records first.`
        );
        error.statusCode = 409;
        throw error;
    }

    try {
        return await prisma[config.model].delete({ where });
    } catch (error) {
        if (error?.code === 'P2003') {
            const dependencyError = new Error(
                `Cannot delete ${entityName}: it is referenced by other records. Delete dependent records first.`
            );
            dependencyError.statusCode = 409;
            throw dependencyError;
        }
        throw error;
    }
}

/**
 * Find product types by category ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>}
 */
async function findProductTypesByCategory(categoryId) {
    return await prisma.productType.findMany({
        where: { productCategoryId: parseInt(categoryId) },
        include: ENTITY_CONFIG['product-types'].includes,
        orderBy: { productCategoryType: 'asc' },
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
        case 'product-types':
            if (data.productCategoryId) {
                const category = await prisma.productCategory.findUnique({
                    where: { productCategoryId: parseInt(data.productCategoryId) },
                });
                return !!category;
            }
            break;

        case 'products':
            if (data.productCategoryId) {
                const category = await prisma.productCategory.findUnique({
                    where: { productCategoryId: parseInt(data.productCategoryId) },
                });
                if (!category) return false;
            }
            if (data.productTypeId) {
                const type = await prisma.productType.findUnique({
                    where: { productTypeId: parseInt(data.productTypeId) },
                });
                return !!type;
            }
            break;

        case 'cra-cropping-systems':
        case 'cra-farming-systems':
            if (data.seasonId) {
                const season = await prisma.season.findUnique({
                    where: { seasonId: parseInt(data.seasonId) },
                });
                return !!season;
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
        productCategories,
        productTypes,
        products,
        craCroppingSystems,
        craFarmingSystems,
        aryaEnterprises,
    ] = await Promise.all([
        prisma.productCategory.count(),
        prisma.productType.count(),
        prisma.product.count(),
        prisma.craCropingSystem.count(),
        prisma.craFarmingSystem.count(),
        prisma.enterprise.count(),
    ]);

    return {
        products: {
            categories: productCategories,
            types: productTypes,
            items: products,
        },
        cra: {
            croppingSystems: craCroppingSystems,
            farmingSystems: craFarmingSystems,
        },
        arya: {
            enterprises: aryaEnterprises,
        },
    };
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteEntity,
    findProductTypesByCategory,
    nameExists,
    validateReferences,
    getStats,
};
