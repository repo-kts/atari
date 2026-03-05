/**
 * Input Validation Middleware
 * 
 * Validates request body, query parameters, and params before controllers
 * 
 * @module middleware/validateInput
 */

const { sanitizeForPrisma, validateAndSanitize } = require('../utils/dataSanitizer.js');
const { ValidationError } = require('../utils/errorHandler.js');

/**
 * Validate request body against schema
 * 
 * @param {object} schema - Validation schema
 * @param {object} options - Options
 * @param {boolean} options.allowUnknown - Allow unknown fields (default: false)
 * @returns {Function} Express middleware
 */
function validateBody(schema, options = {}) {
    const { allowUnknown = false } = options;
    
    return (req, res, next) => {
        try {
            if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
                throw new ValidationError('Request body must be an object');
            }
            
            // Sanitize and validate
            const sanitized = validateAndSanitize(req.body, schema.required || [], schema);
            
            // Check for unknown fields if not allowed
            if (!allowUnknown && schema.fields) {
                const unknownFields = Object.keys(sanitized).filter(
                    key => !schema.fields.includes(key) && !schema.required?.includes(key)
                );
                if (unknownFields.length > 0) {
                    throw new ValidationError(`Unknown fields: ${unknownFields.join(', ')}`);
                }
            }
            
            // Replace req.body with sanitized version
            req.body = sanitized;
            
            next();
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code,
                        field: error.field,
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            next(error);
        }
    };
}

/**
 * Validate query parameters
 * 
 * @param {object} schema - Validation schema for query params
 * @returns {Function} Express middleware
 */
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            if (!req.query || typeof req.query !== 'object') {
                req.query = {};
            }
            
            const sanitized = sanitizeForPrisma(req.query, schema);
            req.query = sanitized;
            
            next();
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code,
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            next(error);
        }
    };
}

/**
 * Validate route parameters
 * 
 * @param {object} schema - Validation schema for params
 * @returns {Function} Express middleware
 */
function validateParams(schema) {
    return (req, res, next) => {
        try {
            if (!req.params || typeof req.params !== 'object') {
                req.params = {};
            }
            
            // Validate required params
            if (schema.required) {
                for (const param of schema.required) {
                    if (!req.params[param] || req.params[param].trim() === '') {
                        throw new ValidationError(`Missing required parameter: ${param}`, param);
                    }
                }
            }
            
            // Sanitize params
            const sanitized = sanitizeForPrisma(req.params, schema);
            req.params = sanitized;
            
            next();
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code,
                        field: error.field,
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            next(error);
        }
    };
}

/**
 * Generic validation middleware
 * Validates body, query, and params
 * 
 * @param {object} validationSchema - Complete validation schema
 * @param {object} validationSchema.body - Body validation schema
 * @param {object} validationSchema.query - Query validation schema
 * @param {object} validationSchema.params - Params validation schema
 * @returns {Function} Express middleware
 */
function validate(validationSchema = {}) {
    const middlewares = [];
    
    if (validationSchema.body) {
        middlewares.push(validateBody(validationSchema.body));
    }
    
    if (validationSchema.query) {
        middlewares.push(validateQuery(validationSchema.query));
    }
    
    if (validationSchema.params) {
        middlewares.push(validateParams(validationSchema.params));
    }
    
    // If no schema provided, at least sanitize body
    if (middlewares.length === 0) {
        return (req, res, next) => {
            if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
                req.body = sanitizeForPrisma(req.body);
            }
            next();
        };
    }
    
    // Chain all middlewares
    return (req, res, next) => {
        let index = 0;
        
        const runNext = (err) => {
            if (err) {
                return next(err);
            }
            
            index++;
            if (index < middlewares.length) {
                middlewares[index](req, res, runNext);
            } else {
                next();
            }
        };
        
        middlewares[0](req, res, runNext);
    };
}
 
/**
 * Ensure request body exists and is an object
 * 
 * @returns {Function} Express middleware
 */
function ensureBody() {
    return (req, res, next) => {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Request body is required and must be an object',
                    code: 'VALIDATION_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }
        
        // Basic sanitization
        req.body = sanitizeForPrisma(req.body);
        next();
    };
}

module.exports = {
    validate,
    validateBody,
    validateQuery,
    validateParams,
    ensureBody,
};
