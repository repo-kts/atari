const fldTechnicalFeedbackRepository = require('../../repositories/forms/fldTechnicalFeedbackRepository.js');

/**
 * FLD Technical Feedback Service
 * Business logic layer for FLD Technical Feedback
 */
const fldTechnicalFeedbackService = {
    /**
     * Create a new FLD Technical Feedback record
     * @param {Object} data - FLD Technical Feedback data
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Created FLD Technical Feedback record
     */
    createFldTechnicalFeedback: async (data, user) => {
        return await fldTechnicalFeedbackRepository.create(data, user);
    },

    /**
     * Get all FLD Technical Feedback records with optional filtering
     * @param {Object} filters - Filter criteria
     * @param {Object} user - Authenticated user
     * @returns {Promise<Array>} Array of FLD Technical Feedback records
     */
    getAllFldTechnicalFeedback: async (filters = {}, user) => {
        return await fldTechnicalFeedbackRepository.findAll(filters, user);
    },

    /**
     * Get a single FLD Technical Feedback record by ID
     * @param {string|number} id - FLD Technical Feedback record ID
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object|null>} FLD Technical Feedback record or null
     */
    getFldTechnicalFeedbackById: async (id, user) => {
        return await fldTechnicalFeedbackRepository.findById(id, user);
    },

    /**
     * Update an existing FLD Technical Feedback record
     * @param {string|number} id - FLD Technical Feedback record ID
     * @param {Object} data - Updated FLD Technical Feedback data
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Updated FLD Technical Feedback record
     */
    updateFldTechnicalFeedback: async (id, data, user) => {
        return await fldTechnicalFeedbackRepository.update(id, data, user);
    },

    /**
     * Delete an FLD Technical Feedback record
     * @param {string|number} id - FLD Technical Feedback record ID
     * @param {Object} user - Authenticated user
     * @returns {Promise<Object>} Success confirmation
     */
    deleteFldTechnicalFeedback: async (id, user) => {
        return await fldTechnicalFeedbackRepository.delete(id, user);
    },
};

module.exports = fldTechnicalFeedbackService;
