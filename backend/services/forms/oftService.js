const oftRepository = require('../../repositories/forms/oftRepository.js');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler.js');
const { OFT_STATUS, normalizeOftStatus, canTransition } = require('../../constants/oftStatus.js');
const { validateFileSize } = require('../../utils/fileValidation.js');
const { createAttachmentBinding } = require('./formAttachmentBinding.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

/**
 * Drop cached report data for this KVK's OFT sections so a freshly generated
 * report reflects the change. Best-effort — never blocks the write.
 */
async function _invalidateOftReports(kvkId) {
    if (!kvkId) return;
    try {
        await reportCacheInvalidationService.invalidateDataSourceForKvk('oftSummary', kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('oftDetailCards', kvkId);
    } catch (err) {
        console.warn('[oft] report cache invalidation failed:', err.message);
    }
}

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
        const created = await oftRepository.create(payload, user);
        await _invalidateOftReports(created?.kvkId ?? user?.kvkId);
        return created;
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
        const updated = await oftRepository.update(id, payload, user);
        await _invalidateOftReports(updated?.kvkId ?? user?.kvkId);
        return updated;
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

        const sourceReportingYear = source.reportingYear
            ? new Date(source.reportingYear)
            : sourceStartDate;
        if (!sourceReportingYear || Number.isNaN(sourceReportingYear.getTime())) {
            throw new ValidationError('Cannot transfer OFT without a valid reporting year');
        }

        const nextReportingYear = new Date(sourceReportingYear);
        nextReportingYear.setFullYear(nextReportingYear.getFullYear() + 1);
        const nextYear = nextReportingYear.getFullYear();
        const currentYear = new Date().getFullYear();
        if (nextYear > currentYear) {
            throw new ValidationError(
                `Cannot transfer to ${nextYear}: transfer to a future year is not allowed`
            );
        }

        // Expected Completion Date defaults to the last date (31-Dec) of the new reporting year.
        const nextExpectedCompletionDate = new Date(nextYear, 11, 31);

        const transferred = await oftRepository.transferToNextYearTx(source, nextReportingYear, nextExpectedCompletionDate);
        await _invalidateOftReports(source.kvkId);
        return transferred;
    },

    // Revoke/undo a transfer (super-admin). Deletes the generated next-year copy
    // and restores the source OFT to ONGOING — only when that copy is untouched.
    revokeTransfer: async (id, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) {
            throw new NotFoundError('OFT record');
        }
        if (normalizeOftStatus(source.status) !== OFT_STATUS.TRANSFERRED_TO_NEXT_YEAR) {
            throw new ValidationError('Only transferred OFT records can have their transfer revoked');
        }
        const children = await oftRepository.findTransferChildren(id);
        for (const child of children) {
            if (normalizeOftStatus(child.status) !== OFT_STATUS.ONGOING) {
                throw new ValidationError(
                    'Cannot revoke: the next-year OFT already has results or was transferred again.'
                );
            }
        }
        const restored = await oftRepository.revokeTransferTx(id, children.map(c => c.kvkOftId));
        await _invalidateOftReports(source.kvkId);
        return restored;
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
        await _invalidateOftReports(source.kvkId);
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
        await _invalidateOftReports(source.kvkId);
        return resultAttachments.decorate({ ...result, kvkId: source.kvkId }, user);
    },

    getResult: async (id, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('OFT record');
        const result = await oftRepository.getResultByOftId(id);
        // No result entered yet → return null (200) so the UI can open an empty
        // result form for first-time entry instead of treating it as an error.
        if (!result) return null;
        return resultAttachments.decorate({ ...result, kvkId: source.kvkId }, user);
    },

    deleteOft: async (id, user) => {
        const source = await oftRepository.findRawById(id, user);
        const result = await oftRepository.delete(id, user);
        await _invalidateOftReports(source?.kvkId ?? user?.kvkId);
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
