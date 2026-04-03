const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');

/**
 * Custom error class for repository errors
 */
class RepositoryError extends Error {
    constructor(message, code = 'REPOSITORY_ERROR', statusCode = 400) {
        super(message);
        this.name = 'RepositoryError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

/**
 * Normalize activity name
 * @param {any} v - Value to normalize
 * @returns {string|null} Normalized name or null
 */
const normalizeActivityName = (v) => {
    if (v === undefined || v === null) return null;
    const name = String(v).trim();
    return name.length > 0 ? name : null;
};

/**
 * Safely parse integer with validation
* @param {any} value - Value to parse
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} allowNull - Whether null is allowed
 * @returns {number|null} Parsed integer or null
 * @throws {RepositoryError} If value is invalid
 */
const _parseInt = (value, fieldName, allowNull = true) => {
    if (value === null || value === undefined) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} is required`, 'VALIDATION_ERROR', 400);
    }
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 0) {
        throw new RepositoryError(`Invalid ${fieldName}: must be a non-negative integer`, 'VALIDATION_ERROR', 400);
    }
    return parsed;
};

/**
 * Validate and parse date
 * @param {any} value - Date value to validate
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} allowNull - Whether null is allowed
 * @returns {Date|null} Valid date or null
 * @throws {RepositoryError} If date is invalid
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
 * @param {Date|null} startDate - Start date
 * @param {Date|null} endDate - End date
 * @throws {RepositoryError} If date range is invalid
 */
const _validateDateRange = (startDate, endDate) => {
    if (startDate && endDate && endDate < startDate) {
        throw new RepositoryError('End date must be greater than or equal to start date', 'VALIDATION_ERROR', 400);
    }
};

/**
 * Validate KVK exists
 * @param {number} kvkId - KVK ID to validate
 * @throws {RepositoryError} If KVK doesn't exist
 */
const _validateKvkExists = async (kvkId) => {
    if (!kvkId || isNaN(kvkId)) {
        throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
    }
    const kvk = await prisma.kvk.findUnique({ where: { kvkId: parseInt(kvkId) } });
    if (!kvk) {
        throw new RepositoryError(`KVK with ID ${kvkId} does not exist`, 'NOT_FOUND', 404);
    }
};

/**
 * Validate FLD exists (if provided)
 * @param {number|null} fldId - FLD ID to validate
 * @param {number} kvkId - KVK ID for validation
 * @throws {RepositoryError} If FLD doesn't exist
 */
const _validateFldExists = async (fldId, kvkId) => {
    if (!fldId) return;
    const fld = await prisma.kvkFldIntroduction.findFirst({
        where: {
            kvkFldId: parseInt(fldId),
            kvkId: parseInt(kvkId)
        }
    });
    if (!fld) {
        throw new RepositoryError(`FLD with ID ${fldId} does not exist for this KVK`, 'NOT_FOUND', 404);
    }
};

/**
 * Resolve staff ID from staff name or ID
 * @param {string|number} value - Staff name or ID
 * @param {number} kvkId - KVK ID for filtering
 * @param {boolean} required - Whether staff is required
 * @returns {Promise<number|null>} Staff ID or null
 * @throws {RepositoryError} If staff is required but not found
 */
const _resolveStaffId = async (value, kvkId, required = false) => {
    if (!value) {
        if (required) {
            throw new RepositoryError('Staff ID or name is required', 'VALIDATION_ERROR', 400);
        }
        return null;
    }

    // If it's already a valid ID, validate it exists
    if (!isNaN(parseInt(value))) {
        const staffId = parseInt(value);
        try {
            const staff = await prisma.kvkStaff.findFirst({
                where: {
                    kvkStaffId: staffId,
                    kvkId: parseInt(kvkId)
                }
            });
            if (!staff) {
                if (required) {
                    throw new RepositoryError(`Staff with ID ${staffId} does not exist for this KVK`, 'NOT_FOUND', 404);
                }
                return null;
            }
            return staffId;
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Error validating staff: ${error.message}`, 'DATABASE_ERROR', 500);
        }
    }

    // Value is a name, try to find in DB
    try {
        const existing = await prisma.kvkStaff.findFirst({
            where: {
                staffName: { equals: String(value), mode: 'insensitive' },
                kvkId: parseInt(kvkId)
            }
        });

        if (!existing && required) {
            throw new RepositoryError(`Staff with name "${value}" does not exist for this KVK`, 'NOT_FOUND', 404);
        }

        return existing ? existing.kvkStaffId : null;
    } catch (error) {
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(`Error resolving staff: ${error.message}`, 'DATABASE_ERROR', 500);
    }
};

/**
 * Resolve activity ID from Extension Activity Master (extension_activity table)
 * @param {string|number} value - Activity name or ID
 * @param {boolean} required - Whether activity is required
 * @returns {Promise<number|null>} Activity ID or null
 * @throws {RepositoryError} If activity is required but not found
 */
const _resolveActivityId = async (value, required = false) => {
    if (!value) {
        if (required) {
            throw new RepositoryError('Extension Activity ID or name is required', 'VALIDATION_ERROR', 400);
        }
        return null;
    }

    // If it's already a valid ID, validate it exists in Extension Activity Master
    if (!isNaN(parseInt(value))) {
        const activityId = parseInt(value);
        try {
            const activity = await prisma.fldActivity.findUnique({
                where: { activityId: activityId }
            });
            if (!activity) {
                if (required) {
                    throw new RepositoryError(`Extension Activity with ID ${activityId} does not exist`, 'NOT_FOUND', 404);
                }
                return null;
            }
            return activityId;
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Error validating extension activity: ${error.message}`, 'DATABASE_ERROR', 500);
        }
    }

    // Value is a name, find in Extension Activity Master (don't create - must exist in master)
    const activityName = normalizeActivityName(value);
    if (!activityName) {
        if (required) {
            throw new RepositoryError('Extension Activity name cannot be empty', 'VALIDATION_ERROR', 400);
        }
        return null;
    }

    try {
        const activity = await prisma.fldActivity.findFirst({
            where: { activityName: { equals: activityName, mode: 'insensitive' } }
        });

        if (!activity && required) {
            throw new RepositoryError(`Extension Activity with name "${activityName}" does not exist in master data`, 'NOT_FOUND', 404);
        }

        return activity ? activity.activityId : null;
    } catch (error) {
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(`Error resolving extension activity: ${error.message}`, 'DATABASE_ERROR', 500);
    }
};

/**
 * Normalize participant data from various input formats
 * @param {object} data - Input data object
 * @param {boolean} includeDefaults - If true, include all fields with default 0; if false, only include provided fields
 * @returns {object} Normalized participant data
 * @throws {RepositoryError} If participant count is invalid
 */
const _normalizeParticipantData = (data, includeDefaults = false) => {
    const mapping = {
        gen_m: 'farmersGeneralM',
        gen_f: 'farmersGeneralF',
        obc_m: 'farmersObcM',
        obc_f: 'farmersObcF',
        sc_m: 'farmersScM',
        sc_f: 'farmersScF',
        st_m: 'farmersStM',
        st_f: 'farmersStF',
        ext_gen_m: 'officialsGeneralM',
        ext_gen_f: 'officialsGeneralF',
        ext_obc_m: 'officialsObcM',
        ext_obc_f: 'officialsObcF',
        ext_sc_m: 'officialsScM',
        ext_sc_f: 'officialsScF',
        ext_st_m: 'officialsStM',
        ext_st_f: 'officialsStF'
    };

    const normalized = {};
    for (const [frontendKey, backendKey] of Object.entries(mapping)) {
        const val = data[frontendKey] !== undefined ? data[frontendKey] : data[backendKey];
        if (includeDefaults || (val !== undefined && val !== null)) {
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed < 0) {
                throw new RepositoryError(`Invalid participant count for ${backendKey}: must be a non-negative integer`, 'VALIDATION_ERROR', 400);
            }
            normalized[backendKey] = parsed || 0;
        }
    }
    return normalized;
};

const extensionActivityRepository = {
    create: async (data, opts, user) => {
        try {
            // Validate input data
            if (!data || typeof data !== 'object') {
                throw new RepositoryError('Invalid input data', 'VALIDATION_ERROR', 400);
            }

            // Resolve kvkId: prioritized from user session (if linked to a KVK like Gaya), then from data.
            let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);

            if (!kvkId || isNaN(kvkId)) {
                throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            }
            kvkId = parseInt(kvkId);

            // Validate KVK exists
            await _validateKvkExists(kvkId);

            // Resolve staff ID
            let staffId = null;
            if (data.staffId !== undefined) {
                staffId = await _resolveStaffId(data.staffId, kvkId, false);
            } else if (data.staffName !== undefined) {
                staffId = await _resolveStaffId(data.staffName, kvkId, false);
            }

            // Resolve activity ID
            let activityId = null;
            if (data.activityId !== undefined) {
                activityId = await _resolveActivityId(data.activityId, false);
            } else if (data.extensionActivityType !== undefined) {
                activityId = await _resolveActivityId(data.extensionActivityType, false);
            }

            // Validate and parse fldId
            const fldId = data.fldId ? _parseInt(data.fldId, 'fldId', true) : null;
            if (fldId) {
                await _validateFldExists(fldId, kvkId);
            }

            // Validate and parse dates
            const startDate = data.startDate ? _parseDate(data.startDate, 'startDate', false) : null;
            const endDate = data.endDate ? _parseDate(data.endDate, 'endDate', false) : null;
            _validateDateRange(startDate, endDate);

            // Validate numberOfActivities
            const numberOfActivities = _parseInt(
                data.numberOfActivities ?? data.activityCount ?? 0,
                'numberOfActivities',
                false
            );

            // Prepare create data (include all participant fields with defaults)
            const createData = {
                kvkId,
                fldId,
                staffId,
                activityId,
                numberOfActivities,
                startDate,
                endDate,
                ..._normalizeParticipantData(data, true) // Include all fields with defaults for create
            };

            // Create the record using Prisma
            const result = await prisma.kvkExtensionActivity.create({
                data: createData,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: { select: { staffName: true } },
                    fldActivity: { select: { activityName: true } },
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
            throw new RepositoryError(`Failed to create extension activity: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        try {
            const where = {};
            // Strict isolation for KVK-scoped users (like Gaya)
            if (user && user.kvkId) {
                const kvkId = _parseInt(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            } else if (filters.kvkId) {
                const kvkId = _parseInt(filters.kvkId, 'filters.kvkId', false);
                where.kvkId = kvkId;
            }

            const results = await prisma.kvkExtensionActivity.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: { select: { staffName: true } },
                    fldActivity: { select: { activityName: true } },
                },
                orderBy: { extensionActivityId: 'desc' },
            });
            return results.map(_mapResponse);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch extension activities: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    findById: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const extensionActivityId = _parseInt(id, 'id', false);
            const where = { extensionActivityId };

            if (user && user.kvkId) {
                const kvkId = _parseInt(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            const result = await prisma.kvkExtensionActivity.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: { select: { staffName: true } },
                    fldActivity: { select: { activityName: true } },
                },
            });

            if (!result) {
                throw new RepositoryError('Extension activity not found', 'NOT_FOUND', 404);
            }

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch extension activity: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    update: async (id, data, user) => {
        try {
            // Validate input
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }
            if (!data || typeof data !== 'object') {
                throw new RepositoryError('Invalid input data', 'VALIDATION_ERROR', 400);
            }

            const extensionActivityId = _parseInt(id, 'id', false);
            const where = { extensionActivityId };

            if (user && user.kvkId) {
                const kvkId = _parseInt(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Verify record exists and user has access
            const existing = await prisma.kvkExtensionActivity.findFirst({ where });
            if (!existing) {
                throw new RepositoryError('Record not found or unauthorized', 'NOT_FOUND', 404);
            }

            const kvkId = existing.kvkId;
            const updateData = {};

            // Update fldId
            if (data.fldId !== undefined) {
                const fldId = data.fldId ? _parseInt(data.fldId, 'fldId', true) : null;
                if (fldId) {
                    await _validateFldExists(fldId, kvkId);
                }
                updateData.fldId = fldId;
            }

            // Resolve and update staff ID
            if (data.staffName !== undefined) {
                updateData.staffId = await _resolveStaffId(data.staffName, kvkId, false);
            } else if (data.staffId !== undefined) {
                updateData.staffId = await _resolveStaffId(data.staffId, kvkId, false);
            }

            // Resolve and update activity ID
            if (data.extensionActivityType !== undefined) {
                updateData.activityId = await _resolveActivityId(data.extensionActivityType, false);
            } else if (data.activityId !== undefined) {
                updateData.activityId = await _resolveActivityId(data.activityId, false);
            }

            // Update numberOfActivities
            const numberOfActivities = data.activityCount !== undefined ? data.activityCount : data.numberOfActivities;
            if (numberOfActivities !== undefined) {
                updateData.numberOfActivities = _parseInt(numberOfActivities, 'numberOfActivities', false);
            }

            // Update dates
            let startDate = existing.startDate;
            let endDate = existing.endDate;

            if (data.startDate !== undefined) {
                startDate = _parseDate(data.startDate, 'startDate', false);
            }
            if (data.endDate !== undefined) {
                endDate = _parseDate(data.endDate, 'endDate', false);
            }

            // Validate date range if both dates are present
            if (startDate && endDate) {
                _validateDateRange(startDate, endDate);
            }

            if (data.startDate !== undefined) {
                updateData.startDate = startDate;
            }
            if (data.endDate !== undefined) {
                updateData.endDate = endDate;
            }

            // Update participant data (only include fields that are explicitly provided)
            const participantData = _normalizeParticipantData(data, false);
            Object.assign(updateData, participantData);

            // Update the record using Prisma
            if (Object.keys(updateData).length > 0) {
                await prisma.kvkExtensionActivity.update({
                    where: { extensionActivityId },
                    data: updateData
                });
            }

            // Return updated record with relations
            return _mapResponse(await prisma.kvkExtensionActivity.findUnique({
                where: { extensionActivityId },
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: { select: { staffName: true } },
                    fldActivity: { select: { activityName: true } },
                },
            }));
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Record not found', 'NOT_FOUND', 404);
                }
                if (error.code === 'P2002') {
                    throw new RepositoryError('A record with these values already exists', 'DUPLICATE_ERROR', 409);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to update extension activity: ${error.message}`, 'UPDATE_ERROR', 500);
        }
    },

    delete: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const extensionActivityId = _parseInt(id, 'id', false);
            const where = { extensionActivityId };

            if (user && user.kvkId) {
                const kvkId = _parseInt(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Verify record exists before attempting delete
            const existing = await prisma.kvkExtensionActivity.findFirst({ where });
            if (!existing) {
                throw new RepositoryError('Record not found or unauthorized', 'NOT_FOUND', 404);
            }

            const result = await prisma.kvkExtensionActivity.deleteMany({
                where
            });

            if (result.count === 0) {
                throw new RepositoryError('Failed to delete record', 'DELETE_ERROR', 500);
            }

            return { success: true };
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new RepositoryError('Cannot delete record due to foreign key constraints', 'CONSTRAINT_ERROR', 409);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to delete extension activity: ${error.message}`, 'DELETE_ERROR', 500);
        }
    },
};

function _mapResponse(r) {
    if (!r) return null;
    const startDate = r.startDate ? new Date(r.startDate) : null;
    let reportingYear = null;
    if (startDate && !isNaN(startDate.getTime())) {
        const month = startDate.getMonth() + 1;
        const startYear = month >= 4 ? startDate.getFullYear() : startDate.getFullYear() - 1;
        reportingYear = String(startYear);
    }

    const activityName = r.fldActivity ? r.fldActivity.activityName : undefined;
    const farmersSum = (r.farmersGeneralM || 0) + (r.farmersGeneralF || 0) + (r.farmersObcM || 0) + (r.farmersObcF || 0) + (r.farmersScM || 0) + (r.farmersScF || 0) + (r.farmersStM || 0) + (r.farmersStF || 0);
    const officialsSum = (r.officialsGeneralM || 0) + (r.officialsGeneralF || 0) + (r.officialsObcM || 0) + (r.officialsObcF || 0) + (r.officialsScM || 0) + (r.officialsScF || 0) + (r.officialsStM || 0) + (r.officialsStF || 0);
    const totalParticipants = farmersSum + officialsSum;

    return {
        ...r,
        id: r.extensionActivityId,
        extensionActivityId: r.extensionActivityId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        fldId: r.fldId,
        staffId: r.staffId,
        staffName: r.staff ? r.staff.staffName : undefined,
        activityId: r.activityId,
        extensionActivityType: activityName,
        numberOfActivities: r.numberOfActivities,
        startDate: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
        endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
        reportingYear,
        nameOfExtensionActivities: activityName,
        noOfActivities: r.numberOfActivities,
        noOfParticipants: totalParticipants,
        farmersGeneralM: r.farmersGeneralM,
        farmersGeneralF: r.farmersGeneralF,
        farmersObcM: r.farmersObcM,
        farmersObcF: r.farmersObcF,
        farmersScM: r.farmersScM,
        farmersScF: r.farmersScF,
        farmersStM: r.farmersStM,
        farmersStF: r.farmersStF,
        officialsGeneralM: r.officialsGeneralM,
        officialsGeneralF: r.officialsGeneralF,
        officialsObcM: r.officialsObcM,
        officialsObcF: r.officialsObcF,
        officialsScM: r.officialsScM,
        officialsScF: r.officialsScF,
        officialsStM: r.officialsStM,
        officialsStF: r.officialsStF,
    };
}

module.exports = extensionActivityRepository;
module.exports.RepositoryError = RepositoryError;