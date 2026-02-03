const prisma = require('../../config/prisma.js');

/**
 * OFT & FLD Master Data Repository
 * Ultra-optimized repository for OFT, FLD, and CFLD master data CRUD operations
 */

// Entity configuration mapping
const ENTITY_CONFIG = {
    // OFT Entities
    'oft-subjects': {
        model: 'oftSubject',
        idField: 'oftSubjectId',
        nameField: 'subjectName',
        includes: {
            _count: {
                select: {
                    thematicAreas: true,
                },
            },
        },
    },
    'oft-thematic-areas': {
        model: 'oftThematicArea',
        idField: 'oftThematicAreaId',
        nameField: 'thematicAreaName',
        includes: {
            subject: {
                select: {
                    oftSubjectId: true,
                    subjectName: true,
                },
            },
        },
    },

    // FLD Entities
    'fld-sectors': {
        model: 'sector',
        idField: 'sectorId',
        nameField: 'sectorName',
        includes: {
            _count: {
                select: {
                    thematicAreas: true,
                    categories: true,
                },
            },
        },
    },
    'fld-thematic-areas': {
        model: 'fldThematicArea',
        idField: 'thematicAreaId',
        nameField: 'thematicAreaName',
        includes: {
            sector: {
                select: {
                    sectorId: true,
                    sectorName: true,
                },
            },
        },
    },
    'fld-categories': {
        model: 'fldCategory',
        idField: 'categoryId',
        nameField: 'categoryName',
        includes: {
            sector: {
                select: {
                    sectorId: true,
                    sectorName: true,
                },
            },
            _count: {
                select: {
                    subCategories: true,
                },
            },
        },
    },
    'fld-subcategories': {
        model: 'fldSubcategory',
        idField: 'subCategoryId',
        nameField: 'subCategoryName',
        includes: {
            category: {
                select: {
                    categoryId: true,
                    categoryName: true,
                },
            },
            sector: {
                select: {
                    sectorId: true,
                    sectorName: true,
                },
            },
            _count: {
                select: {
                    crops: true,
                },
            },
        },
    },
    'fld-crops': {
        model: 'fldCrop',
        idField: 'cropId',
        nameField: 'cropName',
        includes: {
            subCategory: {
                select: {
                    subCategoryId: true,
                    subCategoryName: true,
                },
            },
            category: {
                select: {
                    categoryId: true,
                    categoryName: true,
                },
            },
            sector: {
                select: {
                    sectorId: true,
                    sectorName: true,
                },
            },
        },
    },

    // CFLD Entities
    'seasons': {
        model: 'season',
        idField: 'seasonId',
        nameField: 'seasonName',
        includes: {
            _count: {
                select: {
                    cfldCrops: true,
                },
            },
        },
    },
    'crop-types': {
        model: 'cropType',
        idField: 'typeId',
        nameField: 'typeName',
        includes: {
            _count: {
                select: {
                    cfldCrops: true,
                },
            },
        },
    },
    'cfld-crops': {
        model: 'fLDCropMaster',
        idField: 'cfldId',
        nameField: 'CropName',
        includes: {
            season: {
                select: {
                    seasonId: true,
                    seasonName: true,
                },
            },
            cropType: {
                select: {
                    typeId: true,
                    typeName: true,
                },
            },
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
 * Find OFT thematic areas by subject ID
 * @param {number} oftSubjectId - OFT Subject ID
 * @returns {Promise<Array>}
 */
async function findOftThematicAreasBySubject(oftSubjectId) {
    return await prisma.oftThematicArea.findMany({
        where: { oftSubjectId: parseInt(oftSubjectId) },
        include: ENTITY_CONFIG['oft-thematic-areas'].includes,
        orderBy: { thematicAreaName: 'asc' },
    });
}

/**
 * Find FLD thematic areas by sector ID
 * @param {number} sectorId - Sector ID
 * @returns {Promise<Array>}
 */
async function findFldThematicAreasBySector(sectorId) {
    return await prisma.fldThematicArea.findMany({
        where: { sectorId: parseInt(sectorId) },
        include: ENTITY_CONFIG['fld-thematic-areas'].includes,
        orderBy: { thematicAreaName: 'asc' },
    });
}

/**
 * Find FLD categories by sector ID
 * @param {number} sectorId - Sector ID
 * @returns {Promise<Array>}
 */
async function findFldCategoriesBySector(sectorId) {
    return await prisma.fldCategory.findMany({
        where: { sectorId: parseInt(sectorId) },
        include: ENTITY_CONFIG['fld-categories'].includes,
        orderBy: { categoryName: 'asc' },
    });
}

/**
 * Find FLD subcategories by category ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>}
 */
async function findFldSubcategoriesByCategory(categoryId) {
    return await prisma.fldSubcategory.findMany({
        where: { categoryId: parseInt(categoryId) },
        include: ENTITY_CONFIG['fld-subcategories'].includes,
        orderBy: { subCategoryName: 'asc' },
    });
}

/**
 * Find FLD crops by subcategory ID
 * @param {number} subCategoryId - Subcategory ID
 * @returns {Promise<Array>}
 */
async function findFldCropsBySubcategory(subCategoryId) {
    return await prisma.fldCrop.findMany({
        where: { subCategoryId: parseInt(subCategoryId) },
        include: ENTITY_CONFIG['fld-crops'].includes,
        orderBy: { cropName: 'asc' },
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
        case 'oft-thematic-areas':
            if (data.oftSubjectId) {
                const subject = await prisma.oftSubject.findUnique({
                    where: { oftSubjectId: parseInt(data.oftSubjectId) },
                });
                return !!subject;
            }
            break;

        case 'fld-thematic-areas':
        case 'fld-categories':
            if (data.sectorId) {
                const sector = await prisma.sector.findUnique({
                    where: { sectorId: parseInt(data.sectorId) },
                });
                return !!sector;
            }
            break;

        case 'fld-subcategories':
            if (data.categoryId) {
                const category = await prisma.fldCategory.findUnique({
                    where: { categoryId: parseInt(data.categoryId) },
                });
                if (!category) return false;
            }
            if (data.sectorId) {
                const sector = await prisma.sector.findUnique({
                    where: { sectorId: parseInt(data.sectorId) },
                });
                if (!sector) return false;
            }
            return true;

        case 'fld-crops':
            if (data.subCategoryId) {
                const subcategory = await prisma.fldSubcategory.findUnique({
                    where: { subCategoryId: parseInt(data.subCategoryId) },
                });
                if (!subcategory) return false;
            }
            if (data.categoryId) {
                const category = await prisma.fldCategory.findUnique({
                    where: { categoryId: parseInt(data.categoryId) },
                });
                if (!category) return false;
            }
            if (data.sectorId) {
                const sector = await prisma.sector.findUnique({
                    where: { sectorId: parseInt(data.sectorId) },
                });
                if (!sector) return false;
            }
            return true;

        case 'cfld-crops':
            if (data.seasonId) {
                const season = await prisma.season.findUnique({
                    where: { seasonId: parseInt(data.seasonId) },
                });
                if (!season) return false;
            }
            if (data.typeId) {
                const cropType = await prisma.cropType.findUnique({
                    where: { typeId: parseInt(data.typeId) },
                });
                if (!cropType) return false;
            }
            return true;

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
        oftSubjects,
        oftThematicAreas,
        sectors,
        fldThematicAreas,
        fldCategories,
        fldSubcategories,
        fldCrops,
        cfldCrops,
    ] = await Promise.all([
        prisma.oftSubject.count(),
        prisma.oftThematicArea.count(),
        prisma.sector.count(),
        prisma.fldThematicArea.count(),
        prisma.fldCategory.count(),
        prisma.fldSubcategory.count(),
        prisma.fldCrop.count(),
        prisma.fLDCropMaster.count(),
    ]);

    return {
        oft: {
            subjects: oftSubjects,
            thematicAreas: oftThematicAreas,
        },
        fld: {
            sectors,
            thematicAreas: fldThematicAreas,
            categories: fldCategories,
            subcategories: fldSubcategories,
            crops: fldCrops,
        },
        cfld: {
            crops: cfldCrops,
        },
    };
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteEntity,
    findOftThematicAreasBySubject,
    findFldThematicAreasBySector,
    findFldCategoriesBySector,
    findFldSubcategoriesByCategory,
    findFldCropsBySubcategory,
    nameExists,
    validateReferences,
    getStats,
};
