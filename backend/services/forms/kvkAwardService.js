const kvkAwardRepository = require('../../repositories/forms/kvkAwardRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

/**
 * KVK Award Service
 * Business logic layer for KVK Award operations
 */
class KvkAwardService {
    /**
     * Create new KVK award record
     * @param {object} data - KVK award data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Created record
     */
    async createKvkAward(data, user) {
        try {
            const result = await kvkAwardRepository.create(data, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'kvkAward',
                result?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to create KVK award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get all KVK award records
     * @param {object} filters - Filter options
     * @param {object} user - User object from session
     * @returns {Promise<Array>} Array of records
     */
    async getAllKvkAwards(filters = {}, user) {
        try {
            return await kvkAwardRepository.findAll(filters, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch KVK awards: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get KVK award record by ID
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Record
     */
    async getKvkAwardById(id, user) {
        try {
            return await kvkAwardRepository.findById(id, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch KVK award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Update KVK award record
     * @param {string} id - Record ID (UUID)
     * @param {object} data - Updated data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Updated record
     */
    async updateKvkAward(id, data, user) {
        try {
            const result = await kvkAwardRepository.update(id, data, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'kvkAward',
                result?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to update KVK award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Delete KVK award record
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Success message
     */
    async deleteKvkAward(id, user) {
        try {
            const existing = await kvkAwardRepository.findById(id, user);
            const result = await kvkAwardRepository.delete(id, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'kvkAward',
                existing?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to delete KVK award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }
}

module.exports = new KvkAwardService();
