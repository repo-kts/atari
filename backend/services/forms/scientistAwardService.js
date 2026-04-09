const scientistAwardRepository = require('../../repositories/forms/scientistAwardRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

/**
 * Scientist Award Service
 * Business logic layer for Scientist Award operations
 */
class ScientistAwardService {
    /**
     * Create new scientist award record
     * @param {object} data - Scientist award data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Created record
     */
    async createScientistAward(data, user) {
        try {
            const result = await scientistAwardRepository.create(data, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'scientistAward',
                result?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to create scientist award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get all scientist award records
     * @param {object} filters - Filter options
     * @param {object} user - User object from session
     * @returns {Promise<Array>} Array of records
     */
    async getAllScientistAwards(filters = {}, user) {
        try {
            return await scientistAwardRepository.findAll(filters, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch scientist awards: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get scientist award record by ID
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Record
     */
    async getScientistAwardById(id, user) {
        try {
            return await scientistAwardRepository.findById(id, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch scientist award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Update scientist award record
     * @param {string} id - Record ID (UUID)
     * @param {object} data - Updated data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Updated record
     */
    async updateScientistAward(id, data, user) {
        try {
            const result = await scientistAwardRepository.update(id, data, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'scientistAward',
                result?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to update scientist award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Delete scientist award record
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Success message
     */
    async deleteScientistAward(id, user) {
        try {
            const existing = await scientistAwardRepository.findById(id, user);
            const result = await scientistAwardRepository.delete(id, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'scientistAward',
                existing?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to delete scientist award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }
}

module.exports = new ScientistAwardService();
