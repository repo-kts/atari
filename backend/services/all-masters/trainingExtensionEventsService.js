const trainingExtensionEventsRepository = require('../../repositories/all-masters/trainingExtensionEventsRepository.js');

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
     */
    async getAll(entityName, options = {}) {
        const result = await trainingExtensionEventsRepository.findAll(entityName, options);
        return {
            ...result,
            page: options.page || 1,
            limit: options.limit || 100,
        };
    }

    /**
     * Get entity by ID
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @returns {Promise<object>}
     */
    async getById(entityName, id) {
        const entity = await trainingExtensionEventsRepository.findById(entityName, id);
        if (!entity) {
            throw new Error(`${entityName} with ID ${id} not found`);
        }
        return entity;
    }

    /**
     * Create new entity
     * @param {string} entityName - Entity name
     * @param {object} data - Entity data
     * @returns {Promise<object>}
     */
    async create(entityName, data) {
        // Validate foreign key references
        const isValid = await trainingExtensionEventsRepository.validateReferences(entityName, data);
        if (!isValid) {
            throw new Error('Invalid foreign key reference');
        }

        return await trainingExtensionEventsRepository.create(entityName, data);
    }

    /**
     * Update entity
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @param {object} data - Updated data
     * @returns {Promise<object>}
     */
    async update(entityName, id, data) {
        // Check if entity exists
        await this.getById(entityName, id);

        // Validate foreign key references if they're being updated
        if (Object.keys(data).some(key => key.includes('Id'))) {
            const isValid = await trainingExtensionEventsRepository.validateReferences(entityName, data);
            if (!isValid) {
                throw new Error('Invalid foreign key reference');
            }
        }

        return await trainingExtensionEventsRepository.update(entityName, id, data);
    }

    /**
     * Delete entity
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @returns {Promise<object>}
     */
    async delete(entityName, id) {
        // Check if entity exists
        await this.getById(entityName, id);

        return await trainingExtensionEventsRepository.deleteEntity(entityName, id);
    }

    /**
     * Get training areas by training type ID
     * @param {number} trainingTypeId - Training Type ID
     * @returns {Promise<Array>}
     */
    async getTrainingAreasByType(trainingTypeId) {
        return await trainingExtensionEventsRepository.findTrainingAreasByType(trainingTypeId);
    }

    /**
     * Get training thematic areas by training area ID
     * @param {number} trainingAreaId - Training Area ID
     * @returns {Promise<Array>}
     */
    async getTrainingThematicAreasByArea(trainingAreaId) {
        return await trainingExtensionEventsRepository.findTrainingThematicAreasByArea(trainingAreaId);
    }

    /**
     * Get statistics
     * @returns {Promise<object>}
     */
    async getStats() {
        return await trainingExtensionEventsRepository.getStats();
    }
}

module.exports = new TrainingExtensionEventsService();
