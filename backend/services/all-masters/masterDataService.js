const masterDataRepository = require('../../repositories/all-masters/masterDataRepository.js');
const prisma = require('../../config/prisma.js');

/**
 * Generic Master Data Service
 * Business logic layer with validation, error handling, and cascade delete operations
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Entity configuration mapping
 */
const ENTITY_CONFIG = {
    zones: {
        nameField: 'zoneName',
        idField: 'zoneId',
        singular: 'zone',
        children: ['states', 'districts'],
        kvkField: 'zoneId',
    },
    states: {
        nameField: 'stateName',
        idField: 'stateId',
        singular: 'state',
        children: ['districts'],
        kvkField: 'stateId',
        parentField: 'zoneId',
    },
    districts: {
        nameField: 'districtName',
        idField: 'districtId',
        singular: 'district',
        children: ['organizations'],
        kvkField: 'districtId',
        parentField: 'stateId',
    },
    organizations: {
        nameField: 'orgName',
        idField: 'orgId',
        singular: 'organization',
        children: ['universities'],
        kvkField: 'orgId',
        parentField: 'districtId',
    },
    universities: {
        nameField: 'universityName',
        idField: 'universityId',
        singular: 'university',
        children: [],
        kvkField: 'universityId',
        parentField: 'orgId',
    },
};

/**
 * Validation rules for each entity
 */
const VALIDATION_RULES = {
    zones: {
        required: ['zoneName'],
        minLength: { zoneName: 2 },
        maxLength: { zoneName: 100 },
    },
    states: {
        required: ['stateName', 'zoneId'],
        minLength: { stateName: 2 },
        maxLength: { stateName: 100 },
    },
    districts: {
        required: ['districtName', 'stateId', 'zoneId'],
        minLength: { districtName: 2 },
        maxLength: { districtName: 100 },
    },
    organizations: {
        required: ['orgName', 'districtId'],
        minLength: { orgName: 2 },
        maxLength: { orgName: 200 },
    },
    universities: {
        required: ['universityName', 'orgId'],
        minLength: { universityName: 2 },
        maxLength: { universityName: 200 },
    },
};

/**
 * Cascade delete hierarchy mapping
 */
const CASCADE_HIERARCHY = {
    universities: {
        childModel: null,
        childIdField: null,
        cascadeFn: null,
    },
    organizations: {
        childModel: 'universityMaster',
        childIdField: 'universityId',
        parentField: 'orgId',
        cascadeFn: 'cascadeDeleteUniversities',
    },
    districts: {
        childModel: 'orgMaster',
        childIdField: 'orgId',
        parentField: 'districtId',
        cascadeFn: 'cascadeDeleteOrganizations',
    },
    states: {
        childModel: 'districtMaster',
        childIdField: 'districtId',
        parentField: 'stateId',
        cascadeFn: 'cascadeDeleteDistricts',
    },
    zones: {
        childModel: null, // Special case - has both states and districts
        cascadeFn: 'cascadeDeleteZone',
    },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get entity configuration
 */
function getEntityConfig(entityName) {
    const config = ENTITY_CONFIG[entityName];
    if (!config) {
        throw new Error(`Invalid entity name: ${entityName}`);
    }
    return config;
}

/**
 * Get entity name field
 */
function getNameField(entityName) {
    return getEntityConfig(entityName).nameField;
}

/**
 * Get entity ID field
 */
function getEntityIdField(entityName) {
    return getEntityConfig(entityName).idField;
}

/**
 * Get entity singular name
 */
function getEntitySingular(entityName) {
    return getEntityConfig(entityName).singular;
}

/**
 * Normalize boolean value from various formats
 */
function normalizeBoolean(value, defaultValue = true) {
    if (value === false || value === 'false' || value === 0 || value === '0') {
        return false;
    }
    return defaultValue;
}

/**
 * Create user-friendly error message
 */
function createUserFriendlyError(error, entityName) {
    const singular = getEntitySingular(entityName);
    
    if (error.code === 'P2025') {
        return new Error(`${singular} not found or already deleted`);
    }
    
    if (error.message && !error.message.includes('prisma') && !error.message.includes('invocation')) {
        return error;
    }
    
    return new Error(`Failed to delete ${singular}: ${error.message || 'Unknown error'}`);
}

/**
 * Get unique constraint filters for duplicate checking
 */
function getUniqueFilters(entityName, data) {
    const config = getEntityConfig(entityName);
    if (!config.parentField) return {};
    
    const parentValue = data[config.parentField];
    return parentValue ? { [config.parentField]: parseInt(parentValue) } : {};
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate entity data
 */
function validateData(entityName, data) {
    const rules = VALIDATION_RULES[entityName];
    if (!rules) {
        throw new Error(`No validation rules for entity: ${entityName}`);
    }

    // Check required fields
    for (const field of rules.required) {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
            throw new Error(`${field} is required`);
        }
    }

    // Check min length
    if (rules.minLength) {
        for (const [field, minLen] of Object.entries(rules.minLength)) {
            if (data[field] && data[field].length < minLen) {
                throw new Error(`${field} must be at least ${minLen} characters`);
            }
        }
    }

    // Check max length
    if (rules.maxLength) {
        for (const [field, maxLen] of Object.entries(rules.maxLength)) {
            if (data[field] && data[field].length > maxLen) {
                throw new Error(`${field} must not exceed ${maxLen} characters`);
            }
        }
    }
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all entities with pagination and filtering
 */
async function getAllEntities(entityName, options = {}) {
    try {
        const { data, total } = await masterDataRepository.findAll(entityName, options);
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            meta: { page, limit, total, totalPages },
        };
    } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        throw new Error(`Failed to fetch ${entityName}: ${error.message}`);
    }
}

/**
 * Get entity by ID
 */
async function getEntityById(entityName, id) {
    try {
        const entity = await masterDataRepository.findById(entityName, id);
        if (!entity) {
            throw new Error(`${getEntitySingular(entityName)} not found`);
        }
        return entity;
    } catch (error) {
        console.error(`Error fetching ${entityName} by ID:`, error);
        throw error;
    }
}

/**
 * Create new entity
 */
async function createEntity(entityName, data, userId) {
    try {
        validateData(entityName, data);

        // Validate foreign key references
        const validRefs = await masterDataRepository.validateReferences(entityName, data);
        if (!validRefs) {
            throw new Error('Invalid reference IDs provided');
        }

        // Check for duplicate name
        const nameField = getNameField(entityName);
        const additionalFilters = getUniqueFilters(entityName, data);
        const exists = await masterDataRepository.nameExists(
            entityName,
            data[nameField],
            null,
            additionalFilters
        );

        if (exists) {
            throw new Error(`${nameField} already exists`);
        }

        return await masterDataRepository.create(entityName, data);
    } catch (error) {
        console.error(`Error creating ${entityName}:`, error);
        throw error;
    }
}

/**
 * Update entity
 */
async function updateEntity(entityName, id, data, userId) {
    try {
        const existing = await masterDataRepository.findById(entityName, id);
        if (!existing) {
            throw new Error(`${getEntitySingular(entityName)} not found`);
        }

        validateData(entityName, data);

        // Validate foreign key references
        const validRefs = await masterDataRepository.validateReferences(entityName, data);
        if (!validRefs) {
            throw new Error('Invalid reference IDs provided');
        }

        // Check for duplicate name (excluding current entity)
        const nameField = getNameField(entityName);
        if (data[nameField]) {
            const additionalFilters = getUniqueFilters(entityName, data);
            const exists = await masterDataRepository.nameExists(
                entityName,
                data[nameField],
                id,
                additionalFilters
            );

            if (exists) {
                throw new Error(`${nameField} already exists`);
            }
        }

        return await masterDataRepository.update(entityName, id, data);
    } catch (error) {
        console.error(`Error updating ${entityName}:`, error);
        throw error;
    }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Check if entity has dependent records
 */
async function checkDependents(entityName, entity) {
    const counts = entity._count || {};
    const entityId = entity[getEntityIdField(entityName)];
    const config = getEntityConfig(entityName);

    // Model name mapping
    const modelMap = {
        zones: 'zone',
        states: 'stateMaster',
        districts: 'districtMaster',
        organizations: 'orgMaster',
        universities: 'universityMaster',
    };

    // If _count is available, use it
    if (entity._count) {
        const dependentCounts = config.children.map(child => {
            const childName = child === 'states' ? 'states' :
                            child === 'districts' ? 'districts' :
                            child === 'organizations' ? 'orgs' :
                            child === 'universities' ? 'universities' : child;
            return counts[childName] || 0;
        });
        const userCount = counts.users || 0;
        const kvkCount = counts.kvks || 0;
        return dependentCounts.some(count => count > 0) || userCount > 0 || kvkCount > 0;
    }

    // Otherwise, query directly
    const queries = [];
    
    // Check children entities
    for (const child of config.children) {
        const childModel = modelMap[child];
        if (childModel) {
            queries.push(
                prisma[childModel].count({
                    where: { [config.idField]: entityId }
                })
            );
        }
    }

    // Check users
    queries.push(prisma.user.count({ where: { [config.idField]: entityId } }));

    // Check KVKs
    queries.push(prisma.kvk.count({ where: { [config.kvkField]: entityId } }));

    const results = await Promise.all(queries);
    return results.some(count => count > 0);
}

/**
 * Delete KVKs by a given field
 * Deletes all KVK-related records in the correct order
 */
async function deleteKvksByField(field, value) {
    const kvks = await prisma.kvk.findMany({
        where: { [field]: value },
        select: { kvkId: true }
    });

    const kvkIds = kvks.map(k => k.kvkId);
    if (kvkIds.length === 0) return;

    // Get staff IDs
    const staffWithKvk = await prisma.kvkStaff.findMany({
        where: {
            OR: [
                { kvkId: { in: kvkIds } },
                { originalKvkId: { in: kvkIds } }
            ]
        },
        select: { kvkStaffId: true }
    });
    const staffIds = staffWithKvk.map(s => s.kvkStaffId);

    // Delete in order: child records first, then parent records
    const deleteOperations = [
        // 1. Staff transfer history
        prisma.staffTransferHistory.deleteMany({
            where: {
                OR: staffIds.length > 0 ? [
                    { kvkStaffId: { in: staffIds } },
                    { fromKvkId: { in: kvkIds } },
                    { toKvkId: { in: kvkIds } }
                ] : [
                    { fromKvkId: { in: kvkIds } },
                    { toKvkId: { in: kvkIds } }
                ]
            }
        }),
        // 2. HRD programs
        prisma.hrdProgram.deleteMany({
            where: staffIds.length > 0 ? {
                OR: [
                    { kvkId: { in: kvkIds } },
                    { kvkStaffId: { in: staffIds } }
                ]
            } : { kvkId: { in: kvkIds } }
        }),
        // 3. KVK staff
        prisma.kvkStaff.deleteMany({
            where: {
                OR: [
                    { kvkId: { in: kvkIds } },
                    { originalKvkId: { in: kvkIds } }
                ]
            }
        }),
        // 4. Training achievements
        prisma.trainingAchievement.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        // 5. Awards
        prisma.farmerAward.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        prisma.kvkAward.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        prisma.scientistAward.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        // 6. Infrastructure
        prisma.kvkInfrastructure.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        // 7. Equipment
        prisma.kvkEquipment.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        // 8. Vehicles
        prisma.kvkVehicle.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        // 9. Bank accounts
        prisma.kvkBankAccount.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        // 10. Farm implements
        prisma.kvkFarmImplement.deleteMany({ where: { kvkId: { in: kvkIds } } }),
        // 11. KVKs themselves
        prisma.kvk.deleteMany({ where: { [field]: value } })
    ];

    await Promise.all(deleteOperations);
}

/**
 * Nullify user field
 */
async function nullifyUserField(field, value) {
    await prisma.user.updateMany({
        where: { [field]: value },
        data: { [field]: null }
    });
}

/**
 * Cascade delete universities (children of organizations)
 */
async function cascadeDeleteUniversities(universityIds) {
    if (!universityIds || universityIds.length === 0) return;

    // Delete KVKs and nullify users for each university
    await Promise.all(
        universityIds.map(async (universityId) => {
            await deleteKvksByField('universityId', universityId);
            await nullifyUserField('universityId', universityId);
        })
    );

    // Delete universities
    await prisma.universityMaster.deleteMany({
        where: { universityId: { in: universityIds } }
    });
}

/**
 * Cascade delete organizations (children of districts)
 */
async function cascadeDeleteOrganizations(orgIds) {
    if (!orgIds || orgIds.length === 0) return;

    // Get universities for these organizations
    const universities = await prisma.universityMaster.findMany({
        where: { orgId: { in: orgIds } },
        select: { universityId: true }
    });
    const universityIds = universities.map(u => u.universityId);

    // Cascade delete universities
    if (universityIds.length > 0) {
        await cascadeDeleteUniversities(universityIds);
    }

    // Delete KVKs and nullify users for organizations
    await Promise.all(
        orgIds.map(async (orgId) => {
            await deleteKvksByField('orgId', orgId);
            await nullifyUserField('orgId', orgId);
        })
    );
}

/**
 * Cascade delete districts (children of states)
 */
async function cascadeDeleteDistricts(districtIds) {
    if (!districtIds || districtIds.length === 0) return;

    // Get organizations for these districts
    const organizations = await prisma.orgMaster.findMany({
        where: { districtId: { in: districtIds } },
        select: { orgId: true }
    });
    const orgIds = organizations.map(o => o.orgId);

    // Cascade delete organizations
    if (orgIds.length > 0) {
        await cascadeDeleteOrganizations(orgIds);
        await prisma.orgMaster.deleteMany({
            where: { orgId: { in: orgIds } }
        });
    }

    // Delete KVKs and nullify users for districts
    await Promise.all(
        districtIds.map(async (districtId) => {
            await deleteKvksByField('districtId', districtId);
            await nullifyUserField('districtId', districtId);
        })
    );
}

/**
 * Cascade delete states (children of zones)
 */
async function cascadeDeleteStates(stateIds) {
    if (!stateIds || stateIds.length === 0) return;

    // Get districts for these states
    const districts = await prisma.districtMaster.findMany({
        where: { stateId: { in: stateIds } },
        select: { districtId: true }
    });
    const districtIds = districts.map(d => d.districtId);

    // Cascade delete districts
    if (districtIds.length > 0) {
        await cascadeDeleteDistricts(districtIds);
        await prisma.districtMaster.deleteMany({
            where: { districtId: { in: districtIds } }
        });
    }

    // Delete KVKs and nullify users for states
    await Promise.all(
        stateIds.map(async (stateId) => {
            await deleteKvksByField('stateId', stateId);
            await nullifyUserField('stateId', stateId);
        })
    );
}

/**
 * Cascade delete zone (special case - has both states and districts)
 */
async function cascadeDeleteZone(zoneId) {
    // Get all states and districts for this zone
    const [states, districts] = await Promise.all([
        prisma.stateMaster.findMany({
            where: { zoneId },
            select: { stateId: true }
        }),
        prisma.districtMaster.findMany({
            where: { zoneId },
            select: { districtId: true }
        })
    ]);

    const stateIds = states.map(s => s.stateId);
    const districtIds = districts.map(d => d.districtId);

    // Cascade delete states
    if (stateIds.length > 0) {
        await cascadeDeleteStates(stateIds);
        await prisma.stateMaster.deleteMany({
            where: { stateId: { in: stateIds } }
        });
    }

    // Cascade delete districts
    if (districtIds.length > 0) {
        await cascadeDeleteDistricts(districtIds);
        await prisma.districtMaster.deleteMany({
            where: { districtId: { in: districtIds } }
        });
    }

    // Delete KVKs and nullify users for zone
    await deleteKvksByField('zoneId', zoneId);
    await nullifyUserField('zoneId', zoneId);
}

/**
 * Comprehensive cascade delete entity and all related records
 */
async function cascadeDeleteEntity(entityName, entityId) {
    const id = parseInt(entityId, 10);
    if (isNaN(id)) {
        throw new Error(`Invalid ID: ${entityId}`);
    }

    try {
        switch (entityName) {
            case 'zones':
                await cascadeDeleteZone(id);
                break;
            case 'states':
                await cascadeDeleteStates([id]);
                break;
            case 'districts':
                await cascadeDeleteDistricts([id]);
                break;
            case 'organizations':
                await cascadeDeleteOrganizations([id]);
                break;
            case 'universities':
                await deleteKvksByField('universityId', id);
                await nullifyUserField('universityId', id);
                break;
            default:
                throw new Error(`Cascade delete not supported for ${entityName}`);
        }
    } catch (error) {
        console.error(`Error in cascade delete for ${entityName}:`, error);
        throw error;
    }
}

/**
 * Delete entity with cascade support
 */
async function deleteEntity(entityName, id, userId, cascade = false) {
    try {
        const entityId = parseInt(id, 10);
        if (isNaN(entityId)) {
            throw new Error(`Invalid ID: ${id}`);
        }

        // Check if entity exists
        const existing = await masterDataRepository.findById(entityName, entityId);
        if (!existing) {
            throw new Error(`${getEntitySingular(entityName)} not found`);
        }

        // Normalize cascade parameter
        const shouldCascade = normalizeBoolean(cascade, true);
        const hasDependents = await checkDependents(entityName, existing);

        // Perform cascade delete if needed
        if (hasDependents || shouldCascade) {
            await cascadeDeleteEntity(entityName, entityId);
        }

        // Delete the entity itself
        try {
            await masterDataRepository.deleteEntity(entityName, entityId);
        } catch (deleteError) {
            if (deleteError.code === 'P2025') {
                throw new Error(`${getEntitySingular(entityName)} not found or already deleted`);
            }
            throw deleteError;
        }
    } catch (error) {
        console.error(`[deleteEntity] Error deleting ${entityName}:`, error);
        throw createUserFriendlyError(error, entityName);
    }
}

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

/**
 * Generic error handler wrapper for repository calls
 */
async function handleRepositoryCall(fn, operation, entityName) {
    try {
        return await fn();
    } catch (error) {
        console.error(`Error ${operation} ${entityName}:`, error);
        throw new Error(`Failed to ${operation} ${entityName}: ${error.message}`);
    }
}

/**
 * Get states by zone
 */
async function getStatesByZone(zoneId) {
    return handleRepositoryCall(
        () => masterDataRepository.findStatesByZone(zoneId),
        'fetching',
        'states'
    );
}

/**
 * Get districts by state
 */
async function getDistrictsByState(stateId) {
    return handleRepositoryCall(
        () => masterDataRepository.findDistrictsByState(stateId),
        'fetching',
        'districts'
    );
}

/**
 * Get organizations by district
 */
async function getOrgsByDistrict(districtId) {
    return handleRepositoryCall(
        () => masterDataRepository.findOrgsByDistrict(districtId),
        'fetching',
        'organizations'
    );
}

/**
 * Get universities by organization
 */
async function getUniversitiesByOrg(orgId) {
    return handleRepositoryCall(
        () => masterDataRepository.findUniversitiesByOrg(orgId),
        'fetching',
        'universities'
    );
}

/**
 * Get statistics
 */
async function getStats() {
    return handleRepositoryCall(
        () => masterDataRepository.getStats(),
        'fetching',
        'statistics'
    );
}

/**
 * Get hierarchy
 */
async function getHierarchy() {
    return handleRepositoryCall(
        () => masterDataRepository.getHierarchy(),
        'fetching',
        'hierarchy'
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity,
    getStatesByZone,
    getDistrictsByState,
    getOrgsByDistrict,
    getUniversitiesByOrg,
    getStats,
    getHierarchy,
};
