const masterDataRepository = require('../../repositories/all-masters/masterDataRepository.js');

/**
 * Generic Master Data Service
 * Business logic layer with validation and error handling
 */

// Validation schemas for each entity
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
 * Validate entity data
 * @param {string} entityName - Entity name
 * @param {object} data - Data to validate
 * @throws {Error} Validation error
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

/**
 * Get all entities with pagination and filtering
 * @param {string} entityName - Entity name
 * @param {object} options - Query options
 * @returns {Promise<{data: Array, meta: object}>}
 */
async function getAllEntities(entityName, options = {}) {
    try {
        const { data, total } = await masterDataRepository.findAll(entityName, options);

        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        throw new Error(`Failed to fetch ${entityName}: ${error.message}`);
    }
}

/**
 * Get entity by ID
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<object>}
 */
async function getEntityById(entityName, id) {
    try {
        const entity = await masterDataRepository.findById(entityName, id);

        if (!entity) {
            throw new Error(`${entityName.slice(0, -1)} not found`);
        }

        return entity;
    } catch (error) {
        console.error(`Error fetching ${entityName} by ID:`, error);
        throw error;
    }
}

/**
 * Create new entity
 * @param {string} entityName - Entity name
 * @param {object} data - Entity data
 * @param {number} userId - User ID creating the entity
 * @returns {Promise<object>}
 */
async function createEntity(entityName, data, userId) {
    try {
        // Validate data
        validateData(entityName, data);

        // Additional validation for universities
        if (entityName === 'universities' && data.orgId) {
            const org = await masterDataRepository.findById('organizations', data.orgId);
            if (!org) {
                throw new Error('Organization not found');
            }
        }

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

        // Create entity
        const entity = await masterDataRepository.create(entityName, data);


        return entity;
    } catch (error) {
        console.error(`Error creating ${entityName}:`, error);
        throw error;
    }
}

/**
 * Update entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @param {object} data - Updated data
 * @param {number} userId - User ID updating the entity
 * @returns {Promise<object>}
 */
async function updateEntity(entityName, id, data, userId) {
    try {
        // Check if entity exists
        const existing = await masterDataRepository.findById(entityName, id);
        if (!existing) {
            throw new Error(`${entityName.slice(0, -1)} not found`);
        }

        // Validate data
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

        // Update entity
        const entity = await masterDataRepository.update(entityName, id, data);

        return entity;
    } catch (error) {
        console.error(`Error updating ${entityName}:`, error);
        throw error;
    }
}

/**
 * Delete entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @param {number} userId - User ID deleting the entity
 * @param {boolean} cascade - If true, delete all related records (cascade delete)
 * @returns {Promise<void>}
 */
async function deleteEntity(entityName, id, userId, cascade = false) {
    try {
        // Ensure id is an integer
        const entityId = parseInt(id, 10);
        if (isNaN(entityId)) {
            throw new Error(`Invalid ID: ${id}`);
        }

        console.log(`[deleteEntity] Starting delete for ${entityName} ID ${entityId}, cascade=${cascade}, cascade type=${typeof cascade}`);

        // Check if entity exists
        const existing = await masterDataRepository.findById(entityName, entityId);
        if (!existing) {
            throw new Error(`${entityName.slice(0, -1)} not found`);
        }

        // Normalize cascade to boolean
        const shouldCascade = cascade === true || cascade === 'true' || cascade === 1 || cascade === '1';
        console.log(`[deleteEntity] ${entityName} ID ${entityId} - cascade parameter: ${cascade}, normalized: ${shouldCascade}`);
        
        // Check if entity has dependent records
        const hasDependents = await checkDependents(entityName, existing);
        console.log(`[deleteEntity] ${entityName} ID ${entityId} has dependents: ${hasDependents}`);
        
        // If cascade delete is requested, delete all related records first
        if (shouldCascade) {
            console.log(`[deleteEntity] Cascade delete requested for ${entityName} ID ${entityId}`);
            if (hasDependents) {
                await cascadeDeleteEntity(entityName, entityId);
            }
            // Proceed with deletion regardless of dependents when cascade is true
        } else if (hasDependents) {
            // Only throw error if cascade is false and there are dependents
            console.log(`[deleteEntity] Cannot delete ${entityName} ID ${entityId} - has dependents and cascade is false`);
            throw new Error(`Cannot delete ${entityName.slice(0, -1)} with existing dependent records`);
        }

        // Delete entity
        console.log(`[deleteEntity] Deleting ${entityName} ID ${entityId}`);
        await masterDataRepository.deleteEntity(entityName, entityId);
        console.log(`[deleteEntity] Successfully deleted ${entityName} ID ${entityId}`);

    } catch (error) {
        console.error(`[deleteEntity] Error deleting ${entityName}:`, error);
        throw error;
    }
}

/**
 * Helper: Delete KVKs by a given field
 * This function deletes all KVK-related records before deleting the KVK itself
 * @param {object} prisma - Prisma client
 * @param {string} field - Field name (zoneId, stateId, districtId, orgId, universityId)
 * @param {number} value - Field value
 */
async function deleteKvksByField(prisma, field, value) {
    // First, find all KVKs that match the field
    const kvks = await prisma.kvk.findMany({
        where: { [field]: value },
        select: { kvkId: true }
    });

    const kvkIds = kvks.map(k => k.kvkId);

    if (kvkIds.length === 0) {
        return; // No KVKs to delete
    }

    // Delete all KVK-related records in the correct order to respect foreign key constraints
    // Order matters: delete child records before parent records
    
    // 1. Delete staff transfer history first (references kvkStaffId, fromKvkId, toKvkId)
    //    We need to get all staff IDs first, then delete transfers
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
    
    if (staffIds.length > 0) {
        await prisma.staffTransferHistory.deleteMany({
            where: {
                OR: [
                    { kvkStaffId: { in: staffIds } },
                    { fromKvkId: { in: kvkIds } },
                    { toKvkId: { in: kvkIds } }
                ]
            }
        });
    } else {
        // Delete transfers that reference KVKs even if no staff found
        await prisma.staffTransferHistory.deleteMany({
            where: {
                OR: [
                    { fromKvkId: { in: kvkIds } },
                    { toKvkId: { in: kvkIds } }
                ]
            }
        });
    }

    // 2. Delete HRD programs (references kvkId and kvkStaffId)
    if (staffIds.length > 0) {
        await prisma.hrdProgram.deleteMany({
            where: {
                OR: [
                    { kvkId: { in: kvkIds } },
                    { kvkStaffId: { in: staffIds } }
                ]
            }
        });
    } else {
        await prisma.hrdProgram.deleteMany({
            where: { kvkId: { in: kvkIds } }
        });
    }

    // 3. Delete KVK staff (references kvkId and originalKvkId)
    await prisma.kvkStaff.deleteMany({
        where: {
            OR: [
                { kvkId: { in: kvkIds } },
                { originalKvkId: { in: kvkIds } }
            ]
        }
    });

    // 4. Delete training achievements
    await prisma.trainingAchievement.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });

    // 5. Delete awards
    await prisma.farmerAward.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });
    await prisma.kvkAward.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });
    await prisma.scientistAward.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });

    // 6. Delete infrastructure
    await prisma.kvkInfrastructure.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });

    // 7. Delete equipment
    await prisma.kvkEquipment.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });

    // 8. Delete vehicles
    await prisma.kvkVehicle.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });

    // 9. Delete bank accounts
    await prisma.kvkBankAccount.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });

    // 10. Delete farm implements
    await prisma.kvkFarmImplement.deleteMany({
        where: { kvkId: { in: kvkIds } }
    });

    // Finally, delete the KVKs themselves
    await prisma.kvk.deleteMany({
        where: { [field]: value }
    });
}

/**
 * Helper: Update users to nullify a given field
 * @param {object} prisma - Prisma client
 * @param {string} field - Field name (zoneId, stateId, districtId, orgId, universityId)
 * @param {number} value - Field value
 */
async function nullifyUserField(prisma, field, value) {
    await prisma.user.updateMany({
        where: { [field]: value },
        data: { [field]: null }
    });
}

/**
 * Helper: Cascade delete districts and their related records
 * @param {object} prisma - Prisma client
 * @param {Array} districts - Array of districts with districtId
 */
async function cascadeDeleteDistricts(prisma, districts) {
    for (const district of districts) {
        await deleteKvksByField(prisma, 'districtId', district.districtId);
        await nullifyUserField(prisma, 'districtId', district.districtId);
        await prisma.orgMaster.deleteMany({
            where: { districtId: district.districtId }
        });
    }
}

/**
 * Cascade delete entity and all related records
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<void>}
 */
async function cascadeDeleteEntity(entityName, id) {
    const prisma = require('../../config/prisma.js');

    // Ensure id is an integer
    const entityId = parseInt(id, 10);
    if (isNaN(entityId)) {
        throw new Error(`Invalid ID: ${id}`);
    }

    try {
        switch (entityName) {
            case 'zones':
                // Delete KVKs and nullify users for this zone
                await deleteKvksByField(prisma, 'zoneId', entityId);
                await nullifyUserField(prisma, 'zoneId', entityId);

                // Get and cascade delete districts
                const districts = await prisma.districtMaster.findMany({
                    where: { zoneId: entityId },
                    select: { districtId: true }
                });
                await cascadeDeleteDistricts(prisma, districts);

                // Delete districts
                await prisma.districtMaster.deleteMany({
                    where: { zoneId: entityId }
                });

                // Get and cascade delete states
                const states = await prisma.stateMaster.findMany({
                    where: { zoneId: entityId },
                    select: { stateId: true }
                });

                for (const state of states) {
                    await deleteKvksByField(prisma, 'stateId', state.stateId);
                    await nullifyUserField(prisma, 'stateId', state.stateId);
                }

                // Delete states
                await prisma.stateMaster.deleteMany({
                    where: { zoneId: entityId }
                });
                break;

            case 'states':
                // Delete KVKs and nullify users for this state
                await deleteKvksByField(prisma, 'stateId', entityId);
                await nullifyUserField(prisma, 'stateId', entityId);

                // Get and cascade delete districts
                const stateDistricts = await prisma.districtMaster.findMany({
                    where: { stateId: entityId },
                    select: { districtId: true }
                });
                await cascadeDeleteDistricts(prisma, stateDistricts);

                // Delete districts
                await prisma.districtMaster.deleteMany({
                    where: { stateId: entityId }
                });
                break;

            case 'districts':
                // Delete KVKs, nullify users, and delete organizations
                await deleteKvksByField(prisma, 'districtId', entityId);
                await nullifyUserField(prisma, 'districtId', entityId);
                await prisma.orgMaster.deleteMany({
                    where: { districtId: entityId }
                });
                break;

            case 'organizations':
                // Delete KVKs, nullify users, and delete universities
                await deleteKvksByField(prisma, 'orgId', entityId);
                await nullifyUserField(prisma, 'orgId', entityId);
                await prisma.universityMaster.deleteMany({
                    where: { orgId: entityId }
                });
                break;

            case 'universities':
                // Delete KVKs and nullify users
                await deleteKvksByField(prisma, 'universityId', entityId);
                await nullifyUserField(prisma, 'universityId', entityId);
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
 * Generic error handler wrapper for repository calls
 * @param {Function} fn - Repository function to call
 * @param {string} operation - Operation name for error messages
 * @param {string} entityName - Entity name for error messages
 * @returns {Promise<any>}
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
 * @param {number} zoneId - Zone ID
 * @returns {Promise<Array>}
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
 * @param {number} stateId - State ID
 * @returns {Promise<Array>}
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
 * @param {number} districtId - District ID
 * @returns {Promise<Array>}
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
 * @param {number} orgId - Organization ID
 * @returns {Promise<Array>}
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
 * @returns {Promise<object>}
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
 * @returns {Promise<Array>}
 */
async function getHierarchy() {
    return handleRepositoryCall(
        () => masterDataRepository.getHierarchy(),
        'fetching',
        'hierarchy'
    );
}

/**
 * Helper: Get name field for entity
 * @param {string} entityName - Entity name
 * @returns {string}
 */
function getNameField(entityName) {
    const nameFields = {
        zones: 'zoneName',
        states: 'stateName',
        districts: 'districtName',
        organizations: 'orgName',
        universities: 'universityName',
    };
    return nameFields[entityName];
}

/**
 * Helper: Get unique constraint filters for duplicate checking
 * @param {string} entityName - Entity name
 * @param {object} data - Entity data
 * @returns {object}
 */
function getUniqueFilters(entityName, data) {
    // For states and districts, name uniqueness is scoped to parent
    switch (entityName) {
        case 'states':
            return data.zoneId ? { zoneId: parseInt(data.zoneId) } : {};
        case 'districts':
            return data.stateId ? { stateId: parseInt(data.stateId) } : {};
        case 'organizations':
            return data.districtId ? { districtId: parseInt(data.districtId) } : {};
        case 'universities':
            return data.orgId ? { orgId: parseInt(data.orgId) } : {};
        default:
            return {};
    }
}

/**
 * Helper: Check if entity has dependent records
 * @param {string} entityName - Entity name
 * @param {object} entity - Entity object
 * @returns {Promise<boolean>}
 */
async function checkDependents(entityName, entity) {
    const prisma = require('../../config/prisma.js');
    const counts = entity._count || {};
    

    // If _count is not available, query directly from database
    if (!entity._count) {
        const entityId = entity[getEntityIdField(entityName)];
        
        switch (entityName) {
            case 'organizations':
                const [userCount, universityCount, kvkCount] = await Promise.all([
                    prisma.user.count({ where: { orgId: entityId } }),
                    prisma.universityMaster.count({ where: { orgId: entityId } }),
                    prisma.kvk.count({ where: { orgId: entityId } })
                ]);
                console.log(`Direct query - users: ${userCount}, universities: ${universityCount}, kvks: ${kvkCount}`);
                return userCount > 0 || universityCount > 0 || kvkCount > 0;
            case 'zones':
                const [stateCount, districtCount, zoneUserCount] = await Promise.all([
                    prisma.stateMaster.count({ where: { zoneId: entityId } }),
                    prisma.districtMaster.count({ where: { zoneId: entityId } }),
                    prisma.user.count({ where: { zoneId: entityId } })
                ]);
                return stateCount > 0 || districtCount > 0 || zoneUserCount > 0;
            case 'states':
                const [districtCount2, stateUserCount] = await Promise.all([
                    prisma.districtMaster.count({ where: { stateId: entityId } }),
                    prisma.user.count({ where: { stateId: entityId } })
                ]);
                return districtCount2 > 0 || stateUserCount > 0;
            case 'districts':
                const [orgCount, districtUserCount] = await Promise.all([
                    prisma.orgMaster.count({ where: { districtId: entityId } }),
                    prisma.user.count({ where: { districtId: entityId } })
                ]);
                return orgCount > 0 || districtUserCount > 0;
            case 'universities':
                const [univUserCount, univKvkCount] = await Promise.all([
                    prisma.user.count({ where: { universityId: entityId } }),
                    prisma.kvk.count({ where: { universityId: entityId } })
                ]);
                return univUserCount > 0 || univKvkCount > 0;
            default:
                return false;
        }
    }

    // Use _count if available
    switch (entityName) {
        case 'zones':
            return (counts.states || 0) > 0 || (counts.districts || 0) > 0 || (counts.users || 0) > 0;
        case 'states':
            return (counts.districts || 0) > 0 || (counts.users || 0) > 0;
        case 'districts':
            return (counts.orgs || 0) > 0 || (counts.users || 0) > 0;
        case 'organizations':
            const hasDeps = (counts.users || 0) > 0 || (counts.universities || 0) > 0 || (counts.kvks || 0) > 0;
            return hasDeps;
        case 'universities':
            return (counts.users || 0) > 0 || (counts.kvks || 0) > 0;
        default:
            return false;
    }
}

/**
 * Get the ID field name for an entity
 */
function getEntityIdField(entityName) {
    const idFieldMap = {
        'zones': 'zoneId',
        'states': 'stateId',
        'districts': 'districtId',
        'organizations': 'orgId',
        'universities': 'universityId',
    };
    return idFieldMap[entityName] || 'id';
}

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
