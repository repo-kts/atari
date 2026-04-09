const hrdRepository = require('../../repositories/forms/hrdRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

/**
 * HRD Program Service
 * Business logic layer for HRD Program operations
 */
class HrdService {
    /**
     * Create new HRD program record
     * @param {object} data - HRD program data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Created record
     */
    async create(data, user) {
        try {
            const result = await hrdRepository.create(data, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'hrdProgram',
                result?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to create HRD program: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get all HRD program records
     * @param {object} filters - Filter options
     * @param {object} user - User object from session
     * @returns {Promise<Array>} Array of records
     */
    async findAll(filters = {}, user) {
        try {
            return await hrdRepository.findAll(filters, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch HRD programs: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get HRD program record by ID
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Record
     */
    async findById(id, user) {
        try {
            return await hrdRepository.findById(id, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch HRD program: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Update HRD program record
     * @param {string} id - Record ID (UUID)
     * @param {object} data - Updated data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Updated record
     */
    async update(id, data, user) {
        try {
            const result = await hrdRepository.update(id, data, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'hrdProgram',
                result?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to update HRD program: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Delete HRD program record
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Success message
     */
    async delete(id, user) {
        try {
            const existing = await hrdRepository.findById(id, user);
            const result = await hrdRepository.delete(id, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'hrdProgram',
                existing?.kvkId || user?.kvkId,
            );
            return result;
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to delete HRD program: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }
}

module.exports = new HrdService();
