const fldRepository = require('../../repositories/forms/fldRepository.js');

/**
 * FLD Service
 * Business logic layer for Front Line Demonstrations (FLD)
 * Provides a clean interface between controllers and repositories
 */
const fldService = {
    /**
     * Create a new FLD record
     * @param {Object} data - FLD data
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Created FLD record
     */
    createFld: async (data, user) => {
        return await fldRepository.create(data, user);
    },

    /**
     * Get all FLD records with optional filtering
     * @param {Object} filters - Filter criteria
     * @param {Object} user - Authenticated user
     * @returns {Promise<Array>} Array of FLD records
     */
    getAllFld: async (filters = {}, user) => {
        return await fldRepository.findAll(filters, user);
    },

    /**
     * Get a single FLD record by ID
     * @param {string|number} id - FLD record ID
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object|null>} FLD record or null
     */
    getFldById: async (id, user) => {
        return await fldRepository.findById(id, user);
    },

    /**
     * Update an existing FLD record
     * @param {string|number} id - FLD record ID
     * @param {Object} data - Updated FLD data
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Updated FLD record
     */
    updateFld: async (id, data, user) => {
        return await fldRepository.update(id, data, user);
    },

    /**
     * Delete an FLD record
     * @param {string|number} id - FLD record ID
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Success confirmation
     */
    deleteFld: async (id, user) => {
        return await fldRepository.delete(id, user);
    },
};

module.exports = fldService;
