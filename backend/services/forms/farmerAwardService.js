const farmerAwardRepository = require('../../repositories/forms/farmerAwardRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');
const { createAttachmentBinding } = require('./formAttachmentBinding.js');

const attachments = createAttachmentBinding({
    formCode: 'farmer_award',
    primaryKey: 'farmerAwardId',
});

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
            const { payload, attachmentIds } = attachments.strip(data);
            const result = await farmerAwardRepository.create(payload, user);
            await attachments.attach(result, attachmentIds, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'farmerAward',
                result?.kvkId || user?.kvkId,
            );
            return attachments.decorate(result, user);
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
            const rows = await farmerAwardRepository.findAll(filters, user);
            if (rows && Array.isArray(rows.data)) {
                rows.data = await attachments.decorateMany(rows.data, user);
                return rows;
            }
            return attachments.decorateMany(rows, user);
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
            const record = await farmerAwardRepository.findById(id, user);
            return attachments.decorate(record, user);
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
            const { payload, attachmentIds } = attachments.strip(data);
            const existing = await farmerAwardRepository.findById(id, user);
            const result = await farmerAwardRepository.update(id, payload, user);
            await attachments.attach(result ?? existing, attachmentIds, user);
            await reportCacheInvalidationService.invalidateDataSourceForKvk(
                'farmerAward',
                result?.kvkId || user?.kvkId,
            );
            return attachments.decorate(result, user);
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
            await attachments.cleanup(existing, user);
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
