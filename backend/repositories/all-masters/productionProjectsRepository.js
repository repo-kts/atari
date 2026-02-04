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
        includes: {
            _count: {
                select: {
                    productTypes: true,
                    products: true,
                },
            },
        },
    },
    'product-types': {
        model: 'productType',
        idField: 'productTypeId',
        nameField: 'productCategoryType',
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
    },
    'products': {
        model: 'product',
        idField: 'productId',
        nameField: 'productName',
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
        model: 'aryaEnterprise',
        idField: 'aryaEnterpriseId',
        nameField: 'enterpriseName',
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
        prisma.aryaEnterprise.count(),
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
