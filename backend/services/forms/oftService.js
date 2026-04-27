const oftRepository = require('../../repositories/forms/oftRepository.js');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler.js');
const { OFT_STATUS, normalizeOftStatus, canTransition } = require('../../constants/oftStatus.js');
const { validateFileSize } = require('../../utils/fileValidation.js');
const formAttachmentService = require('../formAttachmentService.js');

const OFT_RESULT_FORM_CODE = 'oft_result';

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

        if (!source.expectedCompletionDate) {
            throw new ValidationError('Cannot transfer OFT without expectedCompletionDate');
        }

        const nextExpectedCompletionDate = new Date(source.expectedCompletionDate);
        if (Number.isNaN(nextExpectedCompletionDate.getTime())) {
            throw new ValidationError('Invalid source expectedCompletionDate for transfer');
        }
        nextExpectedCompletionDate.setFullYear(nextExpectedCompletionDate.getFullYear() + 1);

        return oftRepository.transferToNextYearTx(source, nextExpectedCompletionDate);
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
        await _linkAttachments(payload, result, source, user);
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
        const result = await oftRepository.updateResultReportTx(id, payload);
        await _linkAttachments(payload, result, source, user);
        return result;
    },

    getResult: async (id, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('OFT record');
        const result = await oftRepository.getResultByOftId(id);
        if (!result) throw new NotFoundError('OFT result report');
        const attachments = await formAttachmentService.listByRecord({
            formCode: OFT_RESULT_FORM_CODE,
            recordId: result.oftResultReportId,
            kvkId: source.kvkId,
        }, user);
        return {
            ...result,
            photos: attachments.filter((a) => a.kind === 'PHOTO'),
            datasheets: attachments.filter((a) => a.kind === 'DATASHEET'),
        };
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

async function _linkAttachments(payload, result, source, user) {
    if (!result?.oftResultReportId || !source?.kvkId) return;
    const ids = Array.isArray(payload?.attachmentIds) ? payload.attachmentIds : [];
    if (ids.length === 0) return;
    await formAttachmentService.attachToRecord({
        attachmentIds: ids,
        formCode: OFT_RESULT_FORM_CODE,
        recordId: result.oftResultReportId,
        kvkId: source.kvkId,
    }, user);
}

module.exports = oftService;
