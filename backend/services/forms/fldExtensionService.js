const fldExtensionRepository = require('../../repositories/forms/fldExtensionRepository.js');

/**
 * FLD Extension Service
 * Business logic layer for FLD Extension & Training Activities
 */
const fldExtensionService = {
    /**
     * Create a new FLD Extension record
     * @param {Object} data - FLD Extension data
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Created FLD Extension record
     */
    createFldExtension: async (data, user) => {
        return await fldExtensionRepository.create(data, user);
    },

    /**
     * Get all FLD Extension records with optional filtering
     * @param {Object} filters - Filter criteria
     * @param {Object} user - Authenticated user
     * @returns {Promise<Array>} Array of FLD Extension records
     */
    getAllFldExtension: async (filters = {}, user) => {
        return await fldExtensionRepository.findAll(filters, user);
    },

    /**
     * Get a single FLD Extension record by ID
     * @param {string|number} id - FLD Extension record ID
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object|null>} FLD Extension record or null
     */
    getFldExtensionById: async (id, user) => {
        return await fldExtensionRepository.findById(id, user);
    },

    /**
     * Update an existing FLD Extension record
     * @param {string|number} id - FLD Extension record ID
     * @param {Object} data - Updated FLD Extension data
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Updated FLD Extension record
     */
    updateFldExtension: async (id, data, user) => {
        return await fldExtensionRepository.update(id, data, user);
    },

    /**
     * Delete an FLD Extension record
     * @param {string|number} id - FLD Extension record ID
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Success confirmation
     */
    deleteFldExtension: async (id, user) => {
        return await fldExtensionRepository.delete(id, user);
    },
};

module.exports = fldExtensionService;
