const prisma = require('../../config/prisma.js');
const { sanitizeString, sanitizeInteger, safeGet } = require('../../utils/dataSanitizer.js');
const { ValidationError } = require('../../utils/errorHandler.js');

/**
 * Generic Master Data Repository 
 * Ultra-optimized repository for all master data CRUD operations
 * Supports Zones, States, Districts, and Organizations
 */

// Entity configuration mapping
// `allowedFields` lists the ONLY scalar fields Prisma should receive on create/update.
const ENTITY_CONFIG = {
    zones: {
        model: 'zone',
        idField: 'zoneId',
        nameField: 'zoneName',
        tableName: 'zone',
        idColumn: 'zone_id',
        allowedFields: ['zoneName'],
        includes: {
            _count: {
                select: {
                    states: true,
                    districts: true,
                    users: true,
                },
            },
        },
    },
    states: {
        model: 'stateMaster',
        idField: 'stateId',
        nameField: 'stateName',
        tableName: '"stateMaster"',
        idColumn: 'state_id',
        allowedFields: ['stateName', 'zoneId'],
        includes: {
            zone: {
                select: {
                    zoneId: true,
                    zoneName: true,
                },
            },
            _count: {
                select: {
                    districts: true,
                    users: true,
                },
            },
        },
    },
    districts: {
        model: 'districtMaster',
        idField: 'districtId',
        nameField: 'districtName',
        tableName: '"districtMaster"',
        idColumn: 'district_id',
        allowedFields: ['districtName', 'stateId', 'zoneId'],
        includes: {
            state: {
                select: {
                    stateId: true,
                    stateName: true,
                },
            },
            zone: {
                select: {
                    zoneId: true,
                    zoneName: true,
                },
            },
            _count: {
                select: {
                    users: true,
                    orgs: true,
                },
            },
        },
    },
    organizations: {
        model: 'orgMaster',
        idField: 'orgId',
        nameField: 'orgName',
        tableName: '"orgMaster"',
        idColumn: 'org_id',
        allowedFields: ['orgName', 'districtId'],
        includes: {
            district: {
                select: {
                    districtId: true,
                    districtName: true,
                    state: {
                        select: {
                            stateId: true,
                            stateName: true,
                            zone: {
                                select: {
                                    zoneId: true,
                                    zoneName: true,
                                },
                            },
                        },
                    },
                },
            },
            _count: {
                select: {
                    users: true,
                    universities: true,
                    kvks: true,
                },
            },
        },
    },
    universities: {
        model: 'universityMaster',
        idField: 'universityId',
        nameField: 'universityName',
        tableName: '"universityMaster"',
        idColumn: 'university_id',
        allowedFields: ['universityName', 'orgId'],
        includes: {
            organization: {
                select: {
                    orgId: true,
                    orgName: true,
                    district: {
                        select: {
                            districtId: true,
                            districtName: true,
                            state: {
                                select: {
                                    stateId: true,
                                    stateName: true,
                                    zone: {
                                        select: {
                                            zoneId: true,
                                            zoneName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            _count: {
                select: {
                    users: true,
                    kvks: true,
                },
            },
        },
    },
};

/**
 * Get entity configuration
 * @param {string} entityName - Entity name (zones, states, districts, organizations)
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
        limit = 20,
        search = '',
        sortBy,
        sortOrder = 'asc',
        filters = {},
    } = options;

    // Use the entity's ID field as default sort if not provided
    const actualSortBy = sortBy || config.idField;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 items per page

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
                [config.idField]: sortOrder,
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
    
    // Validate ID
    if (id === undefined || id === null || id === '') {
        throw new Error(`Missing ID field: ${config.idField}`);
    }
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        throw new Error(`Invalid ID: ${id}. Expected a number.`);
    }

    return await prisma[config.model].findUnique({
        where: { [config.idField]: parsedId },
        include: config.includes,
    });
}

/**
 * Sanitize and validate data for entity creation
 * @param {string} entityName - Entity name
 * @param {object} data - Entity data
 * @returns {object} Sanitized data
 */
function sanitizeAndValidateData(entityName, data) {
    const config = getEntityConfig(entityName);
    const sanitized = { ...data };

    // Remove ID fields to prevent conflicts
    const idFieldVariations = [
        config.idField,
        'id',
        '_id',
        config.idField.toLowerCase(),
        config.idField.replace(/([A-Z])/g, '_$1').toLowerCase(),
    ];

    for (const idField of idFieldVariations) {
        if (sanitized[idField] !== undefined) {
            delete sanitized[idField];
        }
    }

    // Validate required fields based on entity type
    switch (entityName) {
        case 'zones':
            const zoneName = sanitizeString(safeGet(data, 'zoneName'), { allowEmpty: false });
            if (!zoneName) {
                throw new ValidationError('zoneName is required', 'zoneName');
            }
            sanitized.zoneName = zoneName;
            break;

        case 'states':
            const stateName = sanitizeString(safeGet(data, 'stateName'), { allowEmpty: false });
            if (!stateName) {
                throw new ValidationError('stateName is required', 'stateName');
            }
            const zoneId = sanitizeInteger(safeGet(data, 'zoneId'));
            if (!zoneId || zoneId === null) {
                throw new ValidationError('zoneId is required', 'zoneId');
            }
            sanitized.stateName = stateName;
            sanitized.zoneId = zoneId;
            break;

        case 'districts':
            if (!data.districtName || String(data.districtName).trim() === '') {
                throw new Error('districtName is required');
            }
            if (!data.stateId) {
                throw new Error('stateId is required');
            }
            if (!data.zoneId) {
                throw new Error('zoneId is required');
            }
            sanitized.districtName = String(data.districtName).trim();
            sanitized.stateId = parseInt(data.stateId);
            sanitized.zoneId = parseInt(data.zoneId);
            break;

        case 'organizations':
            if (!data.orgName || String(data.orgName).trim() === '') {
                throw new Error('orgName is required');
            }
            sanitized.orgName = String(data.orgName).trim();
            // districtId is optional but should be parsed if provided
            if (data.districtId !== undefined && data.districtId !== null && data.districtId !== '') {
                sanitized.districtId = parseInt(data.districtId);
            } else {
                sanitized.districtId = null;
            }
            break;

        case 'universities':
            if (!data.universityName || String(data.universityName).trim() === '') {
                throw new Error('universityName is required');
            }
            if (!data.orgId) {
                throw new Error('orgId is required');
            }
            sanitized.universityName = String(data.universityName).trim();
            sanitized.orgId = parseInt(data.orgId);
            break;

        default:
            // For other entities, validate name field if it exists
            if (config.nameField && data[config.nameField]) {
                sanitized[config.nameField] = String(data[config.nameField]).trim();
            }
    }

    return sanitized;
}

/**
 * Create new entity
 * @param {string} entityName - Entity name
 * @param {object} data - Entity data
 * @returns {Promise<object>}
 */
async function create(entityName, data) {
    // Validate input
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new ValidationError('Invalid data: must be an object');
    }

    const config = getEntityConfig(entityName);

    // Sanitize and validate data
    const sanitizedData = sanitizeAndValidateData(entityName, data);

    // Ensure sanitizedData is not empty
    if (!sanitizedData || Object.keys(sanitizedData).length === 0) {
        throw new ValidationError('No valid data provided for creation');
    }

    return await prisma[config.model].create({
        data: sanitizedData,
        include: config.includes,
    });
}

/**
 * Sanitize data for entity update
 * @param {string} entityName - Entity name
 * @param {object} data - Entity data
 * @returns {object} Sanitized data
 */
function sanitizeUpdateData(entityName, data) {
    const config = getEntityConfig(entityName);
    const sanitized = { ...data };

    // Remove ID fields
    const idFieldVariations = [
        config.idField,
        'id',
        '_id',
        config.idField.toLowerCase(),
        config.idField.replace(/([A-Z])/g, '_$1').toLowerCase(),
    ];

    for (const idField of idFieldVariations) {
        if (sanitized[idField] !== undefined) {
            delete sanitized[idField];
        }
    }

    // Validate and sanitize fields based on entity type
    switch (entityName) {
        case 'zones':
            if (sanitized.zoneName !== undefined) {
                if (!sanitized.zoneName || String(sanitized.zoneName).trim() === '') {
                    throw new Error('zoneName cannot be empty');
                }
                sanitized.zoneName = String(sanitized.zoneName).trim();
            }
            break;

        case 'states':
            if (sanitized.stateName !== undefined) {
                if (!sanitized.stateName || String(sanitized.stateName).trim() === '') {
                    throw new Error('stateName cannot be empty');
                }
                sanitized.stateName = String(sanitized.stateName).trim();
            }
            if (sanitized.zoneId !== undefined) {
                sanitized.zoneId = parseInt(sanitized.zoneId);
            }
            break;

        case 'districts':
            if (sanitized.districtName !== undefined) {
                if (!sanitized.districtName || String(sanitized.districtName).trim() === '') {
                    throw new Error('districtName cannot be empty');
                }
                sanitized.districtName = String(sanitized.districtName).trim();
            }
            if (sanitized.stateId !== undefined) {
                sanitized.stateId = parseInt(sanitized.stateId);
            }
            if (sanitized.zoneId !== undefined) {
                sanitized.zoneId = parseInt(sanitized.zoneId);
            }
            break;

        case 'organizations':
            if (sanitized.orgName !== undefined) {
                if (!sanitized.orgName || String(sanitized.orgName).trim() === '') {
                    throw new Error('orgName cannot be empty');
                }
                sanitized.orgName = String(sanitized.orgName).trim();
            }
            if (sanitized.districtId !== undefined) {
                if (sanitized.districtId === null || sanitized.districtId === '') {
                    sanitized.districtId = null;
                } else {
                    sanitized.districtId = parseInt(sanitized.districtId);
                }
            }
            break;

        case 'universities':
            if (sanitized.universityName !== undefined) {
                if (!sanitized.universityName || String(sanitized.universityName).trim() === '') {
                    throw new Error('universityName cannot be empty');
                }
                sanitized.universityName = String(sanitized.universityName).trim();
            }
            if (sanitized.orgId !== undefined) {
                sanitized.orgId = parseInt(sanitized.orgId);
            }
            break;

        default:
            // For other entities, sanitize name field if provided
            if (config.nameField && sanitized[config.nameField] !== undefined) {
                const nameValue = String(sanitized[config.nameField]).trim();
                if (nameValue === '') {
                    throw new Error(`${config.nameField} cannot be empty`);
                }
                sanitized[config.nameField] = nameValue;
            }
    }

    // Ensure at least one field is being updated
    if (Object.keys(sanitized).length === 0) {
        throw new Error('No valid fields provided for update');
    }

    return sanitized;
}

/**
 * Update entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @param {object} data - Updated data
 * @returns {Promise<object>}
 */
async function update(entityName, id, data) {
    // Validate input
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new ValidationError('Invalid data: must be an object');
    }

    const config = getEntityConfig(entityName);
    const entityId = sanitizeInteger(id);
    
    if (!entityId || entityId === null || isNaN(entityId)) {
        throw new ValidationError(`Invalid ${config.idField}: ${id}`);
    }

    // Sanitize update data
    const sanitizedData = sanitizeUpdateData(entityName, data);

    // Ensure sanitizedData is not empty
    if (!sanitizedData || Object.keys(sanitizedData).length === 0) {
        throw new ValidationError('No valid fields provided for update');
    }

    return await prisma[config.model].update({
        where: { [config.idField]: entityId },
        data: sanitizedData,
        include: config.includes,
    });
}

/**
 * Check for dependent records before deletion
 * @param {string} entityName - Entity name
 * @param {object} config - Entity configuration
 * @param {number} id - Entity ID
 * @returns {Promise<object|null>} Dependent records info or null
 */
async function checkDependentRecords(entityName, config, id) {
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
}

/**
 * Delete entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<object>}
 */
async function deleteEntity(entityName, id) {
    const config = getEntityConfig(entityName);
    
    // Validate ID
    if (id === undefined || id === null || id === '') {
        throw new Error(`Cannot delete ${entityName}: missing ID field`);
    }
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        throw new Error(`Cannot delete ${entityName}: invalid ID: ${id}`);
    }
    
    // Note: With onDelete: SetNull in schema, dependent records will be automatically nullified
    try {
        return await prisma[config.model].delete({
            where: { [config.idField]: parsedId },
        });
    } catch (error) {
        // Handle foreign key constraint violations (if schema doesn't have SetNull)
        if (error.code === 'P2003') {
            throw new Error(`Cannot delete ${entityName}: has dependent records. Please try again or contact support.`);
        }
        // Handle record not found
        if (error.code === 'P2025') {
            throw new Error(`${entityName} not found`);
        }
        // Re-throw other errors
        throw error;
    }
}

/**
 * Find states by zone ID
 * @param {number} zoneId - Zone ID
 * @returns {Promise<Array>}
 */
async function findStatesByZone(zoneId) {
    return await prisma.stateMaster.findMany({
        where: { zoneId: parseInt(zoneId) },
        include: ENTITY_CONFIG.states.includes,
        orderBy: { stateName: 'asc' },
    });
}

/**
 * Find districts by state ID
 * @param {number} stateId - State ID
 * @returns {Promise<Array>}
 */
async function findDistrictsByState(stateId) {
    return await prisma.districtMaster.findMany({
        where: { stateId: parseInt(stateId) },
        include: ENTITY_CONFIG.districts.includes,
        orderBy: { districtName: 'asc' },
    });
}

/**
 * Find organizations by district ID
 * @param {number} districtId - District ID
 * @returns {Promise<Array>}
 */
async function findOrgsByDistrict(districtId) {
    return await prisma.orgMaster.findMany({
        where: { districtId: parseInt(districtId) },
        include: ENTITY_CONFIG.organizations.includes,
        orderBy: { orgName: 'asc' },
    });
}

/**
 * Find universities by organization ID
 * @param {number} orgId - Organization ID
 * @returns {Promise<Array>}
 */
async function findUniversitiesByOrg(orgId) {
    return await prisma.universityMaster.findMany({
        where: { orgId: parseInt(orgId) },
        include: ENTITY_CONFIG.universities.includes,
        orderBy: { universityName: 'asc' },
    });
}

/**
 * Check if entity name exists (for duplicate validation)
 * @param {string} entityName - Entity name
 * @param {string} name - Name to check
 * @param {number} excludeId - ID to exclude from check (for updates)
 * @param {object} additionalFilters - Additional filters (e.g., zoneId for states)
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
 * Get statistics for dashboard
 * @returns {Promise<object>}
 */
async function getStats() {
    const [zones, states, districts, organizations, universities] = await Promise.all([
        prisma.zone.count(),
        prisma.stateMaster.count(),
        prisma.districtMaster.count(),
        prisma.orgMaster.count(),
        prisma.universityMaster.count(),
    ]);

    return {
        zones,
        states,
        districts,
        organizations,
        universities,
    };
}

/**
 * Get full hierarchy tree
 * @returns {Promise<Array>}
 */
async function getHierarchy() {
    const zones = await prisma.zone.findMany({
        include: {
            states: {
                include: {
                    districts: {
                        include: {
                            orgs: {
                                include: {
                                    universities: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { zoneName: 'asc' },
    });

    return zones;
}

/**
 * Validate foreign key references
 * @param {string} entityName - Entity name
 * @param {object} data - Data to validate
 * @returns {Promise<boolean>}
 */
async function validateReferences(entityName, data) {
    switch (entityName) {
        case 'states':
            if (data.zoneId) {
                const zone = await prisma.zone.findUnique({
                    where: { zoneId: parseInt(data.zoneId) },
                });
                return !!zone;
            }
            break;

        case 'districts':
            if (data.stateId && data.zoneId) {
                const [state, zone] = await Promise.all([
                    prisma.stateMaster.findUnique({
                        where: { stateId: parseInt(data.stateId) },
                    }),
                    prisma.zone.findUnique({
                        where: { zoneId: parseInt(data.zoneId) },
                    }),
                ]);
                return !!(state && zone);
            }
            break;

        case 'organizations':
            if (data.districtId) {
                const district = await prisma.districtMaster.findUnique({
                    where: { districtId: parseInt(data.districtId) },
                });
                return !!district;
            }
            break;

        case 'universities':
            if (data.orgId) {
                const org = await prisma.orgMaster.findUnique({
                    where: { orgId: parseInt(data.orgId) },
                });
                if (!org) return false;
                return true;
            }
            break;

        default:
            return true;
    }

    return true;
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteEntity,
    findStatesByZone,
    findDistrictsByState,
    findOrgsByDistrict,
    findUniversitiesByOrg,
    nameExists,
    getStats,
    getHierarchy,
    validateReferences,
};
