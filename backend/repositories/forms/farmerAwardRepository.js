const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
    validateUUID,
} = require('../../utils/repositoryHelpers');
const { normalizeRequiredIndianMobile } = require('../../utils/validation.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

/**
 * Farmer Award Repository
 * Handles all database operations for Farmer Awards
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
    
    // Normalize string value by removing commas and other non-digit decorators
    let normalized = value;
    if (typeof value === 'string') {
        normalized = value.replace(/,/g, '').trim();
    }
    
    const parsed = parseInt(normalized);
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
        id: r.farmerAwardId,
        reportingYear,
        achievement: r.achievement,
        conferringAuthority: r.conferringAuthority,
        image: r.image,
        // Frontend FIELD_NAMES alignment
        kvkName: r.kvk?.kvkName,
        reportingYear: reportingYear,
        farmerName: r.farmerName,
        contactNumber: r.contactNumber,
        address: r.address,
        award: r.awardName,
        amount: r.amount,
        achievement: r.achievement,
        conferringAuthority: r.conferringAuthority,
        farmerAwardId: r.farmerAwardId,
        kvkId: r.kvkId,
        contactNumber: r.contactNumber,
        contactNo: r.contactNumber, // Frontend compatibility
        address: r.address,
        awardName: r.awardName,
        amount: r.amount,
        achievement: r.achievement,
        conferringAuthority: r.conferringAuthority,
        image: r.image,
        year: reportingYear,
    };
};

const farmerAwardRepository = {
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
            const farmerName = _normalizeString(data.farmerName, 'Farmer Name', false);
            const contactNumber = normalizeRequiredIndianMobile(
                _normalizeString(data.contactNumber || data.contactNo, 'Contact Number', false),
                'Contact Number',
            );
            const address = _normalizeString(data.address, 'Address', false);
            const awardName = _normalizeString(data.awardName, 'Award Name', false);
            const amount = _parseInteger(data.amount, 'Amount', false);
            const achievement = _normalizeString(data.achievement, 'Achievement', false);
            const conferringAuthority = _normalizeString(data.conferringAuthority, 'Conferring Authority', false);
            const image = _normalizeString(data.image, 'Image', false);

            // Prepare create data
            const createData = {
                kvkId,
                reportingYear,
                farmerName,
                contactNumber,
                address,
                awardName,
                amount,
                achievement,
                conferringAuthority,
                image: data.image ? (typeof data.image === 'string' ? data.image : JSON.stringify(data.image)) : null,
            };

            // Create the record using Prisma
            const result = await prisma.farmerAward.create({
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
            throw new RepositoryError(`Failed to create farmer award record: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        try {
            const where = {};

            // Strict isolation for KVK-scoped users
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
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
            const records = await prisma.farmerAward.findMany({
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
            throw new RepositoryError(`Failed to fetch farmer awards: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    findById: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const farmerAwardId = validateUUID(id, 'id', false);
            const where = { farmerAwardId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            const record = await prisma.farmerAward.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                },
            });

            if (!record) {
                throw new RepositoryError('Farmer award not found or unauthorized', 'NOT_FOUND', 404);
            }

            return _mapResponse(record);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch farmer award: ${error.message}`, 'FETCH_ERROR', 500);
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

            const farmerAwardId = validateUUID(id, 'id', false);
            const where = { farmerAwardId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.farmerAward.findFirst({
                where,
                select: { farmerAwardId: true },
            });

            if (!existing) {
                throw new RepositoryError('Farmer award not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Validate and resolve foreign keys if provided
            const updateData = {};

            if (data.reportingYear !== undefined) {
                const parsedDate = parseReportingYearDate(data.reportingYear);
                ensureNotFutureDate(parsedDate);
                updateData.reportingYear = parsedDate;
            }

            // Update fields if provided
            if (data.farmerName !== undefined) {
                updateData.farmerName = _normalizeString(data.farmerName, 'Farmer Name', false);
            }
            if (data.contactNumber !== undefined || data.contactNo !== undefined) {
                updateData.contactNumber = normalizeRequiredIndianMobile(
                    _normalizeString(data.contactNumber || data.contactNo, 'Contact Number', false),
                    'Contact Number',
                );
            }
            if (data.image !== undefined) {
                updateData.image = data.image ? (typeof data.image === 'string' ? data.image : JSON.stringify(data.image)) : null;
            }
            if (data.address !== undefined) {
                updateData.address = _normalizeString(data.address, 'Address', false);
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
            if (data.image !== undefined) {
                if (data.image === null || (typeof data.image === 'string' && data.image.trim() === '')) {
                    updateData.image = null;
                } else if (typeof data.image === 'string') {
                    updateData.image = data.image.trim();
                }
                // If data.image is something else (like an object or non-empty string already handled), we don't set it to null
            }

            // Update the record
            const result = await prisma.farmerAward.update({
                where: { farmerAwardId },
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
                    throw new RepositoryError('Farmer award not found', 'NOT_FOUND', 404);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to update farmer award: ${error.message}`, 'UPDATE_ERROR', 500);
        }
    },

    delete: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const farmerAwardId = validateUUID(id, 'id', false);
            const where = { farmerAwardId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.farmerAward.findFirst({
                where,
                select: { farmerAwardId: true },
            });

            if (!existing) {
                throw new RepositoryError('Farmer award not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Delete the record
            await prisma.farmerAward.delete({
                where: { farmerAwardId },
            });

            return { success: true, message: 'Farmer award deleted successfully' };
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Farmer award not found', 'NOT_FOUND', 404);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to delete farmer award: ${error.message}`, 'DELETE_ERROR', 500);
        }
    },
};

module.exports = farmerAwardRepository;
