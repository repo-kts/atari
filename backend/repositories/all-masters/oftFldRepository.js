const prisma = require('../../config/prisma.js');
const { ValidationError, NotFoundError, ConflictError, translatePrismaError } = require('../../utils/errorHandler');

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
        tableName: 'oft_subject',
        idColumn: 'oft_subject_id',
        requiredFields: ['subjectName'],
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
        tableName: 'oft_thematic_area',
        idColumn: 'oft_thematic_area_id',
        requiredFields: ['oftSubjectId', 'thematicAreaName'],
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
        tableName: 'sector',
        idColumn: 'sector_id',
        requiredFields: ['sectorName'],
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
        tableName: 'thematic_area',
        idColumn: 'thematic_area_id',
        requiredFields: ['sectorId', 'thematicAreaName'],
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
        tableName: 'category',
        idColumn: 'category_id',
        requiredFields: ['sectorId', 'categoryName'],
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
        tableName: 'sub_category',
        idColumn: 'sub_category_id',
        requiredFields: ['categoryId', 'sectorId', 'subCategoryName'],
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
        tableName: 'crop',
        idColumn: 'crop_id',
        requiredFields: ['subCategoryId', 'categoryId', 'cropName'],
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
    'fld-activities': {
        model: 'fldActivity',
        idField: 'activityId',
        nameField: 'activityName',
        tableName: 'fld_activity',
        idColumn: 'activity_id',
    },

    // CFLD Entities
    'seasons': {
        model: 'season',
        idField: 'seasonId',
        nameField: 'seasonName',
        tableName: 'season',
        idColumn: 'season_id',
        requiredFields: ['seasonName'],
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
        tableName: 'crop_type',
        idColumn: 'type_id',
        requiredFields: ['typeName'],
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
        nameField: 'cropName',
        tableName: 'fld_crop_master',
        idColumn: 'cfld_id',
        requiredFields: ['seasonId', 'typeId', 'cropName'],
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
 * Find OFT thematic areas by subject ID
 * @param {number} oftSubjectId - OFT Subject ID
 * @returns {Promise<Array>}
 * @throws {ValidationError} If subjectId is invalid
 */
async function findOftThematicAreasBySubject(oftSubjectId) {
    if (!oftSubjectId) {
        throw new ValidationError('Subject ID is required', 'oftSubjectId');
    }

    const parsedId = parseInt(oftSubjectId);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError('Invalid subject ID: must be a positive number', 'oftSubjectId');
    }

    try {
        return await prisma.oftThematicArea.findMany({
            where: { oftSubjectId: parsedId },
            include: ENTITY_CONFIG['oft-thematic-areas'].includes,
            orderBy: { thematicAreaName: 'asc' },
        });
    } catch (error) {
        throw translatePrismaError(error, 'OFT Thematic Area', 'findBySubject');
    }
}

/**
 * Find FLD thematic areas by sector ID
 * @param {number} sectorId - Sector ID
 * @returns {Promise<Array>}
 * @throws {ValidationError} If sectorId is invalid
 */
async function findFldThematicAreasBySector(sectorId) {
    if (!sectorId) {
        throw new ValidationError('Sector ID is required', 'sectorId');
    }

    const parsedId = parseInt(sectorId);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError('Invalid sector ID: must be a positive number', 'sectorId');
    }

    try {
        return await prisma.fldThematicArea.findMany({
            where: { sectorId: parsedId },
            include: ENTITY_CONFIG['fld-thematic-areas'].includes,
            orderBy: { thematicAreaName: 'asc' },
        });
    } catch (error) {
        throw translatePrismaError(error, 'FLD Thematic Area', 'findBySector');
    }
}

/**
 * Find FLD categories by sector ID
 * @param {number} sectorId - Sector ID
 * @returns {Promise<Array>}
 * @throws {ValidationError} If sectorId is invalid
 */
async function findFldCategoriesBySector(sectorId) {
    if (!sectorId) {
        throw new ValidationError('Sector ID is required', 'sectorId');
    }

    const parsedId = parseInt(sectorId);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError('Invalid sector ID: must be a positive number', 'sectorId');
    }

    try {
        return await prisma.fldCategory.findMany({
            where: { sectorId: parsedId },
            include: ENTITY_CONFIG['fld-categories'].includes,
            orderBy: { categoryName: 'asc' },
        });
    } catch (error) {
        throw translatePrismaError(error, 'FLD Category', 'findBySector');
    }
}

/**
 * Find FLD subcategories by category ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>}
 * @throws {ValidationError} If categoryId is invalid
 */
async function findFldSubcategoriesByCategory(categoryId) {
    if (!categoryId) {
        throw new ValidationError('Category ID is required', 'categoryId');
    }

    const parsedId = parseInt(categoryId);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError('Invalid category ID: must be a positive number', 'categoryId');
    }

    try {
        return await prisma.fldSubcategory.findMany({
            where: { categoryId: parsedId },
            include: ENTITY_CONFIG['fld-subcategories'].includes,
            orderBy: { subCategoryName: 'asc' },
        });
    } catch (error) {
        throw translatePrismaError(error, 'FLD Subcategory', 'findByCategory');
    }
}

/**
 * Find FLD crops by subcategory ID
 * @param {number} subCategoryId - Subcategory ID
 * @returns {Promise<Array>}
 * @throws {ValidationError} If subCategoryId is invalid
 */
async function findFldCropsBySubcategory(subCategoryId) {
    if (!subCategoryId) {
        throw new ValidationError('Subcategory ID is required', 'subCategoryId');
    }

    const parsedId = parseInt(subCategoryId);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new ValidationError('Invalid subcategory ID: must be a positive number', 'subCategoryId');
    }

    try {
        return await prisma.fldCrop.findMany({
            where: { subCategoryId: parsedId },
            include: ENTITY_CONFIG['fld-crops'].includes,
            orderBy: { cropName: 'asc' },
        });
    } catch (error) {
        throw translatePrismaError(error, 'FLD Crop', 'findBySubcategory');
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
            case 'oft-thematic-areas':
                if (data.oftSubjectId) {
                    const parsedId = parseInt(data.oftSubjectId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid subject ID', 'oftSubjectId');
                    }
                    const subject = await prisma.oftSubject.findUnique({
                        where: { oftSubjectId: parsedId },
                    });
                    if (!subject) {
                        throw new ValidationError(`OFT Subject with ID ${parsedId} not found`, 'oftSubjectId');
                    }
                }
                break;

            case 'fld-thematic-areas':
            case 'fld-categories':
                if (data.sectorId) {
                    const parsedId = parseInt(data.sectorId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid sector ID', 'sectorId');
                    }
                    const sector = await prisma.sector.findUnique({
                        where: { sectorId: parsedId },
                    });
                    if (!sector) {
                        throw new ValidationError(`Sector with ID ${parsedId} not found`, 'sectorId');
                    }
                }
                break;

            case 'fld-subcategories':
                if (data.categoryId) {
                    const parsedId = parseInt(data.categoryId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid category ID', 'categoryId');
                    }
                    const category = await prisma.fldCategory.findUnique({
                        where: { categoryId: parsedId },
                    });
                    if (!category) {
                        throw new ValidationError(`Category with ID ${parsedId} not found`, 'categoryId');
                    }
                }
                if (data.sectorId) {
                    const parsedId = parseInt(data.sectorId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid sector ID', 'sectorId');
                    }
                    const sector = await prisma.sector.findUnique({
                        where: { sectorId: parsedId },
                    });
                    if (!sector) {
                        throw new ValidationError(`Sector with ID ${parsedId} not found`, 'sectorId');
                    }
                }
                break;

            case 'fld-crops':
                if (data.subCategoryId) {
                    const parsedId = parseInt(data.subCategoryId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid subcategory ID', 'subCategoryId');
                    }
                    const subcategory = await prisma.fldSubcategory.findUnique({
                        where: { subCategoryId: parsedId },
                    });
                    if (!subcategory) {
                        throw new ValidationError(`Subcategory with ID ${parsedId} not found`, 'subCategoryId');
                    }
                }
                if (data.categoryId) {
                    const parsedId = parseInt(data.categoryId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid category ID', 'categoryId');
                    }
                    const category = await prisma.fldCategory.findUnique({
                        where: { categoryId: parsedId },
                    });
                    if (!category) {
                        throw new ValidationError(`Category with ID ${parsedId} not found`, 'categoryId');
                    }
                }
                if (data.sectorId) {
                    const parsedId = parseInt(data.sectorId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid sector ID', 'sectorId');
                    }
                    const sector = await prisma.sector.findUnique({
                        where: { sectorId: parsedId },
                    });
                    if (!sector) {
                        throw new ValidationError(`Sector with ID ${parsedId} not found`, 'sectorId');
                    }
                }
                break;

            case 'cfld-crops':
                if (data.seasonId) {
                    const parsedId = parseInt(data.seasonId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid season ID', 'seasonId');
                    }
                    const season = await prisma.season.findUnique({
                        where: { seasonId: parsedId },
                    });
                    if (!season) {
                        throw new ValidationError(`Season with ID ${parsedId} not found`, 'seasonId');
                    }
                }
                if (data.typeId) {
                    const parsedId = parseInt(data.typeId);
                    if (isNaN(parsedId) || parsedId <= 0) {
                        throw new ValidationError('Invalid crop type ID', 'typeId');
                    }
                    const cropType = await prisma.cropType.findUnique({
                        where: { typeId: parsedId },
                    });
                    if (!cropType) {
                        throw new ValidationError(`Crop Type with ID ${parsedId} not found`, 'typeId');
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
    getEntityConfig, // Export for service layer use
};
