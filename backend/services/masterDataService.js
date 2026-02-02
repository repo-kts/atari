const masterDataRepository = require('../repositories/masterDataRepository');

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
        required: ['uniName', 'stateId'],
        minLength: { uniName: 2 },
        maxLength: { uniName: 200 },
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

        console.log(`${entityName.slice(0, -1)} created by user ${userId}:`, entity);

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

        console.log(`${entityName.slice(0, -1)} updated by user ${userId}:`, entity);

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
 * @returns {Promise<void>}
 */
async function deleteEntity(entityName, id, userId) {
    try {
        // Check if entity exists
        const existing = await masterDataRepository.findById(entityName, id);
        if (!existing) {
            throw new Error(`${entityName.slice(0, -1)} not found`);
        }

        // Check if entity has dependent records
        const hasDependents = await checkDependents(entityName, existing);
        if (hasDependents) {
            throw new Error(`Cannot delete ${entityName.slice(0, -1)} with existing dependent records`);
        }

        // Delete entity
        await masterDataRepository.deleteEntity(entityName, id);

        console.log(`${entityName.slice(0, -1)} deleted by user ${userId}:`, id);
    } catch (error) {
        console.error(`Error deleting ${entityName}:`, error);
        throw error;
    }
}

/**
 * Get states by zone
 * @param {number} zoneId - Zone ID
 * @returns {Promise<Array>}
 */
async function getStatesByZone(zoneId) {
    try {
        return await masterDataRepository.findStatesByZone(zoneId);
    } catch (error) {
        console.error('Error fetching states by zone:', error);
        throw new Error(`Failed to fetch states: ${error.message}`);
    }
}

/**
 * Get districts by state
 * @param {number} stateId - State ID
 * @returns {Promise<Array>}
 */
async function getDistrictsByState(stateId) {
    try {
        return await masterDataRepository.findDistrictsByState(stateId);
    } catch (error) {
        console.error('Error fetching districts by state:', error);
        throw new Error(`Failed to fetch districts: ${error.message}`);
    }
}

/**
 * Get organizations by state
 * @param {number} stateId - State ID
 * @returns {Promise<Array>}
 */
async function getOrgsByState(stateId) {
    try {
        return await masterDataRepository.findOrgsByState(stateId);
    } catch (error) {
        console.error('Error fetching organizations by state:', error);
        throw new Error(`Failed to fetch organizations: ${error.message}`);
    }
}

/**
 * Get statistics
 * @returns {Promise<object>}
 */
async function getStats() {
    try {
        return await masterDataRepository.getStats();
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
}

/**
 * Get hierarchy
 * @returns {Promise<Array>}
 */
async function getHierarchy() {
    try {
        return await masterDataRepository.getHierarchy();
    } catch (error) {
        console.error('Error fetching hierarchy:', error);
        throw new Error(`Failed to fetch hierarchy: ${error.message}`);
    }
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
        organizations: 'uniName',
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
            return data.stateId ? { stateId: parseInt(data.stateId) } : {};
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
    const counts = entity._count || {};

    switch (entityName) {
        case 'zones':
            return (counts.states || 0) > 0 || (counts.districts || 0) > 0 || (counts.users || 0) > 0;
        case 'states':
            return (counts.districts || 0) > 0 || (counts.orgs || 0) > 0 || (counts.users || 0) > 0;
        case 'districts':
            return (counts.users || 0) > 0;
        case 'organizations':
            return (counts.users || 0) > 0;
        default:
            return false;
    }
}

module.exports = {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity,
    getStatesByZone,
    getDistrictsByState,
    getOrgsByState,
    getStats,
    getHierarchy,
};
