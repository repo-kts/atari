const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');
const crypto = require('crypto');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
    validateUUID,
    resolveStaffId,
} = require('../../utils/repositoryHelpers');

/**
 * HRD Program Repository
 * Handles all database operations for HRD Programs
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
 * Parse and validate date
 * @param {any} value - Value to parse
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} allowNull - Whether null is allowed
 * @returns {Date|null} Parsed date or null
 * @throws {RepositoryError} If value is invalid
 */
const _parseDate = (value, fieldName, allowNull = true) => {
    if (value === null || value === undefined) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} is required`, 'VALIDATION_ERROR', 400);
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        throw new RepositoryError(`Invalid ${fieldName}: must be a valid date`, 'VALIDATION_ERROR', 400);
    }
    return date;
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @throws {RepositoryError} If date range is invalid
 */
const _validateDateRange = (startDate, endDate) => {
    if (startDate && endDate && startDate > endDate) {
        throw new RepositoryError('End date must be after start date', 'VALIDATION_ERROR', 400);
    }
};

/**
 * Map database response to API format
 * @param {object} r - Database record
 * @returns {object} Mapped response
 */
const _mapResponse = (r) => {
    if (!r) return null;

    return {
        ...r,
        id: r.hrdProgramId,
        hrdProgramId: r.hrdProgramId,
        kvkId: r.kvkId,
        kvkStaffId: r.kvkStaffId,
        staffId: r.kvkStaffId, // Frontend compatibility
        courseName: r.courseName,
        startDate: r.startDate,
        endDate: r.endDate,
        organizerVenue: r.organizerVenue,
        kvkName: r.kvk?.kvkName,
        staff: r.staff?.staffName,
        staffName: r.staff?.staffName,
        postName: r.staff?.sanctionedPost?.postName,
        course: r.courseName,
        courseName: r.courseName,
        startDate: r.startDate,
        endDate: r.endDate,
        organizer: r.organizerVenue,
        organizerVenue: r.organizerVenue,
    };
};

const hrdRepository = {
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

            // Resolve staff ID
            const staffIdOrName = data.kvkStaffId || data.staffId || data.staffName;
            if (!staffIdOrName) {
                throw new RepositoryError('Staff selection is required', 'VALIDATION_ERROR', 400);
            }

            const kvkStaffId = await resolveStaffId(staffIdOrName, kvkId);

            // Validate required fields
            const courseName = _normalizeString(data.courseName, 'Course Name', false);
            const startDate = _parseDate(data.startDate, 'Start Date', false);
            const endDate = _parseDate(data.endDate, 'End Date', false);
            const organizerVenue = _normalizeString(data.organizerVenue, 'Organizer/Venue', false);

            // Validate date range
            _validateDateRange(startDate, endDate);

            const createData = {
                hrdProgramId: crypto.randomUUID(),
                kvkId,
                kvkStaffId,
                courseName,
                startDate,
                endDate,
                organizerVenue,
            };

            // Create the record using Prisma
            const result = await prisma.hrdProgram.create({
                data: createData,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: {
                        select: {
                            staffName: true,
                            sanctionedPost: { select: { postName: true } },
                        },
                    },
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
            throw new RepositoryError(`Failed to create HRD program record: ${error.message}`, 'CREATE_ERROR', 500);
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
            if (filters.kvkStaffId) {
                where.kvkStaffId = parseInteger(filters.kvkStaffId, 'kvkStaffId', false);
            }

            // Fetch records with relations
            const records = await prisma.hrdProgram.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: {
                        select: {
                            staffName: true,
                            sanctionedPost: { select: { postName: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return records.map(_mapResponse);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch HRD programs: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    findById: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const hrdProgramId = validateUUID(id, 'id', false);
            const where = { hrdProgramId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            const record = await prisma.hrdProgram.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: {
                        select: {
                            staffName: true,
                            sanctionedPost: { select: { postName: true } },
                        },
                    },
                },
            });

            if (!record) {
                throw new RepositoryError('HRD program not found or unauthorized', 'NOT_FOUND', 404);
            }

            return _mapResponse(record);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch HRD program: ${error.message}`, 'FETCH_ERROR', 500);
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

            const hrdProgramId = validateUUID(id, 'id', false);
            const where = { hrdProgramId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.hrdProgram.findFirst({
                where,
                select: { hrdProgramId: true, kvkId: true },
            });

            if (!existing) {
                throw new RepositoryError('HRD program not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Prepare update data
            const updateData = {};

            // Resolve staff ID if provided
            if (data.kvkStaffId !== undefined || data.staffId !== undefined || data.staffName !== undefined) {
                const staffIdOrName = data.kvkStaffId || data.staffId || data.staffName;
                const kvkStaffId = await resolveStaffId(staffIdOrName, existing.kvkId);
                updateData.kvkStaffId = kvkStaffId;
            }

            // Update fields if provided
            if (data.courseName !== undefined) {
                updateData.courseName = _normalizeString(data.courseName, 'Course Name', false);
            }
            if (data.startDate !== undefined) {
                updateData.startDate = _parseDate(data.startDate, 'Start Date', false);
            }
            if (data.endDate !== undefined) {
                updateData.endDate = _parseDate(data.endDate, 'End Date', false);
            }
            if (data.organizerVenue !== undefined) {
                updateData.organizerVenue = _normalizeString(data.organizerVenue, 'Organizer/Venue', false);
            }

            // Validate date range if both dates are being updated
            if (updateData.startDate && updateData.endDate) {
                _validateDateRange(updateData.startDate, updateData.endDate);
            } else if (updateData.startDate && existing.endDate) {
                _validateDateRange(updateData.startDate, new Date(existing.endDate));
            } else if (updateData.endDate && existing.startDate) {
                _validateDateRange(new Date(existing.startDate), updateData.endDate);
            }

            // Update the record
            const result = await prisma.hrdProgram.update({
                where: { hrdProgramId },
                data: updateData,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: {
                        select: {
                            staffName: true,
                            sanctionedPost: { select: { postName: true } },
                        },
                    },
                },
            });

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('HRD program not found', 'NOT_FOUND', 404);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to update HRD program: ${error.message}`, 'UPDATE_ERROR', 500);
        }
    },

    delete: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const hrdProgramId = validateUUID(id, 'id', false);
            const where = { hrdProgramId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.hrdProgram.findFirst({
                where,
                select: { hrdProgramId: true },
            });

            if (!existing) {
                throw new RepositoryError('HRD program not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Delete the record
            await prisma.hrdProgram.delete({
                where: { hrdProgramId },
            });

            return { success: true, message: 'HRD program deleted successfully' };
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('HRD program not found', 'NOT_FOUND', 404);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to delete HRD program: ${error.message}`, 'DELETE_ERROR', 500);
        }
    },
};

module.exports = hrdRepository;
