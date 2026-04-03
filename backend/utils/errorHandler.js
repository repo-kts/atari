/**
 * Enhanced Error Handling Utility
 * 
 * Provides consistent error handling, Prisma error translation,
 * and user-friendly error messages.
 * 
 * @module utils/errorHandler
 */

/**
 * Custom error classes
 */
class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = 'VALIDATION_ERROR';
        this.statusCode = 400;
    }
}

class NotFoundError extends Error {
    constructor(resource = 'Resource') {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
        this.code = 'NOT_FOUND';
        this.statusCode = 404;
    }
}

class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized access') {
        super(message);
        this.name = 'UnauthorizedError';
        this.code = 'UNAUTHORIZED';
        this.statusCode = 403;
    }
}

class ConflictError extends Error {
    constructor(message = 'Resource conflict') {
        super(message);
        this.name = 'ConflictError';
        this.code = 'CONFLICT';
        this.statusCode = 409;
    }
}

/**
 * Translate Prisma error to user-friendly error
 * 
 * @param {Error} error - Prisma error
 * @param {string} resource - Resource name (e.g., 'State', 'OFT')
 * @param {string} operation - Operation name (e.g., 'create', 'update')
 * @returns {Error} User-friendly error
 */
function translatePrismaError(error, resource = 'Resource', operation = 'operation') {
    // If already a custom error, return as is
    if (error instanceof ValidationError || 
        error instanceof NotFoundError || 
        error instanceof UnauthorizedError || 
        error instanceof ConflictError) {
        return error;
    }
    
    // Handle Prisma error codes
    if (error.code) {
        switch (error.code) {
            case 'P2002':
                // Unique constraint violation
                const field = error.meta?.target?.[0] || 'field';
                return new ConflictError(`${resource} with this ${field} already exists`);
            
            case 'P2025':
                // Record not found
                return new NotFoundError(resource);
            
            case 'P2003':
                // Foreign key constraint violation
                return new ValidationError(`Invalid reference: ${error.meta?.field_name || 'foreign key'}`);
            
            case 'P2011':
                // Null constraint violation
                const nullField = error.meta?.constraint || 'field';
                return new ValidationError(`Missing required field: ${nullField}`);
            
            case 'P2012':
                // Missing required argument
                const missingField = error.meta?.path || 'field';
                return new ValidationError(`Missing required field: ${missingField}`);
            
            case 'P2014':
                // Required relation violation
                return new ValidationError(`Invalid relation: ${error.meta?.relation_name || 'relation'}`);
            
            case 'P2015':
                // Record not found for update/delete
                return new NotFoundError(resource);
            
            case 'P2016':
                // Query interpretation error
                return new ValidationError(`Invalid query: ${error.message}`);
            
            case 'P2017':
                // Records for relation not connected
                return new ValidationError(`Invalid relation connection: ${error.meta?.relation_name || 'relation'}`);
            
            case 'P2018':
                // Required connected records not found
                return new NotFoundError(`Required related ${resource} not found`);
            
            case 'P2019':
                // Input error
                return new ValidationError(`Invalid input: ${error.meta?.details || error.message}`);
            
            case 'P2020':
                // Value out of range
                return new ValidationError(`Value out of range: ${error.meta?.details || error.message}`);
            
            case 'P2021':
                // Table does not exist
                return new Error(`Database table not found: ${error.meta?.table || 'unknown'}`);
            
            case 'P2022':
                // Column does not exist
                return new Error(`Database column not found: ${error.meta?.column || 'unknown'}`);
            
            case 'P2023':
                // Inconsistent column data
                return new ValidationError(`Invalid data format: ${error.meta?.details || error.message}`);
            
            case 'P2024':
                // Timed out fetching a new connection from the connection pool
                return new Error('Database connection timeout. Please try again.');
            
            case 'P2025':
                // Record not found
                return new NotFoundError(resource);
            
            case 'P2026':
                // Unsupported feature
                return new Error(`Unsupported database feature: ${error.message}`);
            
            case 'P2027':
                // Multiple errors occurred
                return new ValidationError(`Multiple validation errors: ${error.message}`);
            
            case 'P2030':
                // Fulltext index not found
                return new Error(`Search index not available: ${error.message}`);
            
            case 'P2031':
                // MongoReplicaSetNotFound
                return new Error('Database replica set not found');
            
            case 'P2033':
                // Number exceeds 64-bit integer
                return new ValidationError('Number exceeds maximum allowed value');
            
            case 'P2034':
                // Transaction failed due to a write conflict or a deadlock
                return new Error('Transaction conflict. Please try again.');
            
            default:
                // Unknown Prisma error
                console.error('Unhandled Prisma error:', error);
                return new Error(`Database error: ${error.message || 'Unknown error'}`);
        }
    }
    
    // Handle generic errors
    if (error.message) {
        // Check for common error patterns
        if (error.message.includes('Null constraint violation')) {
            const match = error.message.match(/on the `?(\w+)`?/);
            const field = match ? match[1] : 'field';
            return new ValidationError(`Missing required field: ${field}`);
        }
        
        if (error.message.includes('Invalid') && error.message.includes('invocation')) {
            const unknownArgMatch = error.message.match(/Unknown argument `(\w+)`/);
            if (unknownArgMatch) {
                return new ValidationError(`Unsupported field: ${unknownArgMatch[1]}`, unknownArgMatch[1]);
            }

            const match = error.message.match(/Argument `(\w+)` is missing/);
            if (match) {
                return new ValidationError(`Missing required field: ${match[1]}`);
            }
        }
        
        if (error.message.includes('Cannot read properties of undefined')) {
            return new ValidationError('Invalid data structure: missing required properties');
        }
        
        if (error.message.includes('not found')) {
            return new NotFoundError(resource);
        }
    }
    
    // Return generic error
    return new Error(`Failed to ${operation} ${resource}: ${error.message || 'Unknown error'}`);
}

/**
 * Format error response for API
 * 
 * @param {Error} error - Error object
 * @param {object} options - Options
 * @param {boolean} options.includeStack - Include stack trace (default: false in production)
 * @returns {object} Formatted error response
 */
function formatErrorResponse(error, options = {}) {
    const { includeStack = process.env.NODE_ENV !== 'production' } = options;
    
    const response = {
        success: false,
        error: {
            message: error.message || 'An error occurred',
            code: error.code || 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
    };
    
    if (error.field) {
        response.error.field = error.field;
    }
    
    if (includeStack && error.stack) {
        response.error.stack = error.stack;
    }
    
    if (error.statusCode) {
        response.statusCode = error.statusCode;
    }
    
    return response;
}

/**
 * Handle error and send response
 * 
 * @param {Error} error - Error object
 * @param {object} res - Express response object
 * @param {string} resource - Resource name
 * @param {string} operation - Operation name
 */
function handleError(error, res, resource = 'Resource', operation = 'operation') {
    const translatedError = translatePrismaError(error, resource, operation);
    const response = formatErrorResponse(translatedError);
    const statusCode = translatedError.statusCode || 500;
    
    // Log error for debugging
    if (statusCode >= 500) {
        console.error(`[${operation}] Error for ${resource}:`, error);
    } else {
        console.warn(`[${operation}] Error for ${resource}:`, translatedError.message);
    }
    
    return res.status(statusCode).json(response);
}

/**
 * Async error wrapper for route handlers
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            next(error);
        });
    };
} 

/**
 * Error handler middleware for Express
 * 
 * @param {Error} error - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandlerMiddleware(error, req, res, next) {
    const resource = req.path?.split('/').pop() || 'Resource';
    const operation = req.method?.toLowerCase() || 'operation';
    
    handleError(error, res, resource, operation);
}

module.exports = {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ConflictError,
    translatePrismaError,
    formatErrorResponse,
    handleError,
    asyncHandler,
    errorHandlerMiddleware,
};
