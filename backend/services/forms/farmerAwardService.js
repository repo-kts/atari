const farmerAwardRepository = require('../../repositories/forms/farmerAwardRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

/**
 * Farmer Award Service
 * Business logic layer for Farmer Award operations
 */
class FarmerAwardService {
    /**
     * Create new farmer award record
     * @param {object} data - Farmer award data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Created record
     */
    async createFarmerAward(data, user) {
        try {
            const result = await farmerAwardRepository.create(data, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'farmerAward',
                result?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to create farmer award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get all farmer award records
     * @param {object} filters - Filter options
     * @param {object} user - User object from session
     * @returns {Promise<Array>} Array of records
     */
    async getAllFarmerAwards(filters = {}, user) {
        try {
            return await farmerAwardRepository.findAll(filters, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch farmer awards: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get farmer award record by ID
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Record
     */
    async getFarmerAwardById(id, user) {
        try {
            return await farmerAwardRepository.findById(id, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch farmer award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Update farmer award record
     * @param {string} id - Record ID (UUID)
     * @param {object} data - Updated data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Updated record
     */
    async updateFarmerAward(id, data, user) {
        try {
            const result = await farmerAwardRepository.update(id, data, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'farmerAward',
                result?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to update farmer award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Delete farmer award record
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Success message
     */
    async deleteFarmerAward(id, user) {
        try {
            const existing = await farmerAwardRepository.findById(id, user);
            const result = await farmerAwardRepository.delete(id, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'farmerAward',
                existing?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to delete farmer award: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }
}

module.exports = new FarmerAwardService();
