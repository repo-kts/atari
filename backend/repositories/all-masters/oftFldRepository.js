const prisma = require('../../config/prisma.js');

/**
 * OFT & FLD Master Data Repository
 * Ultra-optimized repository for OFT, FLD, and CFLD master data CRUD operations
 */

// Entity configuration mapping
// Entity model types for each entity would be good for error cathing ---- TODO
const ENTITY_CONFIG = {
    // OFT Entities
    'oft-subjects': {
        model: 'oftSubject',
        idField: 'oftSubjectId',
        nameField: 'subjectName',
        writableFields: ['subjectName'],
        tableName: 'oft_subject',
        idColumn: 'oft_subject_id',
        includes: {
            _count: {
                select: {
                    thematicAreas: true,
                },
            },
        },
        dependencyLabels: {
            thematicAreas: 'thematic areas',
        },
        deleteDependencies: [
            { model: 'kvkoft', foreignKey: 'oftSubjectId', label: 'OFT records' },
        ],
    },
    'oft-thematic-areas': {
        model: 'oftThematicArea',
        idField: 'oftThematicAreaId',
        nameField: 'thematicAreaName',
        writableFields: ['thematicAreaName', 'oftSubjectId'],
        tableName: 'oft_thematic_area',
        idColumn: 'oft_thematic_area_id',
        includes: {
            subject: {
                select: {
                    oftSubjectId: true,
                    subjectName: true,
                },
            },
        },
        deleteDependencies: [
            { model: 'kvkoft', foreignKey: 'oftThematicAreaId', label: 'OFT records' },
        ],
    },

    // FLD Entities
    'fld-sectors': {
        model: 'sector',
        idField: 'sectorId',
        nameField: 'sectorName',
        writableFields: ['sectorName'],
        tableName: 'sector',
        idColumn: 'sector_id',
        includes: {
            _count: {
                select: {
                    thematicAreas: true,
                    categories: true,
                },
            },
        },
        dependencyLabels: {
            thematicAreas: 'thematic areas',
            categories: 'categories',
        },
    },
    'fld-thematic-areas': {
        model: 'fldThematicArea',
        idField: 'thematicAreaId',
        nameField: 'thematicAreaName',
        writableFields: ['thematicAreaName', 'sectorId'],
        tableName: 'thematic_area',
        idColumn: 'thematic_area_id',
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
        writableFields: ['categoryName', 'sectorId'],
        tableName: 'category',
        idColumn: 'category_id',
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
        dependencyLabels: {
            subCategories: 'sub-categories',
        },
    },
    'fld-subcategories': {
        model: 'fldSubcategory',
        idField: 'subCategoryId',
        nameField: 'subCategoryName',
        writableFields: ['subCategoryName', 'categoryId', 'sectorId'],
        tableName: 'sub_category',
        idColumn: 'sub_category_id',
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
        dependencyLabels: {
            crops: 'crops',
        },
    },
    'fld-crops': {
        model: 'fldCrop',
        idField: 'cropId',
        nameField: 'cropName',
        writableFields: ['cropName', 'categoryId', 'subCategoryId'],
        tableName: 'crop',
        idColumn: 'crop_id',
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
        },
    },

    // CFLD Entities
    'seasons': {
        model: 'season',
        idField: 'seasonId',
        nameField: 'seasonName',
        writableFields: ['seasonName'],
        tableName: 'season',
        idColumn: 'season_id',
        includes: {
            _count: {
                select: {
                    cfldCrops: true,
                },
            },
        },
        dependencyLabels: {
            cfldCrops: 'CFLD crops',
        },
    },
    'crop-types': {
        model: 'cropType',
        idField: 'typeId',
        nameField: 'typeName',
        writableFields: ['typeName'],
        tableName: 'crop_type',
        idColumn: 'type_id',
        includes: {
            _count: {
                select: {
                    cfldCrops: true,
                },
            },
        },
        dependencyLabels: {
            cfldCrops: 'CFLD crops',
        },
    },
    'cfld-crops': {
        model: 'fLDCropMaster',
        idField: 'cfldId',
        nameField: 'cropName',
        writableFields: ['cropName', 'seasonId', 'typeId'],
        fieldAliases: {
            CropName: 'cropName',
        },
        tableName: 'fld_crop_master',
        idColumn: 'cfld_id',
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
 * Sanitize data: remove nested objects, _count, timestamps, and the ID field.
 * Only keep scalar values Prisma can accept.
 */
function sanitizeData(config, data = {}) {
    const writableFields = new Set(config.writableFields || [config.nameField]);
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        const normalizedKey = config.fieldAliases?.[key] || key;
        if (normalizedKey === config.idField || key === '_count' || key === 'id' || key === '_id') continue;
        if (key === 'createdAt' || key === 'updatedAt') continue;
        if (!writableFields.has(normalizedKey)) continue;
        if (value !== null && typeof value === 'object') continue;
        if (value === undefined) continue;
        if (normalizedKey.endsWith('Id') && value !== null) {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed)) sanitized[normalizedKey] = parsed;
        } else {
            sanitized[normalizedKey] = typeof value === 'string' ? value.trim() : value;
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
    const parsedId = parseInt(id);
    const where = { [config.idField]: parsedId };

    const select = { [config.idField]: true };
    if (config.includes?._count?.select) {
        select._count = { select: config.includes._count.select };
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

    if (config.deleteDependencies?.length) {
        const extraCounts = await Promise.all(
            config.deleteDependencies.map(async (dependency) => {
                const count = await prisma[dependency.model].count({
                    where: { [dependency.foreignKey]: parsedId },
                });
                return { count, label: dependency.label };
            })
        );

        for (const dependency of extraCounts) {
            if (Number(dependency.count) > 0) {
                dependencySummary.push(`${dependency.count} ${dependency.label}`);
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
