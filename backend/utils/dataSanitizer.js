/**
 * Comprehensive Data Sanitization Utility
 * 
 * Provides robust sanitization for all data types with null/undefined handling,
 * type coercion, and deep object/array sanitization.
 * 
 * @module utils/dataSanitizer
 */

/**
 * Sanitize a string value
 * - Trims whitespace
 * - Converts null/undefined to null
 * - Converts empty strings to null (optional)
 * 
 * @param {*} value - Value to sanitize
 * @param {object} options - Sanitization options
 * @param {boolean} options.allowEmpty - If true, empty strings are kept as empty strings (default: false)
 * @param {number} options.maxLength - Maximum length (truncates if exceeded)
 * @returns {string|null} Sanitized string or null
 */
function sanitizeString(value, options = {}) {
    const { allowEmpty = false, maxLength } = options;
    
    if (value === null || value === undefined) {
        return null;
    }
    
    if (typeof value === 'number') {
        value = String(value);
    }
    
    if (typeof value !== 'string') {
        return null;
    }
    
    let sanitized = value.trim();
    
    if (sanitized === '' && !allowEmpty) {
        return null;
    }
    
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
}

/**
 * Sanitize a number value
 * - Converts string numbers to actual numbers
 * - Handles null/undefined
 * - Validates number range (optional)
 * 
 * @param {*} value - Value to sanitize
 * @param {object} options - Sanitization options
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {number} options.defaultValue - Default value if invalid
 * @returns {number|null} Sanitized number or null
 */
function sanitizeNumber(value, options = {}) {
    const { min, max, defaultValue } = options;
    
    if (value === null || value === undefined || value === '') {
        return defaultValue !== undefined ? defaultValue : null;
    }
    
    if (typeof value === 'number') {
        if (isNaN(value) || !isFinite(value)) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        if (min !== undefined && value < min) {
            return defaultValue !== undefined ? defaultValue : min;
        }
        
        if (max !== undefined && value > max) {
            return defaultValue !== undefined ? defaultValue : max;
        }
        
        return value;
    }
    
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        const parsed = parseFloat(trimmed);
        if (isNaN(parsed) || !isFinite(parsed)) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        if (min !== undefined && parsed < min) {
            return defaultValue !== undefined ? defaultValue : min;
        }
        
        if (max !== undefined && parsed > max) {
            return defaultValue !== undefined ? defaultValue : max;
        }
        
        return parsed;
    }
    
    return defaultValue !== undefined ? defaultValue : null;
}

/**
 * Sanitize an integer value
 * 
 * @param {*} value - Value to sanitize
 * @param {object} options - Sanitization options
 * @returns {number|null} Sanitized integer or null
 */
function sanitizeInteger(value, options = {}) {
    const num = sanitizeNumber(value, options);
    if (num === null) {
        return options.defaultValue !== undefined ? options.defaultValue : null;
    }
    return Math.floor(num);
}

/**
 * Sanitize a boolean value
 * 
 * @param {*} value - Value to sanitize
 * @param {boolean} defaultValue - Default value if invalid
 * @returns {boolean} Sanitized boolean
 */
function sanitizeBoolean(value, defaultValue = false) {
    if (value === null || value === undefined) {
        return defaultValue;
    }
    
    if (typeof value === 'boolean') {
        return value;
    }
    
    if (typeof value === 'string') {
        const lower = value.trim().toLowerCase();
        if (lower === 'true' || lower === '1' || lower === 'yes') {
            return true;
        }
        if (lower === 'false' || lower === '0' || lower === 'no') {
            return false;
        }
    }
    
    if (typeof value === 'number') {
        return value !== 0;
    }
    
    return defaultValue;
}

/**
 * Sanitize a date value
 * 
 * @param {*} value - Value to sanitize
 * @param {object} options - Sanitization options
 * @returns {Date|null} Sanitized date or null
 */
function sanitizeDate(value, options = {}) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    
    if (value instanceof Date) {
        if (isNaN(value.getTime())) {
            return null;
        }
        return value;
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return null;
        }
        return date;
    }
    
    return null;
}

/**
 * Sanitize an array value
 * 
 * @param {*} value - Value to sanitize
 * @param {Function} itemSanitizer - Function to sanitize each item
 * @returns {Array|null} Sanitized array or null
 */
function sanitizeArray(value, itemSanitizer = null) {
    if (value === null || value === undefined) {
        return null;
    }
    
    if (!Array.isArray(value)) {
        return null;
    }
    
    if (itemSanitizer && typeof itemSanitizer === 'function') {
        return value.map(item => itemSanitizer(item)).filter(item => item !== null && item !== undefined);
    }
    
    return value;
}

/**
 * Deep sanitize an object
 * Recursively sanitizes all properties in an object
 * 
 * @param {object} obj - Object to sanitize
 * @param {object} schema - Schema defining how to sanitize each field
 * @param {object} options - Options
 * @param {boolean} options.removeUnknown - Remove fields not in schema (default: false)
 * @returns {object|null} Sanitized object or null
 */
function sanitizeObject(obj, schema = null, options = {}) {
    const { removeUnknown = false } = options;
    
    if (obj === null || obj === undefined) {
        return null;
    }
    
    if (typeof obj !== 'object' || Array.isArray(obj)) {
        return null;
    }
    
    const sanitized = {};
    
    if (schema) {
        // Sanitize according to schema
        for (const [key, fieldSchema] of Object.entries(schema)) {
            const value = obj[key];
            
            if (fieldSchema === null || fieldSchema === undefined) {
                // Skip this field
                continue;
            }
            
            if (typeof fieldSchema === 'function') {
                // Custom sanitizer function
                sanitized[key] = fieldSchema(value);
            } else if (typeof fieldSchema === 'object') {
                // Schema object with type and options
                const { type, ...opts } = fieldSchema;
                
                switch (type) {
                    case 'string':
                        sanitized[key] = sanitizeString(value, opts);
                        break;
                    case 'number':
                        sanitized[key] = sanitizeNumber(value, opts);
                        break;
                    case 'integer':
                        sanitized[key] = sanitizeInteger(value, opts);
                        break;
                    case 'boolean':
                        sanitized[key] = sanitizeBoolean(value, opts.defaultValue);
                        break;
                    case 'date':
                        sanitized[key] = sanitizeDate(value, opts);
                        break;
                    case 'array':
                        sanitized[key] = sanitizeArray(value, opts.itemSanitizer);
                        break;
                    case 'object':
                        sanitized[key] = sanitizeObject(value, opts.schema, opts);
                        break;
                    default:
                        sanitized[key] = value;
                }
            } else {
                // Direct value (keep as is)
                sanitized[key] = value;
            }
        }
        
        if (removeUnknown) {
            // Only include fields in schema
            return sanitized;
        }
    }
    
    // If no schema, sanitize all fields with defaults
    for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
            sanitized[key] = null;
        } else if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'number') {
            sanitized[key] = sanitizeNumber(value);
        } else if (typeof value === 'boolean') {
            sanitized[key] = value;
        } else if (value instanceof Date) {
            sanitized[key] = sanitizeDate(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = sanitizeArray(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

/**
 * Sanitize input data for Prisma operations
 * Removes undefined values, sanitizes types, and ensures data integrity
 * 
 * @param {object} data - Data to sanitize
 * @param {object} schema - Optional schema for field-specific sanitization
 * @returns {object} Sanitized data ready for Prisma
 */
function sanitizeForPrisma(data, schema = null) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {};
    }
    
    const sanitized = schema 
        ? sanitizeObject(data, schema, { removeUnknown: false })
        : sanitizeObject(data);
    
    // Remove undefined values (Prisma doesn't accept undefined)
    const cleaned = {};
    for (const [key, value] of Object.entries(sanitized || {})) {
        if (value !== undefined) {
            cleaned[key] = value;
        }
    }
    
    return cleaned;
}

/**
 * Validate and sanitize required fields
 * 
 * @param {object} data - Data to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @param {object} schema - Optional schema for sanitization
 * @returns {object} Sanitized data
 * @throws {Error} If required fields are missing
 */
function validateAndSanitize(data, requiredFields = [], schema = null) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid data: must be an object');
    }
    
    const sanitized = sanitizeForPrisma(data, schema);
    const missing = [];
    
    for (const field of requiredFields) {
        const value = sanitized[field];
        if (value === null || value === undefined || value === '') {
            missing.push(field);
        }
    }
    
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return sanitized;
}

/**
 * Safely get nested property value
 *  
 * @param {object} obj - Object to access
 * @param {string} path - Dot-separated path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} Property value or default
 */
function safeGet(obj, path, defaultValue = null) {
    if (!obj || typeof obj !== 'object') {
        return defaultValue;
    }
    
    // Ensure path is a string
    if (typeof path !== 'string') {
        // If path is not a string, try to convert it or return default
        if (path === null || path === undefined) {
            return defaultValue;
        }
        // Convert to string if it's a number or other type
        path = String(path);
    }
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
}

/**
 * Remove ID fields from update data for Prisma operations
 * 
 * CRITICAL: Prisma only accepts ID in the `where` clause for update operations,
 * never in the `data` object. This function removes all ID field variations.
 * 
 * @param {object} data - Data object to sanitize
 * @param {string|string[]} idFields - ID field name(s) to remove (e.g., 'kvkId', ['kvkId', 'bankAccountId'])
 * @returns {object} Data with all ID field variations removed
 */
function removeIdFieldsForUpdate(data, idFields = []) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return data;
    }
    
    const sanitized = { ...data };
    const fieldsToRemove = Array.isArray(idFields) ? idFields : (idFields ? [idFields] : []);
    
    // Always remove generic ID fields
    const allFieldsToRemove = new Set(['id', '_id']);
    
    // Add provided ID fields and their variations
    fieldsToRemove.forEach(field => {
        if (field) {
            allFieldsToRemove.add(field);
            allFieldsToRemove.add(field.toLowerCase());
            // Add snake_case variation (e.g., kvkId -> kvk_id)
            if (field.includes('Id')) {
                allFieldsToRemove.add(field.replace(/Id$/, '_id'));
            }
            // Add camelCase variation (e.g., kvk_id -> kvkId)
            if (field.includes('_')) {
                const camelCase = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                allFieldsToRemove.add(camelCase);
            }
        }
    });
    
    // Remove all ID field variations (O(n) where n is typically 3-5 fields)
    for (const field of allFieldsToRemove) {
        if (sanitized[field] !== undefined) {
            delete sanitized[field];
        }
    }
    
    return sanitized;
}

module.exports = {
    sanitizeString,
    sanitizeNumber,
    sanitizeInteger,
    sanitizeBoolean,
    sanitizeDate,
    sanitizeArray,
    sanitizeObject,
    sanitizeForPrisma,
    validateAndSanitize,
    safeGet,
    removeIdFieldsForUpdate,
};
