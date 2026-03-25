const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
    validateUUID,
} = require('../../utils/repositoryHelpers');

/**
 * Publication Details Repository
 * Handles all database operations for KVK Publication Details
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

    // Calculate reporting year from yearId if available
    const reportingYear = r.reportingYear?.yearName || r.reportingYearId || null;

    return {
        ...r,
        id: r.publicationDetailsId,
        reportingYear,
        publicationDetailsId: r.publicationDetailsId,
        kvkId: r.kvkId,
        reportingYearId: r.reportingYearId,
        publicationId: r.publicationId,
        title: r.title,
        authorName: r.authorName,
        journalName: r.journalName,
        kvkName: r.kvk?.kvkName,
        reportingYear: reportingYear,
        publicationItem: r.publication?.publicationName,
        title: r.title,
        authorName: r.authorName,
        journalName: r.journalName,
        publicationId: r.publicationId,
        year: reportingYear,
        yearId: r.reportingYearId,
        publication: r.publication?.publicationName || r.publicationId,
    };
};

const publicationDetailsRepository = {
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

            // Validate and resolve foreign keys
            const reportingYearId = data.reportingYearId || data.reportingYear || data.yearId;
            if (reportingYearId) {
                await _validateForeignKey(reportingYearId, 'yearMaster', 'yearId', 'Reporting Year', false);
            }

            const publicationId = data.publicationId || data.publication;
            if (publicationId) {
                await _validateForeignKey(publicationId, 'publication', 'publicationId', 'Publication', false);
            }

            // Validate required fields
            const title = _normalizeString(data.title, 'Title', false);
            const authorName = _normalizeString(data.authorName, 'Author Name', false);
            const journalName = _normalizeString(data.journalName, 'Journal Name', false);

            // Prepare create data
            const createData = {
                kvkId,
                reportingYearId: reportingYearId ? parseInteger(reportingYearId, 'reportingYearId', false) : null,
                publicationId: publicationId ? parseInteger(publicationId, 'publicationId', false) : null,
                title,
                authorName,
                journalName,
            };

            // Create the record using Prisma
            const result = await prisma.kvkPublicationDetails.create({
                data: createData,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: { select: { yearName: true } },
                    publication: { select: { publicationName: true } },
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
            throw new RepositoryError(`Failed to create publication details record: ${error.message}`, 'CREATE_ERROR', 500);
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
            if (filters.reportingYearId) {
                where.reportingYearId = parseInteger(filters.reportingYearId, 'reportingYearId', false);
            }
            if (filters.publicationId) {
                where.publicationId = parseInteger(filters.publicationId, 'publicationId', false);
            }

            // Fetch records with relations
            const records = await prisma.kvkPublicationDetails.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: { select: { yearName: true } },
                    publication: { select: { publicationName: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            return records.map(_mapResponse);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch publication details: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    findById: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const publicationDetailsId = validateUUID(id, 'id', false);
            const where = { publicationDetailsId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            const record = await prisma.kvkPublicationDetails.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: { select: { yearName: true } },
                    publication: { select: { publicationName: true } },
                },
            });

            if (!record) {
                throw new RepositoryError('Publication details not found or unauthorized', 'NOT_FOUND', 404);
            }

            return _mapResponse(record);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch publication details: ${error.message}`, 'FETCH_ERROR', 500);
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

            const publicationDetailsId = validateUUID(id, 'id', false);
            const where = { publicationDetailsId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.kvkPublicationDetails.findFirst({
                where,
                select: { publicationDetailsId: true },
            });

            if (!existing) {
                throw new RepositoryError('Publication details not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Validate and resolve foreign keys if provided
            const updateData = {};

            if (data.reportingYearId !== undefined || data.reportingYear !== undefined || data.yearId !== undefined) {
                const reportingYearId = data.reportingYearId || data.reportingYear || data.yearId;
                if (reportingYearId) {
                    await _validateForeignKey(reportingYearId, 'yearMaster', 'yearId', 'Reporting Year', false);
                    updateData.reportingYearId = parseInteger(reportingYearId, 'reportingYearId', false);
                } else {
                    updateData.reportingYearId = null;
                }
            }

            if (data.publicationId !== undefined || data.publication !== undefined) {
                const publicationId = data.publicationId || data.publication;
                if (publicationId) {
                    await _validateForeignKey(publicationId, 'publication', 'publicationId', 'Publication', false);
                    updateData.publicationId = parseInteger(publicationId, 'publicationId', false);
                } else {
                    updateData.publicationId = null;
                }
            }

            // Update fields if provided
            if (data.title !== undefined) {
                updateData.title = _normalizeString(data.title, 'Title', false);
            }
            if (data.authorName !== undefined) {
                updateData.authorName = _normalizeString(data.authorName, 'Author Name', false);
            }
            if (data.journalName !== undefined) {
                updateData.journalName = _normalizeString(data.journalName, 'Journal Name', false);
            }

            // Update the record
            const result = await prisma.kvkPublicationDetails.update({
                where: { publicationDetailsId },
                data: updateData,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: { select: { yearName: true } },
                    publication: { select: { publicationName: true } },
                },
            });

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Publication details not found', 'NOT_FOUND', 404);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to update publication details: ${error.message}`, 'UPDATE_ERROR', 500);
        }
    },

    delete: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const publicationDetailsId = validateUUID(id, 'id', false);
            const where = { publicationDetailsId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.kvkPublicationDetails.findFirst({
                where,
                select: { publicationDetailsId: true },
            });

            if (!existing) {
                throw new RepositoryError('Publication details not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Delete the record
            await prisma.kvkPublicationDetails.delete({
                where: { publicationDetailsId },
            });

            return { success: true, message: 'Publication details deleted successfully' };
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Publication details not found', 'NOT_FOUND', 404);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to delete publication details: ${error.message}`, 'DELETE_ERROR', 500);
        }
    },
};

module.exports = publicationDetailsRepository;
