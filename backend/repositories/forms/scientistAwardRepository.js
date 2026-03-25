const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
    validateUUID,
} = require('../../utils/repositoryHelpers');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

/**
 * Scientist Award Repository
 * Handles all database operations for Scientist Awards
 */

/**
 * Normalize string value
 * @param {any} value - Value to normalize
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} allowNull - Whether null is allowed
 * @returns {string|null} Normalized string or null
 * @throws {RepositoryError} If value is invalid
 */
const _normalizeString = (value, fieldName, allowNull = true) => {
    if (value === null || value === undefined) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} is required`, 'VALIDATION_ERROR', 400);
    }
    const normalized = String(value).trim();
    if (normalized.length === 0) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} cannot be empty`, 'VALIDATION_ERROR', 400);
    }
    return normalized;
};

/**
 * Parse integer value with validation
 * @param {any} value - Value to parse
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} allowNull - Whether null is allowed
 * @returns {number|null} Parsed integer or null
 * @throws {RepositoryError} If value is invalid
 */
const _parseInteger = (value, fieldName, allowNull = true) => {
    if (value === null || value === undefined || value === '') {
        if (allowNull) return null;
        return 0; // Default to 0 for required fields if empty string provided
    }
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 0) {
        throw new RepositoryError(`Invalid ${fieldName}: must be a non-negative integer`, 'VALIDATION_ERROR', 400);
    }
    return parsed;
};

/**
 * Validate foreign key exists
 * @param {any} id - Foreign key ID
 * @param {string} modelName - Prisma model name
 * @param {string} idField - ID field name
 * @param {string} displayName - Display name for errors
 * @param {boolean} required - Whether the field is required
 * @returns {Promise<void>}
 * @throws {RepositoryError} If validation fails
 */
const _validateForeignKey = async (id, modelName, idField, displayName, required = false) => {
    if (!id) {
        if (required) {
            throw new RepositoryError(`${displayName} is required`, 'VALIDATION_ERROR', 400);
        }
        return;
    }

    const parsedId = parseInteger(id, displayName, required);
    if (!parsedId) return;

    try {
        const exists = await prisma[modelName].findUnique({
            where: { [idField]: parsedId },
            select: { [idField]: true },
        });

        if (!exists) {
            throw new RepositoryError(`${displayName} not found`, 'VALIDATION_ERROR', 404);
        }
    } catch (error) {
        if (error instanceof RepositoryError) {
            throw error;
        }
        throw new RepositoryError(`Failed to validate ${displayName}: ${error.message}`, 'DATABASE_ERROR', 500);
    }
};

/**
 * Map database response to API format
 * @param {object} r - Database record
 * @returns {object} Mapped response
 */
const _mapResponse = (r) => {
    if (!r) return null;

    const reportingYear = formatReportingYear(r.reportingYear);

    return {
        ...r,
        id: r.scientistAwardId,
        reportingYear,
        kvkName: r.kvk?.kvkName,
        reportingYear: reportingYear,
        headScientist: r.scientistName,
        scientistName: r.scientistName,
        award: r.awardName,
        amount: r.amount,
        achievement: r.achievement,
        conferringAuthority: r.conferringAuthority,
        reportingYear: reportingYear,
        kvkName: r.kvk?.kvkName,
        headScientist: r.scientistName,
        scientistName: r.scientistName,
        award: r.awardName,
        scientistAwardId: r.scientistAwardId,
        scientistAwardID: r.scientistAwardId, // Legacy compatibility
        kvkId: r.kvkId,
        scientistName: r.scientistName,
        awardName: r.awardName,
        amount: r.amount,
        achievement: r.achievement,
        conferringAuthority: r.conferringAuthority,
        year: reportingYear,
    };
};

const scientistAwardRepository = {
    create: async (data, user) => {
        try {
            // Validate input
            if (!data || typeof data !== 'object') {
                throw new RepositoryError('Invalid input data', 'VALIDATION_ERROR', 400);
            }

            // Resolve kvkId: prioritized from user session, then from data
            let kvkId = (user && user.kvkId) ? parseInteger(user.kvkId, 'user.kvkId', false) :
                (data.kvkId ? parseInteger(data.kvkId, 'kvkId', false) : null);

            if (!kvkId) {
                throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            }

            // Validate KVK exists
            await validateKvkExists(kvkId);

            const reportingYear = parseReportingYearDate(data.reportingYear);
            ensureNotFutureDate(reportingYear);

            // Validate required fields
            const scientistName = _normalizeString(data.scientistName, 'Scientist Name', false);
            const awardName = _normalizeString(data.awardName, 'Award Name', false);
            const amount = _parseInteger(data.amount, 'Amount', false);
            const achievement = _normalizeString(data.achievement, 'Achievement', false);
            const conferringAuthority = _normalizeString(data.conferringAuthority, 'Conferring Authority', false);

            // Prepare create data
            const createData = {
                kvkId,
                reportingYear,
                scientistName,
                awardName,
                amount,
                achievement,
                conferringAuthority,
            };

            // Create the record using Prisma
            const result = await prisma.scientistAward.create({
                data: createData,
                include: {
                    kvk: { select: { kvkName: true } },
                }
            });

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new RepositoryError('A record with these values already exists', 'DUPLICATE_ERROR', 409);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to create scientist award record: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        try {
            const where = {};

            // Strict isolation for KVK-scoped users
            if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            } else if (filters.kvkId) {
                where.kvkId = parseInteger(filters.kvkId, 'kvkId', false);
            }

            // Additional filters
            if (filters.reportingYearFrom || filters.reportingYearTo) {
                where.reportingYear = {};
                if (filters.reportingYearFrom) {
                    const from = parseReportingYearDate(filters.reportingYearFrom);
                    if (from) {
                        ensureNotFutureDate(from);
                        from.setHours(0, 0, 0, 0);
                        where.reportingYear.gte = from;
                    }
                }
                if (filters.reportingYearTo) {
                    const to = parseReportingYearDate(filters.reportingYearTo);
                    if (to) {
                        ensureNotFutureDate(to);
                        to.setHours(23, 59, 59, 999);
                        where.reportingYear.lte = to;
                    }
                }
            }

            // Fetch records with relations
            const records = await prisma.scientistAward.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            return records.map(_mapResponse);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch scientist awards: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    findById: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const scientistAwardId = validateUUID(id, 'id', false);
            const where = { scientistAwardId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            const record = await prisma.scientistAward.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                },
            });

            if (!record) {
                throw new RepositoryError('Scientist award not found or unauthorized', 'NOT_FOUND', 404);
            }

            return _mapResponse(record);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch scientist award: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    update: async (id, data, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            if (!data || typeof data !== 'object') {
                throw new RepositoryError('Invalid input data', 'VALIDATION_ERROR', 400);
            }

            const scientistAwardId = validateUUID(id, 'id', false);
            const where = { scientistAwardId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.scientistAward.findFirst({
                where,
                select: { scientistAwardId: true },
            });

            if (!existing) {
                throw new RepositoryError('Scientist award not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Validate and resolve foreign keys if provided
            const updateData = {};

            if (data.reportingYear !== undefined) {
                const parsedDate = parseReportingYearDate(data.reportingYear);
                ensureNotFutureDate(parsedDate);
                updateData.reportingYear = parsedDate;
            }

            // Update fields if provided
            if (data.scientistName !== undefined) {
                updateData.scientistName = _normalizeString(data.scientistName, 'Scientist Name', false);
            }
            if (data.awardName !== undefined) {
                updateData.awardName = _normalizeString(data.awardName, 'Award Name', false);
            }
            if (data.amount !== undefined) {
                updateData.amount = _parseInteger(data.amount, 'Amount', false);
            }
            if (data.achievement !== undefined) {
                updateData.achievement = _normalizeString(data.achievement, 'Achievement', false);
            }
            if (data.conferringAuthority !== undefined) {
                updateData.conferringAuthority = _normalizeString(data.conferringAuthority, 'Conferring Authority', false);
            }

            // Update the record
            const result = await prisma.scientistAward.update({
                where: { scientistAwardId },
                data: updateData,
                include: {
                    kvk: { select: { kvkName: true } },
                },
            });

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Scientist award not found', 'NOT_FOUND', 404);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to update scientist award: ${error.message}`, 'UPDATE_ERROR', 500);
        }
    },

    delete: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const scientistAwardId = validateUUID(id, 'id', false);
            const where = { scientistAwardId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.scientistAward.findFirst({
                where,
                select: { scientistAwardId: true },
            });

            if (!existing) {
                throw new RepositoryError('Scientist award not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Delete the record
            await prisma.scientistAward.delete({
                where: { scientistAwardId },
            });

            return { success: true, message: 'Scientist award deleted successfully' };
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Scientist award not found', 'NOT_FOUND', 404);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to delete scientist award: ${error.message}`, 'DELETE_ERROR', 500);
        }
    },
};

module.exports = scientistAwardRepository;
