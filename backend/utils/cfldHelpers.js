/**
 * CFLD Repository Helper Utilities
 * Provides reusable functions for CFLD-related operations
 * Highly optimized, maintainable, and reusable with dynamic type resolution
 * Uses CropType relation instead of hardcoded enum
 */

const prisma = require('../config/prisma.js');
const { ValidationError } = require('./errorHandler.js');

// Cache for performance optimization
const cache = {
    cropTypes: null,
    lastCacheTime: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

/**
 * Gets all crop types from database with caching
 * @returns {Promise<Array>} Array of crop types
 */
async function getCropTypes() {
    // Check cache first
    if (cache.cropTypes && cache.lastCacheTime) {
        const cacheAge = Date.now() - cache.lastCacheTime;
        if (cacheAge < cache.CACHE_DURATION) {
            return cache.cropTypes;
        }
    }

    try {
        const cropTypes = await prisma.cropType.findMany({
            select: { typeId: true, typeName: true },
            orderBy: { typeName: 'asc' },
        });

        cache.cropTypes = cropTypes;
        cache.lastCacheTime = Date.now();

        return cropTypes;
    } catch (error) {
        console.error('Error fetching crop types:', error);
        return [];
    }
}

/**
 * Validates and resolves crop type ID from various input formats
 * @param {string|number} typeInput - Crop type name, ID, or typeId
 * @returns {Promise<number>} Valid crop type ID
 * @throws {ValidationError} If type is invalid or not found
 */
async function resolveCropTypeId(typeInput) {
    try {
        if (!typeInput) {
            throw new ValidationError('Crop type is required', 'typeId');
        }

        // If it's already a number, validate it exists
        if (typeof typeInput === 'number' || !isNaN(parseInt(typeInput))) {
            const typeId = parseInt(typeInput);
            const cropType = await prisma.cropType.findUnique({
                where: { typeId },
                select: { typeId: true, typeName: true },
            });

            if (!cropType) {
                throw new ValidationError(
                    `Crop type with ID ${typeId} not found`,
                    'typeId'
                );
            }

            return typeId;
        }

        // If it's a string, try to find by name
        if (typeof typeInput === 'string') {
            const cropType = await prisma.cropType.findFirst({
                where: {
                    typeName: { equals: typeInput.trim(), mode: 'insensitive' },
                },
                select: { typeId: true, typeName: true },
            });

            if (!cropType) {
                throw new ValidationError(
                    `Crop type "${typeInput}" not found`,
                    'typeId'
                );
            }

            return cropType.typeId;
        }

        throw new ValidationError('Invalid crop type format', 'typeId');
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        console.error('Error resolving crop type ID:', error);
        throw new ValidationError(
            `Failed to resolve crop type: ${error.message}`,
            'typeId'
        );
    }
}

/**
 * Resolves CFLD crop ID from crop name and type ID
 * @param {string} cropName - CFLD crop name
 * @param {number} typeId - Crop type ID
 * @param {number} seasonId - Optional season ID for more precise lookup
 * @returns {Promise<number|null>} CFLD crop ID or null if not found
 */
async function resolveCfldCropId(cropName, typeId, seasonId = null) {
    try {
        if (!cropName || !typeId) {
            return null;
        }

        const where = {
            cropName: { equals: cropName.trim(), mode: 'insensitive' },
            typeId: parseInt(typeId),
        };

        if (seasonId) {
            where.seasonId = parseInt(seasonId);
        }

        const crop = await prisma.fLDCropMaster.findFirst({ where });
        return crop ? crop.cfldId : null;
    } catch (error) {
        console.error('Error resolving CFLD crop ID:', error);
        return null;
    }
}

/**
 * Resolves or creates CFLD crop with comprehensive error handling
 * @param {string} cropName - CFLD crop name
 * @param {number} typeId - Crop type ID
 * @param {number} seasonId - Season ID (required for creation)
 * @returns {Promise<number>} CFLD crop ID
 * @throws {ValidationError} If required parameters are missing or invalid
 */
async function resolveOrCreateCfldCrop(cropName, typeId, seasonId) {
    try {
        if (!cropName || typeof cropName !== 'string' || !cropName.trim()) {
            throw new ValidationError('Crop name is required and must be a non-empty string', 'crop');
        }

        if (!typeId || isNaN(parseInt(typeId))) {
            throw new ValidationError('Valid crop type ID is required', 'cropTypeId');
        }

        if (!seasonId || isNaN(parseInt(seasonId))) {
            throw new ValidationError('Valid season ID is required', 'seasonId');
        }

        const parsedTypeId = parseInt(typeId);
        const parsedSeasonId = parseInt(seasonId);

        // Verify crop type exists
        const cropType = await prisma.cropType.findUnique({
            where: { typeId: parsedTypeId },
        });

        if (!cropType) {
            throw new ValidationError(`Crop type with ID ${parsedTypeId} not found`, 'cropTypeId');
        }

        // Verify season exists
        const season = await prisma.season.findUnique({
            where: { seasonId: parsedSeasonId },
        });

        if (!season) {
            throw new ValidationError(`Season with ID ${parsedSeasonId} not found`, 'seasonId');
        }

        // Try to find existing crop
        const existingCrop = await resolveCfldCropId(cropName, parsedTypeId, parsedSeasonId);
        if (existingCrop) {
            return existingCrop;
        }

        // Create new CFLD crop
        const newCrop = await prisma.fLDCropMaster.create({
            data: {
                cropName: cropName.trim(),
                typeId: parsedTypeId,
                seasonId: parsedSeasonId,
            },
        });

        // Invalidate cache
        cache.cropTypes = null;

        return newCrop.cfldId;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        console.error('Error resolving or creating CFLD crop:', error);
        throw new ValidationError(
            `Failed to resolve or create CFLD crop: ${error.message}`,
            'crop'
        );
    }
}

/**
 * Resolves KVK ID from user or data with validation
 * @param {object} user - User object
 * @param {object} data - Request data
 * @returns {number} KVK ID
 * @throws {ValidationError} If KVK ID cannot be resolved
 */
function resolveKvkId(user, data) {
    try {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null 
            ? parseInt(kvkIdSource, 10) 
            : null;

        if (!kvkId || isNaN(kvkId) || kvkId <= 0) {
            throw new ValidationError('Valid kvkId is required', 'kvkId');
        }

        return kvkId;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError('Failed to resolve KVK ID', 'kvkId');
    }
}

/**
 * Parses month string to Date object with error handling
 * Handles month names like "January", "February", etc.
 * @param {string|Date} month - Month value
 * @returns {Date} Date object
 */
function parseMonth(month) {
    try {
        if (!month) {
            return new Date();
        }

        if (month instanceof Date) {
            return isNaN(month.getTime()) ? new Date() : month;
        }

        if (typeof month === 'string') {
            // Try parsing as ISO date first
            const isoDate = new Date(month);
            if (!isNaN(isoDate.getTime())) {
                return isoDate;
            }

            // Try parsing as month name
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthIdx = monthNames.findIndex(
                name => name.toLowerCase() === month.trim().toLowerCase()
            );
            
            if (monthIdx !== -1) {
                const date = new Date();
                date.setMonth(monthIdx);
                date.setDate(1); // Set to first day of month for consistency
                return date;
            }
        }

        return new Date();
    } catch (error) {
        console.error('Error parsing month:', error);
        return new Date();
    }
}

/**
 * Builds where clause for KVK-scoped queries
 * @param {object} user - User object
 * @param {object} filters - Additional filters
 * @returns {object} Prisma where clause
 */
function buildKvkScopedWhere(user, filters = {}) {
    try {
        const where = { ...filters };

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            const kvkId = parseInt(user.kvkId);
            if (!isNaN(kvkId) && kvkId > 0) {
                where.kvkId = kvkId;
            }
        } else if (filters.kvkId) {
            const kvkId = parseInt(filters.kvkId);
            if (!isNaN(kvkId) && kvkId > 0) {
                where.kvkId = kvkId;
            }
        }

        return where;
    } catch (error) {
        console.error('Error building KVK-scoped where clause:', error);
        return filters;
    }
}

/**
 * Clears the cache (useful for testing or forced refresh)
 */
function clearCache() {
    cache.cropTypes = null;
    cache.lastCacheTime = null;
}

module.exports = {
    getCropTypes,
    resolveCropTypeId,
    resolveCfldCropId,
    resolveOrCreateCfldCrop,
    resolveKvkId,
    parseMonth,
    buildKvkScopedWhere,
    clearCache,
};
