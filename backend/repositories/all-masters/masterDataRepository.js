const prisma = require('../../config/prisma.js');
const { sanitizeString, sanitizeInteger, safeGet } = require('../../utils/dataSanitizer.js');
const { ValidationError, translatePrismaError } = require('../../utils/errorHandler.js');

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
        allowedFields: [
            'universityName',
            'orgId',
            'hostOrg',
            'hostMobile',
            'hostLandline',
            'hostFax',
            'hostEmail',
            'hostAddress',
        ],
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

const ENTITY_RESOURCE_NAMES = {
    zones: 'Zone',
    states: 'State',
    districts: 'District',
    organizations: 'Organization',
    universities: 'University',
};

function getEntityResourceName(entityName) {
    return ENTITY_RESOURCE_NAMES[entityName] || 'Resource';
}

function isPrismaError(error) {
    return typeof error?.code === 'string' && /^P\d{4}$/.test(error.code);
}

function rethrowRepositoryError(error, entityName, operation) {
    // Keep domain errors untouched.
    if (error instanceof ValidationError || error?.statusCode) {
        throw error;
    }

    // Normalize all Prisma errors through shared translator.
    if (isPrismaError(error)) {
        throw translatePrismaError(error, getEntityResourceName(entityName), operation);
    }

    throw error;
}

async function withRepositoryErrorHandling(entityName, operation, executor) {
    try {
        return await executor();
    } catch (error) {
        rethrowRepositoryError(error, entityName, operation);
    }
}

function parseRequiredEntityId(id, idField, action = 'process') {
    if (id === undefined || id === null || id === '') {
        throw new ValidationError(`Missing ${idField} for ${action}`, idField);
    }

    const parsedId = sanitizeInteger(id);
    if (!parsedId || isNaN(parsedId)) {
        throw new ValidationError(`Invalid ${idField}: ${id}`, idField);
    }

    return parsedId;
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
    return withRepositoryErrorHandling(entityName, 'fetch', async () => {
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
    });
}

/**
 * Find entity by ID
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<object|null>}
 */
async function findById(entityName, id) {
    const config = getEntityConfig(entityName);
    const parsedId = parseRequiredEntityId(id, config.idField, 'lookup');

    return withRepositoryErrorHandling(entityName, 'fetch', async () => {
        return await prisma[config.model].findUnique({
            where: { [config.idField]: parsedId },
            include: config.includes,
        });
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
    const sanitized = {};

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
            }
            break;

        case 'universities':
            if (!data.universityName || String(data.universityName).trim() === '') {
                throw new Error('universityName is required');
            }
            if (!data.orgId) {
                throw new Error('orgId is required');
            }
            // Optionals
            const hostMobile = sanitizeString(safeGet(data, 'hostMobile'), { maxLength: 30 });
            const hostLandline = sanitizeString(safeGet(data, 'hostLandline'), { maxLength: 30 });
            const hostFax = sanitizeString(safeGet(data, 'hostFax'), { maxLength: 30 });
            const hostEmail = sanitizeString(safeGet(data, 'hostEmail'), { maxLength: 200 });
            const hostAddress = sanitizeString(safeGet(data, 'hostAddress'), { maxLength: 1000 });
            if (hostEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(hostEmail)) {
                    throw new Error('hostEmail must be a valid email address');
                }
            }
            sanitized.universityName = String(data.universityName).trim();
            sanitized.orgId = parseInt(data.orgId);
            // Derive hostOrg from universityName to avoid duplicate input
            sanitized.hostOrg = sanitized.universityName;
            sanitized.hostMobile = hostMobile;
            sanitized.hostLandline = hostLandline;
            sanitized.hostFax = hostFax;
            sanitized.hostEmail = hostEmail;
            sanitized.hostAddress = hostAddress;
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
    const prismaData = convertRelationIdsToNestedWrites(entityName, sanitizedData, 'create');

    // Ensure sanitizedData is not empty
    if (!prismaData || Object.keys(prismaData).length === 0) {
        throw new ValidationError('No valid data provided for creation');
    }

    return withRepositoryErrorHandling(entityName, 'create', async () => {
        return await prisma[config.model].create({
            data: prismaData,
            include: config.includes,
        });
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
    const sanitized = {};

    // Validate and sanitize fields based on entity type
    switch (entityName) {
        case 'zones':
            if (data.zoneName !== undefined) {
                if (!data.zoneName || String(data.zoneName).trim() === '') {
                    throw new Error('zoneName cannot be empty');
                }
                sanitized.zoneName = String(data.zoneName).trim();
            }
            break;

        case 'states':
            if (data.stateName !== undefined) {
                if (!data.stateName || String(data.stateName).trim() === '') {
                    throw new Error('stateName cannot be empty');
                }
                sanitized.stateName = String(data.stateName).trim();
            }
            if (data.zoneId !== undefined) {
                sanitized.zoneId = parseInt(data.zoneId);
            }
            break;

        case 'districts':
            if (data.districtName !== undefined) {
                if (!data.districtName || String(data.districtName).trim() === '') {
                    throw new Error('districtName cannot be empty');
                }
                sanitized.districtName = String(data.districtName).trim();
            }
            if (data.stateId !== undefined) {
                sanitized.stateId = parseInt(data.stateId);
            }
            if (data.zoneId !== undefined) {
                sanitized.zoneId = parseInt(data.zoneId);
            }
            break;

        case 'organizations':
            if (data.orgName !== undefined) {
                if (!data.orgName || String(data.orgName).trim() === '') {
                    throw new Error('orgName cannot be empty');
                }
                sanitized.orgName = String(data.orgName).trim();
            }
            if (data.districtId !== undefined) {
                if (data.districtId === null || data.districtId === '') {
                    sanitized.districtId = null;
                } else {
                    sanitized.districtId = parseInt(data.districtId);
                }
            }
            break;

        case 'universities':
            if (data.universityName !== undefined) {
                if (!data.universityName || String(data.universityName).trim() === '') {
                    throw new Error('universityName cannot be empty');
                }
                sanitized.universityName = String(data.universityName).trim();
                // Keep hostOrg in sync with universityName
                sanitized.hostOrg = sanitized.universityName;
            }
            if (data.orgId !== undefined) {
                sanitized.orgId = parseInt(data.orgId);
            }
            if (data.hostMobile !== undefined) {
                sanitized.hostMobile = sanitizeString(data.hostMobile, { maxLength: 30 });
            }
            if (data.hostLandline !== undefined) {
                sanitized.hostLandline = sanitizeString(data.hostLandline, { maxLength: 30 });
            }
            if (data.hostFax !== undefined) {
                sanitized.hostFax = sanitizeString(data.hostFax, { maxLength: 30 });
            }
            if (data.hostEmail !== undefined) {
                const email = sanitizeString(data.hostEmail, { maxLength: 200 });
                if (email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        throw new Error('hostEmail must be a valid email address');
                    }
                }
                sanitized.hostEmail = email;
            }
            if (data.hostAddress !== undefined) {
                sanitized.hostAddress = sanitizeString(data.hostAddress, { maxLength: 1000 });
            }
            break;

        default:
            // For other entities, sanitize name field if provided
            if (config.nameField && data[config.nameField] !== undefined) {
                const nameValue = String(data[config.nameField]).trim();
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
 * Convert scalar relation IDs into Prisma nested relation write operations.
 * Prisma checked create/update inputs reject direct FK fields like districtId.
 * @param {string} entityName - Entity name
 * @param {object} data - Sanitized scalar payload
 * @param {'create'|'update'} operation - Write operation type
 * @returns {object} Prisma-compatible payload
 */
function convertRelationIdsToNestedWrites(entityName, data, operation) {
    const converted = { ...data };

    if (entityName === 'states' && converted.zoneId !== undefined) {
        converted.zone = { connect: { zoneId: converted.zoneId } };
        delete converted.zoneId;
    }

    if (entityName === 'districts') {
        if (converted.stateId !== undefined) {
            converted.state = { connect: { stateId: converted.stateId } };
            delete converted.stateId;
        }
        if (converted.zoneId !== undefined) {
            converted.zone = { connect: { zoneId: converted.zoneId } };
            delete converted.zoneId;
        }
    }

    if (entityName === 'organizations' && converted.districtId !== undefined) {
        if (operation === 'update' && converted.districtId === null) {
            converted.district = { disconnect: true };
        } else if (converted.districtId !== null) {
            converted.district = { connect: { districtId: converted.districtId } };
        }
        delete converted.districtId;
    }

    if (entityName === 'universities' && converted.orgId !== undefined) {
        converted.organization = { connect: { orgId: converted.orgId } };
        delete converted.orgId;
    }

    return converted;
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
    const prismaData = convertRelationIdsToNestedWrites(entityName, sanitizedData, 'update');

    // Ensure sanitizedData is not empty
    if (!prismaData || Object.keys(prismaData).length === 0) {
        throw new ValidationError('No valid fields provided for update');
    }

    return withRepositoryErrorHandling(entityName, 'update', async () => {
        return await prisma[config.model].update({
            where: { [config.idField]: entityId },
            data: prismaData,
            include: config.includes,
        });
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
        const entity = await withRepositoryErrorHandling(entityName, 'fetch', async () => {
            return await prisma[config.model].findUnique({
                where: { [config.idField]: id },
                select: { 
                    _count: {
                        select: config.includes._count.select
                    }
                },
            });
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

    const parsedId = parseRequiredEntityId(id, config.idField, 'delete');

    // With onDelete: SetNull, most dependent records are nullified automatically.
    return withRepositoryErrorHandling(entityName, 'delete', async () => {
        return await prisma[config.model].delete({
            where: { [config.idField]: parsedId },
        });
    });
}

/**
 * Find states by zone ID
 * @param {number} zoneId - Zone ID
 * @returns {Promise<Array>}
 */
async function findStatesByZone(zoneId) {
    const parsedZoneId = parseRequiredEntityId(zoneId, 'zoneId', 'lookup');
    return withRepositoryErrorHandling('states', 'fetch', async () => {
        return await prisma.stateMaster.findMany({
            where: { zoneId: parsedZoneId },
            include: ENTITY_CONFIG.states.includes,
            orderBy: { stateName: 'asc' },
        });
    });
}

/**
 * Find districts by state ID
 * @param {number} stateId - State ID
 * @returns {Promise<Array>}
 */
async function findDistrictsByState(stateId) {
    const parsedStateId = parseRequiredEntityId(stateId, 'stateId', 'lookup');
    return withRepositoryErrorHandling('districts', 'fetch', async () => {
        return await prisma.districtMaster.findMany({
            where: { stateId: parsedStateId },
            include: ENTITY_CONFIG.districts.includes,
            orderBy: { districtName: 'asc' },
        });
    });
}

/**
 * Find organizations by district ID
 * @param {number} districtId - District ID
 * @returns {Promise<Array>}
 */
async function findOrgsByDistrict(districtId) {
    const parsedDistrictId = parseRequiredEntityId(districtId, 'districtId', 'lookup');
    return withRepositoryErrorHandling('organizations', 'fetch', async () => {
        return await prisma.orgMaster.findMany({
            where: { districtId: parsedDistrictId },
            include: ENTITY_CONFIG.organizations.includes,
            orderBy: { orgName: 'asc' },
        });
    });
}

/**
 * Find universities by organization ID
 * @param {number} orgId - Organization ID
 * @returns {Promise<Array>}
 */
async function findUniversitiesByOrg(orgId) {
    const parsedOrgId = parseRequiredEntityId(orgId, 'orgId', 'lookup');
    return withRepositoryErrorHandling('universities', 'fetch', async () => {
        return await prisma.universityMaster.findMany({
            where: { orgId: parsedOrgId },
            include: ENTITY_CONFIG.universities.includes,
            orderBy: { universityName: 'asc' },
        });
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

    return withRepositoryErrorHandling(entityName, 'validate', async () => {
        const count = await prisma[config.model].count({ where });
        return count > 0;
    });
}

/**
 * Get statistics for dashboard
 * @returns {Promise<object>}
 */
async function getStats() {
    return withRepositoryErrorHandling('zones', 'fetch', async () => {
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
    });
}

/**
 * Get full hierarchy tree
 * @returns {Promise<Array>}
 */
async function getHierarchy() {
    return withRepositoryErrorHandling('zones', 'fetch', async () => {
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
    });
}

/**
 * Validate foreign key references
 * @param {string} entityName - Entity name
 * @param {object} data - Data to validate
 * @returns {Promise<boolean>}
 */
async function validateReferences(entityName, data) {
    return withRepositoryErrorHandling(entityName, 'validate', async () => {
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
                    return !!org;
                }
                break;

            default:
                return true;
        }

        return true;
    });
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
