const productionSupplyRepository = require('../../repositories/forms/productionSupplyRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

/**
 * Production Supply Service
 * Business logic layer for Production and Supply of Technological Products operations
 */
class ProductionSupplyService {
    /**
     * Create new production supply record
     * @param {object} data - Production supply data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Created record
     */
    async createProductionSupply(data, user) {
        try {
            return await productionSupplyRepository.create(data, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to create production supply: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get all production supply records
     * @param {object} filters - Filter options
     * @param {object} user - User object from session
     * @returns {Promise<Array>} Array of records
     */
    async getAllProductionSupply(filters = {}, user) {
        try {
            return await productionSupplyRepository.findAll(filters, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch production supply records: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get production supply record by ID
     * @param {number} id - Record ID
     * @param {object} user - User object from session
     * @returns {Promise<object>} Record
     */
    async getProductionSupplyById(id, user) {
        try {
            return await productionSupplyRepository.findById(id, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch production supply record: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Update production supply record
     * @param {number} id - Record ID
     * @param {object} data - Updated data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Updated record
     */
    async updateProductionSupply(id, data, user) {
        try {
            return await productionSupplyRepository.update(id, data, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to update production supply: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Delete production supply record
     * @param {number} id - Record ID
     * @param {object} user - User object from session
     * @returns {Promise<object>} Success message
     */
    async deleteProductionSupply(id, user) {
        try {
            return await productionSupplyRepository.delete(id, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to delete production supply: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }
}

module.exports = new ProductionSupplyService();
