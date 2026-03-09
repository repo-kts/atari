const prisma = require('../config/prisma.js');
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
 * Normalize string value
 * @param {any} v - Value to normalize
 * @returns {string|null} Normalized string or null
 */
const normalizeString = (v) => {
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
const parseInteger = (value, fieldName, allowNull = true) => {
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
const parseDate = (value, fieldName, allowNull = true) => {
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
const validateDateRange = (startDate, endDate) => {
    if (startDate && endDate && endDate < startDate) {
        throw new RepositoryError('End date must be greater than or equal to start date', 'VALIDATION_ERROR', 400);
    }
};

/**
 * Validate KVK exists
 * @param {number} kvkId - KVK ID to validate
 * @throws {RepositoryError} If KVK doesn't exist
 */
const validateKvkExists = async (kvkId) => {
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
const validateFldExists = async (fldId, kvkId) => {
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
const resolveStaffId = async (value, kvkId, required = false) => {
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
 * Resolve activity ID from activity name or ID (for FldActivity)
 * @param {string|number} value - Activity name or ID
 * @param {boolean} required - Whether activity is required
 * @returns {Promise<number|null>} Activity ID or null
 * @throws {RepositoryError} If activity is required but not found
 */
const resolveActivityId = async (value, required = false) => {
    if (!value) {
        if (required) {
            throw new RepositoryError('Activity ID or name is required', 'VALIDATION_ERROR', 400);
        }
        return null;
    }

    // If it's already a valid ID, validate it exists
    if (!isNaN(parseInt(value))) {
        const activityId = parseInt(value);
        try {
            const activity = await prisma.fldActivity.findUnique({
                where: { activityId }
            });
            if (!activity) {
                if (required) {
                    throw new RepositoryError(`Activity with ID ${activityId} does not exist`, 'NOT_FOUND', 404);
                }
                return null;
            }
            return activityId;
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Error validating activity: ${error.message}`, 'DATABASE_ERROR', 500);
        }
    }

    // Value is a name, find or create activity
    const activityName = normalizeString(value);
    if (!activityName) {
        if (required) {
            throw new RepositoryError('Activity name cannot be empty', 'VALIDATION_ERROR', 400);
        }
        return null;
    }

    try {
        const activity = await prisma.$transaction(async (tx) => {
            let a = await tx.fldActivity.findFirst({
                where: { activityName: { equals: activityName, mode: 'insensitive' } }
            });
            if (!a) {
                a = await tx.fldActivity.create({ data: { activityName } });
            }
            return a;
        });

        return activity ? activity.activityId : null;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new RepositoryError('Activity with this name already exists', 'DUPLICATE_ERROR', 409);
            }
            throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
        }
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(`Error resolving activity: ${error.message}`, 'DATABASE_ERROR', 500);
    }
};

/**
 * Resolve other extension activity type ID from name or ID
 * @param {string|number} value - Activity type name or ID
 * @param {boolean} required - Whether activity type is required
 * @returns {Promise<number|null>} Activity type ID or null
 * @throws {RepositoryError} If activity type is required but not found
 */
const resolveOtherExtensionActivityTypeId = async (value, required = false) => {
    if (!value) {
        if (required) {
            throw new RepositoryError('Activity type ID or name is required', 'VALIDATION_ERROR', 400);
        }
        return null;
    }

    // If it's already a valid ID, validate it exists
    if (!isNaN(parseInt(value))) {
        const activityTypeId = parseInt(value);
        try {
            const activityType = await prisma.otherExtensionActivityType.findUnique({
                where: { activityTypeId }
            });
            if (!activityType) {
                if (required) {
                    throw new RepositoryError(`Activity type with ID ${activityTypeId} does not exist`, 'NOT_FOUND', 404);
                }
                return null;
            }
            return activityTypeId;
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Error validating activity type: ${error.message}`, 'DATABASE_ERROR', 500);
        }
    }

    // Value is a name, find or create activity type
    const activityName = normalizeString(value);
    if (!activityName) {
        if (required) {
            throw new RepositoryError('Activity type name cannot be empty', 'VALIDATION_ERROR', 400);
        }
        return null;
    }

    try {
        const activityType = await prisma.$transaction(async (tx) => {
            let a = await tx.otherExtensionActivityType.findFirst({
                where: { activityName: { equals: activityName, mode: 'insensitive' } }
            });
            if (!a) {
                a = await tx.otherExtensionActivityType.create({ data: { activityName } });
            }
            return a;
        });

        return activityType ? activityType.activityTypeId : null;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new RepositoryError('Activity type with this name already exists', 'DUPLICATE_ERROR', 409);
            }
            throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
        }
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(`Error resolving activity type: ${error.message}`, 'DATABASE_ERROR', 500);
    }
};

/**
 * Normalize participant data from various input formats
 * @param {object} data - Input data object
 * @param {boolean} includeDefaults - If true, include all fields with default 0; if false, only include provided fields
 * @returns {object} Normalized participant data
 * @throws {RepositoryError} If participant count is invalid
 */
const normalizeParticipantData = (data, includeDefaults = false) => {
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

/**
 * Normalize officials-only participant data (no farmers)
 * @param {object} data - Input data object
 * @param {boolean} includeDefaults - If true, include all fields with default 0; if false, only include provided fields
 * @returns {object} Normalized officials participant data
 * @throws {RepositoryError} If participant count is invalid
 */
const normalizeOfficialsData = (data, includeDefaults = false) => {
    const mapping = {
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

/**
 * Normalize farmer-only participant data (no officials)
 * Used for entities like Production Supply that only have farmer fields
 * @param {object} data - Input data object
 * @param {boolean} includeDefaults - If true, include all fields with default 0; if false, only include provided fields
 * @returns {object} Normalized farmer participant data
 * @throws {RepositoryError} If participant count is invalid
 */
const normalizeFarmersData = (data, includeDefaults = false) => {
    const mapping = {
        gen_m: 'farmersGeneralM',
        gen_f: 'farmersGeneralF',
        obc_m: 'farmersObcM',
        obc_f: 'farmersObcF',
        sc_m: 'farmersScM',
        sc_f: 'farmersScF',
        st_m: 'farmersStM',
        st_f: 'farmersStF',
    };

    const normalized = {};
    for (const [frontendKey, backendKey] of Object.entries(mapping)) {
        const val = data[frontendKey] !== undefined ? data[frontendKey] : data[backendKey];
        
        // If includeDefaults is true, always include the field (default to 0 if not provided)
        // If includeDefaults is false, only include if value is provided
        if (includeDefaults) {
            // Always include with default 0 if not provided
            if (val === undefined || val === null || val === '') {
                normalized[backendKey] = 0;
            } else {
                const parsed = parseInt(val);
                if (isNaN(parsed) || parsed < 0) {
                    throw new RepositoryError(`Invalid participant count for ${backendKey}: must be a non-negative integer`, 'VALIDATION_ERROR', 400);
                }
                normalized[backendKey] = parsed;
            }
        } else if (val !== undefined && val !== null && val !== '') {
            // Only include if value is provided
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed < 0) {
                throw new RepositoryError(`Invalid participant count for ${backendKey}: must be a non-negative integer`, 'VALIDATION_ERROR', 400);
            }
            normalized[backendKey] = parsed;
        }
    }
    return normalized;
};

/**
 * Validate UUID string
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} allowNull - Whether null is allowed
 * @returns {string|null} Valid UUID string or null
 * @throws {RepositoryError} If value is invalid
 */
const validateUUID = (value, fieldName, allowNull = true) => {
    if (value === null || value === undefined) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} is required`, 'VALIDATION_ERROR', 400);
    }
    const str = String(value).trim();
    if (str.length === 0) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} is required`, 'VALIDATION_ERROR', 400);
    }
    // Basic UUID v4 format validation (8-4-4-4-12 hex characters)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(str)) {
        throw new RepositoryError(`Invalid ${fieldName}: must be a valid UUID`, 'VALIDATION_ERROR', 400);
    }
    return str;
};

module.exports = {
    RepositoryError,
    normalizeString,
    parseInteger,
    parseDate,
    validateDateRange,
    validateKvkExists,
    validateFldExists,
    resolveStaffId,
    resolveActivityId,
    resolveOtherExtensionActivityTypeId,
    normalizeParticipantData,
    normalizeOfficialsData,
    normalizeFarmersData,
    validateUUID,
};
