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
                    kvkFldIntroductions: true,
                    kvkBudgetUtilizations: true,
                    extensionActivityOrganized: true,
                    cfldTechnicalParameters: true,
                    kvkOfts: true,
                    nicraDetails: true,
                    demonstrationInfo: true,
                    soilDataInformation: true,
                    seedHubPrograms: true,
                    csisa: true,
                },
            },
        },
        dependencyLabels: {
            cfldCrops: 'CFLD crops',
            craCropingSystems: 'CRA cropping systems',
            craFarmingSystems: 'CRA farming systems',
            kvkFldIntroductions: 'FLD introduction records',
            kvkBudgetUtilizations: 'budget utilization records',
            extensionActivityOrganized: 'extension activities organized',
            cfldTechnicalParameters: 'technical parameter records',
            kvkOfts: 'OFT records',
            nicraDetails: 'NICRA detail records',
            demonstrationInfo: 'demonstration records',
            soilDataInformation: 'soil data records',
            seedHubPrograms: 'seed hub records',
            csisa: 'CSISA records',
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
    // Employee Masters
    'staff-category': {
        model: 'staffCategoryMaster',
        idField: 'staffCategoryId',
        nameField: 'categoryName',
        includes: {
            _count: {
                select: {
                    staff: true,
                },
            },
        },
    },
    'pay-level': {
        model: 'payLevelMaster',
        idField: 'payLevelId',
        nameField: 'levelName',
        includes: {
            _count: {
                select: {
                    staff: true,
                },
            },
        },
    },
    'discipline': {
        model: 'discipline',
        idField: 'disciplineId',
        nameField: 'disciplineName',
        includes: {
            _count: {
                select: {
                    staff: true,
                    kvkOfts: true,
                },
            },
        },
        dependencyLabels: {
            staff: 'staff records',
            kvkOfts: 'OFT records',
        },
    },
    // Extension Masters
    'extension-activity-type': {
        model: 'fldActivity',
        idField: 'activityId',
        nameField: 'activityName',
        includes: {
            _count: {
                select: {
                    extensions: true,
                    kvkExtensionActivities: true,
                },
            },
        },
    },
    'other-extension-activity-type': {
        model: 'otherExtensionActivityType',
        idField: 'activityTypeId',
        nameField: 'activityName',
        includes: {
            _count: {
                select: {
                    otherExtensionActivities: true,
                },
            },
        },
    },
    'important-day': {
        model: 'importantDay',
        idField: 'importantDayId',
        nameField: 'dayName',
        includes: {
            _count: {
                select: {
                    celebrations: true,
                },
            },
        },
    },
    // Training Masters
    'training-clientele': {
        model: 'clienteleMaster',
        idField: 'clienteleId',
        nameField: 'name',
        includes: {
            _count: {
                select: {
                    trainings: true,
                },
            },
        },
    },
    'funding-source': {
        model: 'fundingSourceMaster',
        idField: 'fundingSourceId',
        nameField: 'name',
        includes: {
            _count: {
                select: {
                    trainings: true,
                },
            },
        },
    },
    // Other Masters
    'crop-type': {
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
    'infrastructure-master': {
        model: 'kvkInfrastructureMaster',
        idField: 'infraMasterId',
        nameField: 'name',
        includes: {
            _count: {
                select: {
                    infrastructures: true,
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
        throw new Error(`Unknown entity type: ${entityName}`);
    }
    return config;
}

/**
 * Keep only writable scalar fields for simple master entities.
 * These entities are name-only masters, so updates/creates should only write nameField.
 */
function sanitizeSimpleMasterData(config, data = {}) {
    const sanitized = {};

    if (!(config.nameField in data)) {
        return sanitized;
    }

    const value = data[config.nameField];
    if (value === undefined) {
        return sanitized;
    }

    sanitized[config.nameField] = typeof value === 'string' ? value.trim() : value;
    return sanitized;
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
    if (!id) {
        throw new Error(`ID is required for ${entityType}`);
    }
    const config = getEntityConfig(entityType);
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        throw new Error(`Invalid ID format for ${entityType}: ${id}`);
    }
    return prisma[config.model].findUnique({
        where: { [config.idField]: parsedId },
        include: config.includes,
    });
};

/**
 * Fix PostgreSQL sequence for a given model
 * This is needed when records are inserted with explicit IDs and the sequence gets out of sync
 */
const fixSequence = async (modelName, idField, tableName, columnName) => {
    try {
        // Construct sequence name: {table_name}_{column_name}_seq
        const sequenceName = `${tableName}_${columnName}_seq`;
        
        // Get the current max ID using raw SQL
        const maxIdResult = await prisma.$queryRawUnsafe(
            `SELECT COALESCE(MAX(${columnName}), 0) as max_id FROM ${tableName}`
        );
        
        const maxId = maxIdResult[0]?.max_id || 0;
        const nextId = maxId > 0 ? maxId + 1 : 1;
        
        // Reset the sequence to the next available ID
        // setval(sequence_name, value, is_called)
        // is_called = false means the next nextval() will return the specified value
        await prisma.$executeRawUnsafe(
            `SELECT setval('${sequenceName}', ${nextId}, false)`
        );
        
        console.log(`Fixed sequence ${sequenceName} to ${nextId}`);
        return nextId;
    } catch (seqError) {
        console.error(`Error fixing sequence for ${modelName}:`, seqError);
        // Don't throw - let the original error be thrown instead
        return null;
    }
};

/**
 * Generic create
 */
const create = async (entityType, data) => {
    const config = getEntityConfig(entityType);

    // Build sanitized data object with only allowed fields
    const sanitizedData = sanitizeSimpleMasterData(config, data);
    if (Object.keys(sanitizedData).length === 0) {
        const error = new Error(`No valid fields provided for ${entityType}`);
        error.statusCode = 400;
        throw error;
    }
    
    // Explicitly exclude ID fields to prevent conflicts
    // Never include the ID field - let the database auto-increment handle it
    const idFieldVariations = [
        config.idField,
        'id',
        '_id',
        config.idField.toLowerCase(),
        config.idField.replace(/([A-Z])/g, '_$1').toLowerCase(),
    ];
    
    // Ensure no ID field is accidentally included
    for (const idField of idFieldVariations) {
        if (sanitizedData[idField] !== undefined) {
            delete sanitizedData[idField];
        }
        // Also check the original data and remove any ID fields
        if (data[idField] !== undefined) {
            delete data[idField];
        }
    }
    
    // Proactively fix sequence for entities that are known to have seeded data
    // This prevents sequence out-of-sync issues
    const entitiesWithSeededData = [
        'infrastructure-master',
        'staff-category',
        'pay-level',
        'discipline',
        'sanctioned-posts',
        'seasons',
        'years',
        'crop-type',
        'important-day',
    ];
    
    if (entitiesWithSeededData.includes(entityType)) {
        const tableName = entityType === 'sanctioned-posts' ? 'sanctioned_post' :
                         entityType === 'seasons' ? 'season' :
                         entityType === 'years' ? 'year_master' :
                         entityType === 'staff-category' ? 'staff_category_master' :
                         entityType === 'pay-level' ? 'pay_level_master' :
                         entityType === 'discipline' ? 'discipline' :
                         entityType === 'extension-activity-type' ? 'fld_activity' :
                         entityType === 'other-extension-activity-type' ? 'other_extension_activity_type' :
                         entityType === 'important-day' ? 'important_day' :
                         entityType === 'training-clientele' ? 'clientele_master' :
                         entityType === 'funding-source' ? 'funding_source_master' :
                         entityType === 'crop-type' ? 'crop_type' :
                         entityType === 'infrastructure-master' ? 'kvk_infrastructure_master' : null;
        
        if (tableName) {
            const columnName = config.idField.replace(/([A-Z])/g, '_$1').toLowerCase();
            // Proactively fix sequence before creating
            await fixSequence(config.model, config.idField, tableName, columnName);
        }
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
            const fieldName = error.meta?.target?.[0] || 'unknown';
            
            // Check if it's an ID field conflict (sequence out of sync issue)
            // The field name from Prisma error is the database column name (snake_case)
            const dbColumnName = config.idField.replace(/([A-Z])/g, '_$1').toLowerCase();
            const isIdField = idFieldVariations.some(idField => {
                const idFieldDbName = idField.replace(/([A-Z])/g, '_$1').toLowerCase();
                return field === idField || 
                       field === idFieldDbName ||
                       field === dbColumnName ||
                       field.toLowerCase() === dbColumnName;
            }) || field === dbColumnName || field.toLowerCase() === dbColumnName;
            
            if (isIdField) {
                // This is a sequence synchronization issue in PostgreSQL
                // Try to automatically fix the sequence
                const tableName = entityType === 'sanctioned-posts' ? 'sanctioned_post' :
                                 entityType === 'seasons' ? 'season' :
                                 entityType === 'years' ? 'year_master' :
                                 entityType === 'staff-category' ? 'staff_category_master' :
                                 entityType === 'pay-level' ? 'pay_level_master' :
                                 entityType === 'discipline' ? 'discipline' :
                                 entityType === 'extension-activity-type' ? 'fld_activity' :
                                 entityType === 'other-extension-activity-type' ? 'other_extension_activity_type' :
                                 entityType === 'important-day' ? 'important_day' :
                                 entityType === 'training-clientele' ? 'clientele_master' :
                                 entityType === 'funding-source' ? 'funding_source_master' :
                                 entityType === 'crop-type' ? 'crop_type' :
                                 entityType === 'infrastructure-master' ? 'kvk_infrastructure_master' : null; 
                
                const columnName = config.idField.replace(/([A-Z])/g, '_$1').toLowerCase();
                
                if (tableName) {
                    console.log(`Attempting to fix sequence for ${config.model} (table: ${tableName}, column: ${columnName})...`);
                    const fixed = await fixSequence(config.model, config.idField, tableName, columnName);
                    
                    if (fixed !== null) {
                        // Retry the create operation after fixing the sequence
                        console.log(`Sequence fixed to ${fixed}, retrying create operation...`);
                        try {
                            return await prisma[config.model].create({
                                data: sanitizedData,
                            });
                        } catch (retryError) {
                            // If retry still fails, provide a more specific error
                            console.error('Retry after sequence fix failed:', retryError);
                            const retryErrorMsg = new Error(
                                `Failed to create ${entityType} after fixing sequence. Please try again or contact support.`
                            );
                            retryErrorMsg.statusCode = 500;
                            retryErrorMsg.code = 'SEQUENCE_FIX_RETRY_FAILED';
                            throw retryErrorMsg;
                        }
                    } else {
                        // Auto-fix failed
                        console.error(`Failed to automatically fix sequence for ${config.model}`);
                    }
                }
                
                // If auto-fix failed or table name is unknown, provide helpful error message
                const betterError = new Error(
                    `Database sequence out of sync for ${config.model}. Please contact support to fix the sequence manually.`
                );
                betterError.statusCode = 500;
                betterError.code = 'SEQUENCE_OUT_OF_SYNC';
                throw betterError;
            }
            
            // Check if it's a name field conflict
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
    const sanitizedData = sanitizeSimpleMasterData(config, data);
    if (Object.keys(sanitizedData).length === 0) {
        const error = new Error(`No valid fields provided for ${entityType} update`);
        error.statusCode = 400;
        throw error;
    }
    return prisma[config.model].update({
        where: { [config.idField]: parseInt(id) },
        data: sanitizedData,
    });
};

/**
 * Generic delete
 */
const deleteEntity = async (entityType, id) => {
    const config = getEntityConfig(entityType);
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        const error = new Error(`Invalid ID: ${id}`);
        error.statusCode = 400;
        throw error;
    }

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
        const error = new Error(`${entityType} with ID ${id} not found`);
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
            `Cannot delete ${entityType}: linked records exist (${dependencySummary.join(', ')}). Delete dependent records first.`
        );
        error.statusCode = 409;
        throw error;
    }

    try {
        return await prisma[config.model].delete({ where });
    } catch (error) {
        if (error?.code === 'P2003') {
            const dependencyError = new Error(
                `Cannot delete ${entityType}: it is referenced by other records. Delete dependent records first.`
            );
            dependencyError.statusCode = 409;
            throw dependencyError;
        }
        throw error;
    }
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
