const trainingExtensionEventsRepository = require('../../repositories/all-masters/trainingExtensionEventsRepository.js');
const { normalizeListLimit, DEFAULT_MASTER_LIST_PAGE_SIZE } = require('../../constants/masterListPagination.js');
const { getEntityConfig } = require('../../repositories/all-masters/trainingExtensionEventsRepository.js');
const { ValidationError, NotFoundError, ConflictError, translatePrismaError } = require('../../utils/errorHandler');

/**
 * Training, Extension & Events Master Data Service
 * Business logic layer for Training, Extension Activities, and Events master data operations
 */

class TrainingExtensionEventsService {
    /**
     * Get all entities with pagination and filtering
     * @param {string} entityName - Entity name
     * @param {object} options - Query options
     * @returns {Promise<{data: Array, total: number, page: number, limit: number}>}
     * @throws {ValidationError} If entity name or options are invalid
     */
    async getAll(entityName, options = {}) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }

        const page = Math.max(1, parseInt(options.page, 10) || 1);
        const limit = normalizeListLimit(options.limit, DEFAULT_MASTER_LIST_PAGE_SIZE);

        if (page < 1) {
            throw new ValidationError('Page must be a positive number');
        }

        try {
            const result = await trainingExtensionEventsRepository.findAll(entityName, { ...options, page, limit });
            return {
                data: result.data,
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'getAll');
        }
    }

    /**
     * Get entity by ID
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @returns {Promise<object>}
     * @throws {ValidationError} If ID is invalid
     * @throws {NotFoundError} If entity not found
     */
    async getById(entityName, id) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }

        if (id === undefined || id === null || id === '') {
            throw new ValidationError('ID is required');
        }

        try {
            return await trainingExtensionEventsRepository.findById(entityName, id);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'getById');
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
    async create(entityName, data) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }

        if (!data || typeof data !== 'object') {
            throw new ValidationError('Data is required and must be an object');
        }

        try {
            // Get entity config for name field validation
            const config = getEntityConfig ? getEntityConfig(entityName) : null;

            // Check for duplicate names (where applicable)
            if (config && config.nameField && data[config.nameField]) {
                const exists = await trainingExtensionEventsRepository.nameExists(
                    entityName,
                    data[config.nameField]
                );
                if (exists) {
                    throw new ConflictError(`${entityName} with this ${config.nameField} already exists`);
                }
            }

            // Validate foreign key references
            await trainingExtensionEventsRepository.validateReferences(entityName, data);

            return await trainingExtensionEventsRepository.create(entityName, data);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof ConflictError) {
                throw error;
            }
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
    async update(entityName, id, data) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }

        if (id === undefined || id === null || id === '') {
            throw new ValidationError('ID is required');
        }

        if (!data || typeof data !== 'object') {
            throw new ValidationError('Data is required and must be an object');
        }

        try {
            // Check if entity exists
            await this.getById(entityName, id);

            // Get entity config for duplicate name check
            const config = getEntityConfig ? getEntityConfig(entityName) : null;

            // Check for duplicate names (excluding current entity)
            if (config && config.nameField && data[config.nameField]) {
                const exists = await trainingExtensionEventsRepository.nameExists(
                    entityName,
                    data[config.nameField],
                    id
                );
                if (exists) {
                    throw new ConflictError(`${entityName} with this ${config.nameField} already exists`);
                }
            }

            // Validate foreign key references if they're being updated
            if (Object.keys(data).some(key => key.includes('Id'))) {
                await trainingExtensionEventsRepository.validateReferences(entityName, data);
            }

            return await trainingExtensionEventsRepository.update(entityName, id, data);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'update');
        }
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
    async delete(entityName, id) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }

        if (id === undefined || id === null || id === '') {
            throw new ValidationError('ID is required');
        }

        try {
            // Check if entity exists
            await this.getById(entityName, id);

            return await trainingExtensionEventsRepository.deleteEntity(entityName, id);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'delete');
        }
    }

    /**
     * Get training areas by training type ID
     * @param {number} trainingTypeId - Training Type ID
     * @returns {Promise<Array>}
     * @throws {ValidationError} If trainingTypeId is invalid
     */
    async getTrainingAreasByType(trainingTypeId) {
        try {
            return await trainingExtensionEventsRepository.findTrainingAreasByType(trainingTypeId);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, 'Training Area', 'getByType');
        }
    }

    /**
     * Get training thematic areas by training area ID
     * @param {number} trainingAreaId - Training Area ID
     * @returns {Promise<Array>}
     * @throws {ValidationError} If trainingAreaId is invalid
     */
    async getTrainingThematicAreasByArea(trainingAreaId) {
        try {
            return await trainingExtensionEventsRepository.findTrainingThematicAreasByArea(trainingAreaId);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, 'Training Thematic Area', 'getByArea');
        }
    }

    /**
     * Get statistics
     * @returns {Promise<object>}
     */
    async getStats() {
        try {
            return await trainingExtensionEventsRepository.getStats();
        } catch (error) {
            throw translatePrismaError(error, 'Statistics', 'getStats');
        }
    }
}

module.exports = new TrainingExtensionEventsService();
