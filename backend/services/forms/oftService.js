const oftRepository = require('../../repositories/forms/oftRepository.js');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler.js');
const { OFT_STATUS, normalizeOftStatus, canTransition } = require('../../constants/oftStatus.js');
const { validateFileSize } = require('../../utils/fileValidation.js');
const { createAttachmentBinding } = require('./formAttachmentBinding.js');

const resultAttachments = createAttachmentBinding({
    formCode: 'oft_result',
    primaryKey: 'oftResultReportId',
});

const oftService = {
    createOft: async (data, user) => {
        const payload = { ...(data || {}) };
        delete payload.status;
        delete payload.ongoingCompleted;
        _assertExpectedCompletionDate(payload);
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
        _assertExpectedCompletionDate(payload);
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

        const sourceStartDate = source.oftStartDate ? new Date(source.oftStartDate) : null;
        if (!sourceStartDate || Number.isNaN(sourceStartDate.getTime())) {
            throw new ValidationError('Cannot transfer OFT without a valid start date');
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

        return oftRepository.transferToNextYearTx(source, nextStartDate, nextExpectedCompletionDate);
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

        const { attachmentIds } = resultAttachments.strip(payload);
        const result = await oftRepository.createResultReportTx(id, payload);
        await oftRepository.updateStatus(id, OFT_STATUS.COMPLETED);
        await resultAttachments.attach(
            { ...result, kvkId: source.kvkId },
            attachmentIds,
            user,
        );
        return resultAttachments.decorate({ ...result, kvkId: source.kvkId }, user);
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
        const { attachmentIds } = resultAttachments.strip(payload);
        const result = await oftRepository.updateResultReportTx(id, payload);
        await resultAttachments.attach(
            { ...result, kvkId: source.kvkId },
            attachmentIds,
            user,
        );
        return resultAttachments.decorate({ ...result, kvkId: source.kvkId }, user);
    },

    getResult: async (id, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('OFT record');
        const result = await oftRepository.getResultByOftId(id);
        if (!result) throw new NotFoundError('OFT result report');
        return resultAttachments.decorate({ ...result, kvkId: source.kvkId }, user);
    },

    deleteOft: async (id, user) => {
        return await oftRepository.delete(id, user);
    },
};

function _assertExpectedCompletionDate(payload) {
    const raw = payload ? payload.expectedCompletionDate : null;
    const date = raw ? new Date(raw) : null;
    if (!raw || !date || Number.isNaN(date.getTime())) {
        throw new ValidationError('Expected Completion Date is required', 'expectedCompletionDate');
    }
}

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

    payload.tables.forEach((table, tableIndex) => {
        const rows = Array.isArray(table?.rows) ? table.rows : [];
        rows.forEach((row, rowIndex) => {
            const optionKey = String(row?.optionKey || '').trim();
            if (optionKey && !sourceByKey.has(optionKey)) {
                throw new ValidationError(
                    `Unknown source row optionKey at table ${tableIndex + 1}, row ${rowIndex + 1}`,
                    `tables.${tableIndex}.rows.${rowIndex}.optionKey`
                );
            }
        });
    });

    validateFileSize({ size: payload.supplementaryDatasheetSize }, 5 * 1024 * 1024, 'Supplementary Datasheet');
    validateFileSize({ size: payload.photographSize }, 5 * 1024 * 1024, 'Photograph');
}

module.exports = oftService;
