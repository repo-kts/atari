const fldRepository = require('../../repositories/forms/fldRepository.js');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler.js');
const { FLD_STATUS, normalizeFldStatus } = require('../../constants/fldStatus.js');

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
        const payload = { ...(data || {}) };
        delete payload.status;
        delete payload.ongoingCompleted;
        return await fldRepository.create(payload, user);
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
        const payload = { ...(data || {}) };
        delete payload.status;
        delete payload.ongoingCompleted;
        return await fldRepository.update(id, payload, user);
    },

    transferToNextYear: async (id, user) => {
        const source = await fldRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('FLD record');

        const sourceStatus = normalizeFldStatus(source.ongoingCompleted);
        if (sourceStatus !== FLD_STATUS.ONGOING) {
            throw new ValidationError('Only ONGOING FLD records can be transferred');
        }

        if (!source.reportingYear) {
            throw new ValidationError('Cannot transfer FLD without reportingYear');
        }

        const nextReportingYear = new Date(source.reportingYear);
        if (Number.isNaN(nextReportingYear.getTime())) {
            throw new ValidationError('Invalid source reportingYear for transfer');
        }
        nextReportingYear.setFullYear(nextReportingYear.getFullYear() + 1);

        return fldRepository.transferToNextYearTx(source, nextReportingYear);
    },

    addResult: async (id, payload, user) => {
        const source = await fldRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('FLD record');

        const sourceStatus = normalizeFldStatus(source.ongoingCompleted);
        if (sourceStatus !== FLD_STATUS.ONGOING) {
            throw new ValidationError('Result can only be added for ONGOING FLD records');
        }
        _validateFldResultPayload(payload);
        const result = await fldRepository.createResultTx(id, payload);
        await fldRepository.updateStatus(id, FLD_STATUS.COMPLETED);
        return result;
    },

    editResult: async (id, payload, user) => {
        const source = await fldRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('FLD record');
        const sourceStatus = normalizeFldStatus(source.ongoingCompleted);
        if (sourceStatus !== FLD_STATUS.COMPLETED) {
            throw new ValidationError('Result can only be edited for COMPLETED FLD records');
        }
        _validateFldResultPayload(payload);
        return fldRepository.updateResultTx(id, payload);
    },

    getResult: async (id, user) => {
        const source = await fldRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('FLD record');
        const result = await fldRepository.getResultByFldId(id);
        if (!result) throw new NotFoundError('FLD result');
        return result;
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

function _validateFldResultPayload(payload) {
    const requiredNumericFields = [
        'demoYield',
        'checkYield',
        'increasePercent',
        'demoGrossCost',
        'demoGrossReturn',
        'demoNetReturn',
        'demoBcr',
        'checkGrossCost',
        'checkGrossReturn',
        'checkNetReturn',
        'checkBcr',
    ];
    for (const field of requiredNumericFields) {
        const value = Number(payload?.[field]);
        if (!Number.isFinite(value)) {
            throw new ValidationError(`${field} must be a valid number`, field);
        }
    }
}

module.exports = fldService;
