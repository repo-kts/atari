const productionProjectsRepository = require('../../repositories/all-masters/productionProjectsRepository.js');

/**
 * Production & Projects Master Data Service
 * Business logic layer for Production and Projects master data operations
 */

class ProductionProjectsService {
    /**
     * Get all entities with pagination and filtering
     * @param {string} entityName - Entity name
     * @param {object} options - Query options
     * @returns {Promise<{data: Array, total: number, page: number, limit: number}>}
     */
    async getAll(entityName, options = {}) {
        const result = await productionProjectsRepository.findAll(entityName, options);
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
        const entity = await productionProjectsRepository.findById(entityName, id);
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
        const isValid = await productionProjectsRepository.validateReferences(entityName, data);
        if (!isValid) {
            throw new Error('Invalid foreign key reference');
        }

        return await productionProjectsRepository.create(entityName, data);
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
            const isValid = await productionProjectsRepository.validateReferences(entityName, data);
            if (!isValid) {
                throw new Error('Invalid foreign key reference');
            }
        }

        return await productionProjectsRepository.update(entityName, id, data);
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

        return await productionProjectsRepository.deleteEntity(entityName, id);
    }

    /**
     * Get product types by category ID
     * @param {number} categoryId - Category ID
     * @returns {Promise<Array>}
     */
    async getProductTypesByCategory(categoryId) {
        return await productionProjectsRepository.findProductTypesByCategory(categoryId);
    }

    /**
     * Get statistics
     * @returns {Promise<object>}
     */
    async getStats() {
        return await productionProjectsRepository.getStats();
    }
}

module.exports = new ProductionProjectsService();
