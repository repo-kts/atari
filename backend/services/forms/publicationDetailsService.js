const publicationDetailsRepository = require('../../repositories/forms/publicationDetailsRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

/**
 * Publication Details Service
 * Business logic layer for KVK Publication Details operations
 */
class PublicationDetailsService {
    /**
     * Create new publication details record
     * @param {object} data - Publication details data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Created record
     */
    async createPublicationDetails(data, user) {
        try {
            return await publicationDetailsRepository.create(data, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to create publication details: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get all publication details records
     * @param {object} filters - Filter options
     * @param {object} user - User object from session
     * @returns {Promise<Array>} Array of records
     */
    async getAllPublicationDetails(filters = {}, user) {
        try {
            return await publicationDetailsRepository.findAll(filters, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch publication details: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Get publication details record by ID
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Record
     */
    async getPublicationDetailsById(id, user) {
        try {
            return await publicationDetailsRepository.findById(id, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch publication details: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Update publication details record
     * @param {string} id - Record ID (UUID)
     * @param {object} data - Updated data
     * @param {object} user - User object from session
     * @returns {Promise<object>} Updated record
     */
    async updatePublicationDetails(id, data, user) {
        try {
            return await publicationDetailsRepository.update(id, data, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to update publication details: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }

    /**
     * Delete publication details record
     * @param {string} id - Record ID (UUID)
     * @param {object} user - User object from session
     * @returns {Promise<object>} Success message
     */
    async deletePublicationDetails(id, user) {
        try {
            return await publicationDetailsRepository.delete(id, user);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to delete publication details: ${error.message}`, 'SERVICE_ERROR', 500);
        }
    }
}

module.exports = new PublicationDetailsService();
