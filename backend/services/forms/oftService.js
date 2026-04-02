const oftRepository = require('../../repositories/forms/oftRepository.js');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler.js');
const { OFT_STATUS, normalizeOftStatus, canTransition } = require('../../constants/oftStatus.js');
const { validateFileSize } = require('../../utils/fileValidation.js');

const oftService = {
    createOft: async (data, user) => {
        const payload = { ...(data || {}) };
        delete payload.status;
        delete payload.ongoingCompleted;
        return await oftRepository.create(payload, user);
    },

    getAllOft: async (filters = {}, user) => {
        return await oftRepository.findAll(filters, user);
    },

    getOftById: async (id, user) => {
        return await oftRepository.findById(id, user);
    },

    updateOft: async (id, data, user) => {
        const payload = { ...(data || {}) };
        delete payload.status;
        delete payload.ongoingCompleted;
        return await oftRepository.update(id, payload, user);
    },

    transferToNextYear: async (id, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) {
            throw new NotFoundError('OFT record');
        }

        const sourceStatus = normalizeOftStatus(source.status);
        if (!canTransition(sourceStatus, OFT_STATUS.TRANSFERRED_TO_NEXT_YEAR)) {
            throw new ValidationError('Only ONGOING OFT records can be transferred');
        }

        if (!source.reportingYear) {
            throw new ValidationError('Cannot transfer OFT without reportingYear');
        }

        const nextReportingYear = new Date(source.reportingYear);
        if (Number.isNaN(nextReportingYear.getTime())) {
            throw new ValidationError('Invalid source reportingYear for transfer');
        }
        nextReportingYear.setFullYear(nextReportingYear.getFullYear() + 1);

        return oftRepository.transferToNextYearTx(source, nextReportingYear);
    },

    addResult: async (id, payload, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('OFT record');

        const sourceStatus = normalizeOftStatus(source.status);
        if (!canTransition(sourceStatus, OFT_STATUS.COMPLETED)) {
            throw new ValidationError('Result can only be added for ONGOING OFT records');
        }

        const sourceRows = await oftRepository.getTechnologyOptionsByOftId(id);
        _validateResultPayload(payload, sourceRows);

        const result = await oftRepository.createResultReportTx(id, payload);
        await oftRepository.updateStatus(id, OFT_STATUS.COMPLETED);
        return result;
    },

    editResult: async (id, payload, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('OFT record');

        const sourceStatus = normalizeOftStatus(source.status);
        if (sourceStatus !== OFT_STATUS.COMPLETED) {
            throw new ValidationError('Result can only be edited for COMPLETED OFT records');
        }

        const sourceRows = await oftRepository.getTechnologyOptionsByOftId(id);
        _validateResultPayload(payload, sourceRows);
        return oftRepository.updateResultReportTx(id, payload);
    },

    getResult: async (id, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('OFT record');
        const result = await oftRepository.getResultByOftId(id);
        if (!result) throw new NotFoundError('OFT result report');
        return result;
    },

    deleteOft: async (id, user) => {
        return await oftRepository.delete(id, user);
    },
};

function _validateResultPayload(payload, sourceRows = []) {
    if (!payload || typeof payload !== 'object') {
        throw new ValidationError('Result payload is required');
    }
    const requiredFields = [
        'finalRecommendation',
        'constraintsFeedback',
        'farmersParticipationProcess',
        'resultText',
    ];
    for (const field of requiredFields) {
        if (!String(payload[field] || '').trim()) {
            throw new ValidationError(`${field} is required`, field);
        }
    }
    if (!Array.isArray(payload.tables) || payload.tables.length === 0) {
        throw new ValidationError('At least one result table is required', 'tables');
    }
    const sourceByKey = new Map(
        (sourceRows || []).map((row) => [String(row.optionKey), String(row.optionName)])
    );
    if (sourceByKey.size === 0) {
        throw new ValidationError('At least one OFT technology option is required before adding result', 'technologyOptions');
    }

    payload.tables.forEach((table, tableIndex) => {
        const rows = Array.isArray(table?.rows) ? table.rows : [];
        const tableKeys = new Set();
        rows.forEach((row, rowIndex) => {
            const optionKey = String(row?.optionKey || '').trim();
            if (!optionKey || !sourceByKey.has(optionKey)) {
                throw new ValidationError(
                    `Invalid source row at table ${tableIndex + 1}, row ${rowIndex + 1}`,
                    `tables.${tableIndex}.rows.${rowIndex}.optionKey`
                );
            }
            tableKeys.add(optionKey);
        });

        if (tableKeys.size !== sourceByKey.size) {
            throw new ValidationError(
                `Result table ${tableIndex + 1} must contain all source technology rows`,
                `tables.${tableIndex}.rows`
            );
        }
    });

    validateFileSize({ size: payload.supplementaryDatasheetSize }, 2 * 1024 * 1024, 'Supplementary Datasheet');
    validateFileSize({ size: payload.photographSize }, 1 * 1024 * 1024, 'Photograph');
}

module.exports = oftService;
