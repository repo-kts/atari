const oftRepository = require('../../repositories/forms/oftRepository.js');
const prisma = require('../../config/prisma.js');
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

        if (!source.reportingYearId) {
            throw new ValidationError('Cannot transfer OFT without reportingYearId');
        }

        let nextYear = await prisma.yearMaster.findFirst({
            where: { yearId: { gt: source.reportingYearId } },
            orderBy: { yearId: 'asc' },
            select: { yearId: true, yearName: true },
        });

        // Fallback: derive chronological order from yearName (e.g. "2023-24")
        // for databases where yearId ordering does not reflect actual year progression.
        if (!nextYear) {
            const allYears = await prisma.yearMaster.findMany({
                select: { yearId: true, yearName: true },
                orderBy: { yearId: 'asc' },
            });

            const current = allYears.find((year) => year.yearId === source.reportingYearId);
            const currentStart = _extractYearStart(current?.yearName);

            if (currentStart !== null) {
                const candidate = allYears
                    .map((year) => ({ ...year, start: _extractYearStart(year.yearName) }))
                    .filter((year) => year.start !== null && year.start > currentStart)
                    .sort((a, b) => a.start - b.start)[0];

                if (candidate) {
                    nextYear = candidate;
                }
            }
        }

        if (!nextYear) {
            throw new ValidationError('No next reporting year found for transfer');
        }

        return oftRepository.transferToNextYearTx(source, nextYear.yearId);
    },

    addResult: async (id, payload, user) => {
        const source = await oftRepository.findRawById(id, user);
        if (!source) throw new NotFoundError('OFT record');

        const sourceStatus = normalizeOftStatus(source.status);
        if (!canTransition(sourceStatus, OFT_STATUS.COMPLETED)) {
            throw new ValidationError('Result can only be added for ONGOING OFT records');
        }

        _validateResultPayload(payload);

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

        _validateResultPayload(payload);
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

function _validateResultPayload(payload) {
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

    validateFileSize({ size: payload.supplementaryDatasheetSize }, 2 * 1024 * 1024, 'Supplementary Datasheet');
    validateFileSize({ size: payload.photographSize }, 1 * 1024 * 1024, 'Photograph');
}

module.exports = oftService;

function _extractYearStart(yearName) {
    if (!yearName) return null;
    const match = String(yearName).match(/(19|20)\d{2}/);
    return match ? Number(match[0]) : null;
}
