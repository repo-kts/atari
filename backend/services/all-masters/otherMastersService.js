const otherMastersRepository = require('../../repositories/all-masters/otherMastersRepository.js');

/**
 * Other Masters Service
 * Business logic layer for Season, Sanctioned Post, and Year master data operations
 */

/**
 * Get all entities with pagination and filtering
 * @param {string} entityName - Entity name
 * @param {object} options - Query options
 * @returns {Promise<{data: Array, total: number, page: number, limit: number}>}
 */
async function getAll(entityName, options = {}) {
    try {
        const result = await otherMastersRepository.findAll(entityName, options);
        return {
            data: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
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
async function getById(entityName, id) {
    try {
        const entity = await otherMastersRepository.findById(entityName, id);
        if (!entity) {
            const error = new Error(`${entityName} with ID ${id} not found`);
            error.statusCode = 404;
            throw error;
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
 * @returns {Promise<object>}
 */
async function create(entityName, data) {
    try {
        // Get entity config to determine name field
        const config = otherMastersRepository.ENTITY_CONFIG[entityName];
        if (!config) {
            throw new Error(`Invalid entity name: ${entityName}`);
        }

        // Validate required fields
        const nameField = config.nameField;
        if (!data[nameField] || (typeof data[nameField] === 'string' && !data[nameField].trim())) {
            const error = new Error(`${nameField} is required`);
            error.statusCode = 400;
            throw error;
        }

        // Validate references (if any) 
        const isValid = await otherMastersRepository.validateReferences(entityName, data);
        if (!isValid) {
            const error = new Error('Invalid reference data');
            error.statusCode = 400;
            throw error;
        }

        // Check for duplicate name
        const exists = await otherMastersRepository.nameExists(entityName, data[nameField]);
        if (exists) {
            const error = new Error(`${nameField} already exists`);
            error.statusCode = 409;
            throw error;
        }

        // Additional validation: ensure we're not accidentally including ID
        const dataCopy = { ...data };
        delete dataCopy[config.idField];
        delete dataCopy.id;
        delete dataCopy._id;
        delete dataCopy._count;

        return await otherMastersRepository.create(entityName, dataCopy);
    } catch (error) {
        console.error(`Error creating ${entityName}:`, error);
        throw error;
    }
}

/**
 * Update entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @param {object} data - Entity data
 * @returns {Promise<object>}
 */
async function update(entityName, id, data) {
    try {
        // Check if entity exists
        const existing = await otherMastersRepository.findById(entityName, id);
        if (!existing) {
            const error = new Error(`${entityName} with ID ${id} not found`);
            error.statusCode = 404;
            throw error;
        }

        // Get entity config
        const config = otherMastersRepository.ENTITY_CONFIG[entityName];
        const nameField = config.nameField;

        // Validate name if provided
        if (data[nameField]) {
            if (typeof data[nameField] === 'string' && !data[nameField].trim()) {
                const error = new Error(`${nameField} cannot be empty`);
                error.statusCode = 400;
                throw error;
            }

            // Check for duplicate name (excluding current entity)
            const exists = await otherMastersRepository.nameExists(entityName, data[nameField], id);
            if (exists) {
                const error = new Error(`${nameField} already exists`);
                error.statusCode = 409;
                throw error;
            }
        }

        // Validate references (if any)
        const isValid = await otherMastersRepository.validateReferences(entityName, data);
        if (!isValid) {
            const error = new Error('Invalid reference data');
            error.statusCode = 400;
            throw error;
        }

        return await otherMastersRepository.update(entityName, id, data);
    } catch (error) {
        console.error(`Error updating ${entityName}:`, error);
        throw error;
    }
}

/**
 * Delete entity
 * @param {string} entityName - Entity name
 * @param {number} id - Entity ID
 * @returns {Promise<void>}
 */
async function deleteEntity(entityName, id) {
    try {
        // Check if entity exists
        const existing = await otherMastersRepository.findById(entityName, id);
        if (!existing) {
            const error = new Error(`${entityName} with ID ${id} not found`);
            error.statusCode = 404;
            throw error;
        }

        // Check for dependent records (using _count if available)
        if (existing._count) {
            const dependentCounts = Object.values(existing._count);
            const hasDependents = dependentCounts.some(count => count > 0);
            
            if (hasDependents) {
                const error = new Error(`Cannot delete ${entityName}: has dependent records`);
                error.statusCode = 409;
                throw error;
            }
        }

        return await otherMastersRepository.deleteEntity(entityName, id);
    } catch (error) {
        console.error(`Error deleting ${entityName}:`, error);
        throw error;
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteEntity,
};
