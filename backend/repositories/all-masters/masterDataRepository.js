const prisma = require('../../config/prisma.js');

/**
 * Generic Master Data Repository
 * Ultra-optimized repository for all master data CRUD operations
 * Supports Zones, States, Districts, and Organizations
 */

// Entity configuration mapping
const ENTITY_CONFIG = {
    zones: {
        model: 'zone',
        idField: 'zoneId',
        nameField: 'zoneName',
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
