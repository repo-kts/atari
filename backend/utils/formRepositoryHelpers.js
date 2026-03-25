const { sanitizeString, sanitizeInteger, sanitizeNumber, sanitizeDate, safeGet, removeIdFieldsForUpdate } = require('./dataSanitizer.js');
const { ValidationError } = require('./errorHandler.js');

/**
 * Form Repository Helpers
 * Reusable utilities for form repositories to reduce code duplication
 * and improve maintainability
 */

/**
 * Validate basic input data and user
 * @param {Object} data - Input data
 * @param {Object} user - User object
 * @throws {ValidationError} If validation fails
 */
function validateInput(data, user) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new ValidationError('Invalid data: must be an object');
    }
    if (!user || typeof user !== 'object') {
        throw new ValidationError('User information is required');
    }
}

/**
 * Resolve KVK ID based on user role
 * @param {Object} data - Request data
 * @param {Object} user - User object
 * @returns {number} KVK ID
 * @throws {ValidationError} If KVK ID is invalid
 */
function resolveKvkId(data, user) {
    const isKvkScoped = user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName);
    const kvkIdSource = isKvkScoped ? safeGet(user, 'kvkId') : safeGet(data, 'kvkId');
    const kvkId = sanitizeInteger(kvkIdSource);

    if (kvkId === null || kvkId === undefined || isNaN(kvkId)) {
        throw new ValidationError('Valid kvkId is required', 'kvkId');
    }

    return kvkId;
}

/**
 * Build role-based where clause for queries
 * @param {Object} user - User object
 * @param {Object} additionalWhere - Additional where conditions
 * @returns {Object} Where clause object
 */
function buildRoleBasedWhere(user, additionalWhere = {}) {
    const where = { ...additionalWhere };

    if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
        if (!user.kvkId) {
            return null; // Signal that user has no KVK access
        }
        where.kvkId = parseInt(user.kvkId);
    }

    return where;
}

/**
 * Validate and sanitize a required integer field
 * @param {Object} data - Data object
 * @param {string|Array} fieldNames - Field name(s) to check (supports aliases)
 * @param {string} errorMessage - Error message if validation fails
 * @param {string} errorField - Field name for error reporting
 * @param {Object} options - Additional options (defaultValue, allowNull, required)
 * @returns {number|null} Sanitized integer value or null if optional
 * @throws {ValidationError} If validation fails
 */
function validateRequiredInteger(data, fieldNames, errorMessage, errorField, options = {}) {
    // Handle field definition object (e.g., CREATE_FIELD_DEFINITIONS.fldId)
    let actualFieldNames = fieldNames;
    let actualErrorMessage = errorMessage;
    let actualErrorField = errorField;
    let actualOptions = options;
    
    if (fieldNames && typeof fieldNames === 'object' && !Array.isArray(fieldNames) && fieldNames.fieldNames) {
        // It's a field definition object
        actualFieldNames = fieldNames.fieldNames;
        actualErrorMessage = errorMessage || fieldNames.errorMessage || '';
        actualErrorField = errorField || fieldNames.errorField || '';
        actualOptions = { ...fieldNames, ...options };
        // Remove non-option properties
        delete actualOptions.fieldNames;
        delete actualOptions.errorMessage;
        delete actualOptions.errorField;
        delete actualOptions.type;
    }
    
    const fieldNameArray = Array.isArray(actualFieldNames) ? actualFieldNames : [actualFieldNames];
    const isRequired = actualOptions.required !== false; // Default to required unless explicitly set
    let value = null;
    let rawValue = null;
    let foundFieldName = null;

    // First, find if any of the field names exist in data
    for (const fieldName of fieldNameArray) {
        // Ensure fieldName is a string
        if (typeof fieldName !== 'string') {
            continue;
        }
        const fieldValue = safeGet(data, fieldName);
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            rawValue = fieldValue;
            foundFieldName = fieldName;
            value = sanitizeInteger(fieldValue);
            break;
        }
    }

    // If a value was provided but couldn't be parsed as integer
    if (rawValue !== null && (value === null || value === undefined || isNaN(value))) {
        const fieldDisplayName = actualErrorField || foundFieldName || fieldNameArray[0];
        throw new ValidationError(
            `${fieldDisplayName} must be a valid integer ID. Received: "${rawValue}"`,
            fieldDisplayName
        );
    }

    // If value is null/undefined/NaN and no value was provided
    if (value === null || value === undefined || isNaN(value)) {
        if (actualOptions.defaultValue !== undefined) {
            return actualOptions.defaultValue;
        }
        if (actualOptions.allowNull || !isRequired) {
            return null;
        }
        throw new ValidationError(actualErrorMessage, actualErrorField || fieldNameArray[0]);
    }

    return value;
}

/**
 * Validate and sanitize an optional integer field (for foreign keys)
 * @param {Object} data - Data object
 * @param {string|Array|Object} fieldDef - Field definition object or field names
 * @returns {number|null} Sanitized integer value or null if not provided
 * @throws {ValidationError} If validation fails
 */
function validateOptionalInteger(data, fieldDef) {
    // Handle field definition object (e.g., CREATE_FIELD_DEFINITIONS.reportingYearId)
    let actualFieldNames = fieldDef;
    let actualErrorMessage = '';
    let actualErrorField = '';
    
    if (fieldDef && typeof fieldDef === 'object' && !Array.isArray(fieldDef) && fieldDef.fieldNames) {
        actualFieldNames = fieldDef.fieldNames;
        actualErrorMessage = fieldDef.errorMessage || '';
        actualErrorField = fieldDef.errorField || '';
    }
    
    const fieldNameArray = Array.isArray(actualFieldNames) ? actualFieldNames : [actualFieldNames];
    let value = null;
    let rawValue = null;

    // Find if any of the field names exist in data
    for (const fieldName of fieldNameArray) {
        if (typeof fieldName !== 'string') continue;
        const fieldValue = safeGet(data, fieldName);
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            rawValue = fieldValue;
            value = sanitizeInteger(fieldValue);
            break;
        }
    }

    // If a value was provided but couldn't be parsed as integer
    if (rawValue !== null && rawValue !== undefined && rawValue !== '' && (value === null || value === undefined || isNaN(value))) {
        const fieldDisplayName = actualErrorField || fieldNameArray[0];
        throw new ValidationError(
            `${fieldDisplayName} must be a valid integer ID. Received: "${rawValue}"`,
            fieldDisplayName
        );
    }

    // Return null if no value provided, or the validated integer
    return (value !== null && value !== undefined && !isNaN(value)) ? value : null;
}

/**
 * Validate and sanitize a required string field
 * @param {Object} data - Data object
 * @param {string|Array} fieldNames - Field name(s) to check
 * @param {string} errorMessage - Error message if validation fails
 * @param {string} errorField - Field name for error reporting
 * @param {Object} options - Additional options (allowEmpty, trim)
 * @returns {string} Sanitized string value
 * @throws {ValidationError} If validation fails
 */
function validateRequiredString(data, fieldNames, errorMessage, errorField, options = {}) {
    // Handle field definition object
    let actualFieldNames = fieldNames;
    let actualErrorMessage = errorMessage;
    let actualErrorField = errorField;
    let actualOptions = options;
    
    if (fieldNames && typeof fieldNames === 'object' && !Array.isArray(fieldNames) && fieldNames.fieldNames) {
        actualFieldNames = fieldNames.fieldNames;
        actualErrorMessage = errorMessage || fieldNames.errorMessage || '';
        actualErrorField = errorField || fieldNames.errorField || '';
        actualOptions = { ...fieldNames, ...options };
        delete actualOptions.fieldNames;
        delete actualOptions.errorMessage;
        delete actualOptions.errorField;
        delete actualOptions.type;
    }
    
    const fieldNameArray = Array.isArray(actualFieldNames) ? actualFieldNames : [actualFieldNames];
    let value = null;

    for (const fieldName of fieldNameArray) {
        if (typeof fieldName !== 'string') {
            continue;
        }
        const fieldValue = safeGet(data, fieldName);
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            value = sanitizeString(fieldValue, { allowEmpty: actualOptions.allowEmpty !== false });
            break;
        }
    }

    if (!value || (actualOptions.allowEmpty === false && value.trim() === '')) {
        throw new ValidationError(actualErrorMessage, actualErrorField || fieldNameArray[0]);
    }

    return actualOptions.trim !== false ? value.trim() : value;
}

/**
 * Validate and sanitize a required number field
 * @param {Object} data - Data object
 * @param {string|Array} fieldNames - Field name(s) to check
 * @param {string} errorMessage - Error message if validation fails
 * @param {string} errorField - Field name for error reporting
 * @param {Object} options - Additional options (defaultValue, min, allowNegative)
 * @returns {number} Sanitized number value
 * @throws {ValidationError} If validation fails
 */
function validateRequiredNumber(data, fieldNames, errorMessage, errorField, options = {}) {
    // Handle field definition object
    let actualFieldNames = fieldNames;
    let actualErrorMessage = errorMessage;
    let actualErrorField = errorField;
    let actualOptions = options;
    
    if (fieldNames && typeof fieldNames === 'object' && !Array.isArray(fieldNames) && fieldNames.fieldNames) {
        actualFieldNames = fieldNames.fieldNames;
        actualErrorMessage = errorMessage || fieldNames.errorMessage || '';
        actualErrorField = errorField || fieldNames.errorField || '';
        actualOptions = { ...fieldNames, ...options };
        delete actualOptions.fieldNames;
        delete actualOptions.errorMessage;
        delete actualOptions.errorField;
        delete actualOptions.type;
    }
    
    const fieldNameArray = Array.isArray(actualFieldNames) ? actualFieldNames : [actualFieldNames];
    let value = null;

    for (const fieldName of fieldNameArray) {
        if (typeof fieldName !== 'string') {
            continue;
        }
        const fieldValue = safeGet(data, fieldName);
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            value = sanitizeNumber(fieldValue, actualOptions);
            if (value !== null) break;
        }
    }

    if (value === null || value === undefined || isNaN(value)) {
        if (actualOptions.defaultValue !== undefined) {
            return actualOptions.defaultValue;
        }
        throw new ValidationError(actualErrorMessage, actualErrorField || fieldNameArray[0]);
    }

    if (actualOptions.min !== undefined && value < actualOptions.min) {
        throw new ValidationError(`${actualErrorMessage} (minimum: ${actualOptions.min})`, actualErrorField || fieldNameArray[0]);
    }

    if (actualOptions.allowNegative === false && value < 0) {
        throw new ValidationError(`${actualErrorMessage} (must be non-negative)`, actualErrorField || fieldNameArray[0]);
    }

    return value;
}

/**
 * Validate and sanitize a required date field
 * @param {Object} data - Data object
 * @param {string|Array} fieldNames - Field name(s) to check
 * @param {string} errorMessage - Error message if validation fails
 * @param {string} errorField - Field name for error reporting
 * @returns {Date} Sanitized date value
 * @throws {ValidationError} If validation fails
 */
function validateRequiredDate(data, fieldNames, errorMessage, errorField) {
    // Handle field definition object
    let actualFieldNames = fieldNames;
    let actualErrorMessage = errorMessage;
    let actualErrorField = errorField;
    
    if (fieldNames && typeof fieldNames === 'object' && !Array.isArray(fieldNames) && fieldNames.fieldNames) {
        actualFieldNames = fieldNames.fieldNames;
        actualErrorMessage = errorMessage || fieldNames.errorMessage || '';
        actualErrorField = errorField || fieldNames.errorField || '';
    }
    
    const fieldNameArray = Array.isArray(actualFieldNames) ? actualFieldNames : [actualFieldNames];
    let value = null;

    for (const fieldName of fieldNameArray) {
        if (typeof fieldName !== 'string') {
            continue;
        }
        const fieldValue = safeGet(data, fieldName);
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            value = sanitizeDate(fieldValue);
            if (value) break;
        }
    }

    if (!value) {
        throw new ValidationError(actualErrorMessage, actualErrorField || fieldNameArray[0]);
    }

    return value;
}

/**
 * Validate and sanitize farmer count fields
 * @param {Object} data - Data object
 * @param {Object} fieldMapping - Mapping of frontend field names to backend field names
 * @param {Object} options - Options (defaultValue, validateNonNegative)
 * @returns {Object} Object with sanitized farmer counts
 */
function validateFarmerCounts(data, fieldMapping, options = {}) {
    const defaultValue = options.defaultValue;
    const validateNonNegative = options.validateNonNegative !== false;
    const required = options.required !== false; // Default to required unless explicitly set
    const farmerCounts = {};

    for (const [frontendKey, backendKey] of Object.entries(fieldMapping)) {
        // Use nullish coalescing to preserve 0 values
        const frontendValue = safeGet(data, frontendKey);
        const backendValue = safeGet(data, backendKey);
        const rawValue = frontendValue !== undefined && frontendValue !== null ? frontendValue : backendValue;
        
        // Only process if value is provided or defaultValue is explicitly set
        if (rawValue === undefined || rawValue === null || rawValue === '') {
            if (defaultValue !== undefined) {
                farmerCounts[backendKey] = defaultValue;
            }
            // Skip this field if no value provided and no defaultValue
            continue;
        }
        
        // Ensure value is a whole positive number for farmer/people counts
        let value = Math.max(0, sanitizeInteger(
            rawValue,
            defaultValue !== undefined ? { defaultValue } : {}
        ) || 0);

        if (value === null || value === undefined || isNaN(value)) {
            if (required) {
                throw new ValidationError(`${frontendKey} must be a valid integer`, frontendKey);
            }
            // Skip invalid values for optional fields
            continue;
        }

        // Strictly enforce whole positive numbers: floors decimal and sets negative to 0
        value = Math.max(0, Math.floor(value));

        farmerCounts[backendKey] = value;
    }

    return farmerCounts;
}

/**
 * Build update data object from request data
 * @param {Object} data - Request data
 * @param {Array} fieldDefinitions - Array of field definition objects
 * @returns {Object} Update data object
 * @throws {ValidationError} If validation fails
 */
function buildUpdateData(data, fieldDefinitions) {
    const updateData = {};

    for (const fieldDef of fieldDefinitions) {
        const { fieldNames, type, backendField, errorMessage, errorField, options = {} } = fieldDef;

        // Check if any of the field names are present in data
        const fieldNameArray = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
        const hasValue = fieldNameArray.some(fieldName => data[fieldName] !== undefined);

        if (!hasValue) continue;

        let value;
        switch (type) {
            case 'integer':
                value = validateRequiredInteger(data, fieldNameArray, errorMessage, errorField, options);
                break;
            case 'string':
                value = validateRequiredString(data, fieldNameArray, errorMessage, errorField, options);
                break;
            case 'number':
                value = validateRequiredNumber(data, fieldNameArray, errorMessage, errorField, options);
                break;
            case 'date':
                // For optional dates, allow null/empty values
                if (options.required === false) {
                    let dateValue = null;
                    for (const fieldName of fieldNameArray) {
                        if (typeof fieldName !== 'string') continue;
                        const fieldValue = safeGet(data, fieldName);
                        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                            dateValue = sanitizeDate(fieldValue);
                            if (dateValue) break;
                        }
                    }
                    value = dateValue; // Can be null for optional fields
                } else {
                    value = validateRequiredDate(data, fieldNameArray, errorMessage, errorField);
                }
                break;
            default:
                // For non-typed fields, just get the first available value
                for (const fieldName of fieldNameArray) {
                    const fieldValue = safeGet(data, fieldName);
                    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                        value = fieldValue;
                        break;
                    }
                }
        }

        // Only add to updateData if value is not null (null means field was not provided or is optional)
        // For optional fields, we allow null to be set explicitly if provided
        if (value !== undefined) {
            // If field is optional and value is null, we can set it to null (to clear the field)
            // Otherwise, only set if value is not null
            if (options.required === false && value === null) {
                updateData[backendField || fieldNameArray[0]] = null;
            } else if (value !== null) {
                updateData[backendField || fieldNameArray[0]] = value;
            }
        }
    }

    return updateData;
}

/**
 * Check record existence and ownership
 * @param {Function} findFunction - Prisma find function
 * @param {Object} where - Where clause
 * @param {boolean} throwIfNotFound - Whether to throw if not found
 * @returns {Promise<Object|null>} Existing record or null
 * @throws {ValidationError} If record not found and throwIfNotFound is true
 */
async function checkRecordOwnership(findFunction, where, throwIfNotFound = true) {
    const existing = await findFunction({ where });

    if (!existing && throwIfNotFound) {
        throw new ValidationError('Record not found or unauthorized');
    }

    return existing;
}

/**
 * Apply common filters to where clause
 * @param {Object} where - Base where clause
 * @param {Object} filters - Filter object from request
 * @param {Array} filterableFields - Array of field names that can be filtered
 * @returns {Object} Updated where clause
 */
function applyFilters(where, filters, filterableFields) {
    if (!where || !filters) return where;

    for (const field of filterableFields) {
        const filterValue = filters[field];
        if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
            // Validate that the filter value is a valid integer string
            const strValue = String(filterValue).trim();
            if (/^\s*-?\d+\s*$/.test(strValue)) {
                const parsedValue = parseInt(strValue, 10);
                if (Number.isInteger(parsedValue)) {
                    where[field] = parsedValue;
                }
            }
            // Silently skip invalid filter values (or throw ValidationError if strict validation preferred)
        }
    }

    return where;
}

/**
 * Validate and parse ID parameter with strict validation
 * @param {string|number} id - ID to validate
 * @param {string} idField - Field name for error reporting
 * @returns {number} Validated integer ID
 * @throws {ValidationError} If ID is invalid
 */
function validateId(id, idField = 'id') {
    if (id === undefined || id === null || id === '') {
        throw new ValidationError(`Missing required field: ${idField}`, idField);
    }

    const strId = String(id).trim();
    // Strict validation: only digits allowed
    if (!/^\d+$/.test(strId)) {
        throw new ValidationError(`Invalid ${idField}: ${id}. Expected a positive integer.`, idField);
    }

    const parsedId = parseInt(strId, 10);
    if (!Number.isInteger(parsedId) || String(parsedId) !== strId) {
        throw new ValidationError(`Invalid ${idField}: ${id}. Expected a valid integer.`, idField);
    }

    return parsedId;
}

module.exports = {
    validateInput,
    resolveKvkId,
    buildRoleBasedWhere,
    validateRequiredInteger,
    validateOptionalInteger,
    validateRequiredString,
    validateRequiredNumber,
    validateRequiredDate,
    validateFarmerCounts,
    buildUpdateData,
    checkRecordOwnership,
    applyFilters,
    validateId,
};
