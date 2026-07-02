const fldRepository = require('../../repositories/forms/fldRepository.js');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler.js');
const { FLD_STATUS, normalizeFldStatus } = require('../../constants/fldStatus.js');
const { FLD_RESULT_TEMPLATES, getFldResultTemplate } = require('../../constants/fldResultTemplate.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

async function invalidateFldStateCategoryReport(kvkId) {
    if (kvkId) {
        await reportCacheInvalidationService.invalidateDataSourceForKvk('fldStateCategoryReport', kvkId);
    }
}

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
        _assertExpectedCompletionDate(payload);
        const result = await fldRepository.create(payload, user);
        await invalidateFldStateCategoryReport(result?.kvkId || user?.kvkId);
        return result;
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
        _assertExpectedCompletionDate(payload);
        const result = await fldRepository.update(id, payload, user);
        await invalidateFldStateCategoryReport(result?.kvkId ?? user?.kvkId);
        return result;
    },

    transferToNextYear: async (id, user) => {
        const source = await fldRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('FLD record');

        const sourceStatus = normalizeFldStatus(source.ongoingCompleted);
        if (sourceStatus !== FLD_STATUS.ONGOING) {
            throw new ValidationError('Only ONGOING FLD records can be transferred');
        }

        const sourceStartDate = source.startDate ? new Date(source.startDate) : null;
        if (!sourceStartDate || Number.isNaN(sourceStartDate.getTime())) {
            throw new ValidationError('Cannot transfer FLD without a valid start date');
        }

        const nextYear = sourceStartDate.getFullYear() + 1;
        const currentYear = new Date().getFullYear();
        if (nextYear > currentYear) {
            throw new ValidationError(
                `Cannot transfer to ${nextYear}: transfer to a future year is not allowed`
            );
        }

        const nextStartDate = new Date(sourceStartDate);
        nextStartDate.setFullYear(nextYear);
        // Expected Completion Date defaults to the last date (31-Dec) of the new start year.
        const nextExpectedCompletionDate = new Date(nextYear, 11, 31);

        const out = await fldRepository.transferToNextYearTx(source, nextStartDate, nextExpectedCompletionDate);
        await invalidateFldStateCategoryReport(source?.kvkId || user?.kvkId);
        return out;
    },

    addResult: async (id, payload, user) => {
        const source = await fldRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('FLD record');

        const sourceStatus = normalizeFldStatus(source.ongoingCompleted);
        if (sourceStatus !== FLD_STATUS.ONGOING) {
            throw new ValidationError('Result can only be added for ONGOING FLD records');
        }
        _validateFldResultPayload(payload, source);
        const result = await fldRepository.createResultTx(id, payload);
        await fldRepository.updateStatus(id, FLD_STATUS.COMPLETED);
        await invalidateFldStateCategoryReport(source?.kvkId || user?.kvkId);
        return result;
    },

    editResult: async (id, payload, user) => {
        const source = await fldRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('FLD record');
        const sourceStatus = normalizeFldStatus(source.ongoingCompleted);
        if (sourceStatus !== FLD_STATUS.COMPLETED) {
            throw new ValidationError('Result can only be edited for COMPLETED FLD records');
        }
        _validateFldResultPayload(payload, source);
        const updated = await fldRepository.updateResultTx(id, payload);
        await invalidateFldStateCategoryReport(source?.kvkId || user?.kvkId);
        return updated;
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
        const existing = await fldRepository.findById(id, user);
        const result = await fldRepository.delete(id, user);
        await invalidateFldStateCategoryReport(existing?.kvkId || user?.kvkId);
        return result;
    },
};

function _assertExpectedCompletionDate(payload) {
    const raw = payload ? payload.expectedCompletionDate : null;
    const date = raw ? new Date(raw) : null;
    if (!raw || !date || Number.isNaN(date.getTime())) {
        throw new ValidationError('Expected Completion Date is required', 'expectedCompletionDate');
    }
}

function _validateFldResultPayload(payload, source) {
    const requiredNumericFields = [
        'demoYield',
        'checkYield',
        'increasePercent',
    ];

    const template = getFldResultTemplate(source);
    if (
        template === FLD_RESULT_TEMPLATES.CROP_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.DEMO_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    ) {
        requiredNumericFields.push('demoGrossCost', 'demoGrossReturn', 'demoNetReturn', 'demoBcr');
    }

    if (
        template === FLD_RESULT_TEMPLATES.CROP_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    ) {
        requiredNumericFields.push('checkGrossCost', 'checkGrossReturn', 'checkNetReturn', 'checkBcr');
    }

    if (template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS) {
        requiredNumericFields.push('otherParameterDemo', 'otherParameterCheck');
    }

    if (template === FLD_RESULT_TEMPLATES.MECHANIZATION) {
        requiredNumericFields.push('laborReductionManDays', 'costReduction');
    }

    for (const field of requiredNumericFields) {
        const value = Number(payload?.[field]);
        if (!Number.isFinite(value)) {
            throw new ValidationError(`${field} must be a valid number`, field);
        }
    }
}

module.exports = fldService;
