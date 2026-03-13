const oftFldRepository = require('../../repositories/all-masters/oftFldRepository.js');
const { ValidationError, NotFoundError, ConflictError, translatePrismaError } = require('../../utils/errorHandler');

/**
 * OFT & FLD Master Data Service
 * Business logic layer for OFT, FLD, and CFLD master data operations
 */

class OftFldService {
    /**
     * Get all entities with pagination and filtering
     * @param {string} entityName - Entity name
     * @param {object} options - Query options
     * @returns {Promise<{data: Array, total: number, page: number, limit: number}>}
     * @throws {ValidationError} If entity name or options are invalid
     */
    async getAll(entityName, options = {}) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }
        
        // Validate pagination options
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 100;
        
        if (page < 1) {
            throw new ValidationError('Page must be a positive number');
        }
        if (limit < 1 || limit > 1000) {
            throw new ValidationError('Limit must be between 1 and 1000');
        }
        
        try {
            const result = await oftFldRepository.findAll(entityName, { ...options, page, limit });
            return {
                ...result,
                page,
                limit,
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'getAll');
        }
    }

    /**
     * Get entity by ID
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @returns {Promise<object>}
     * @throws {ValidationError} If ID is invalid
     * @throws {NotFoundError} If entity not found
     */
    async getById(entityName, id) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }
        
        if (id === undefined || id === null || id === '') {
            throw new ValidationError('ID is required');
        }
        
        try {
            return await oftFldRepository.findById(entityName, id);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'getById');
        }
    }

    /**
     * Create new entity
     * @param {string} entityName - Entity name
     * @param {object} data - Entity data
     * @returns {Promise<object>}
     * @throws {ValidationError} If validation fails
     * @throws {ConflictError} If duplicate exists
     */
    async create(entityName, data) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }
        
        if (!data || typeof data !== 'object') {
            throw new ValidationError('Data is required and must be an object');
        }
        
        try {
            // Get entity config for name field validation
            const { getEntityConfig } = require('../../repositories/all-masters/oftFldRepository.js');
            const config = getEntityConfig ? getEntityConfig(entityName) : null;

            // Check for duplicate names (where applicable)
            if (config && config.nameField && data[config.nameField]) {
                const exists = await oftFldRepository.nameExists(
                    entityName,
                    data[config.nameField]
                );
                if (exists) {
                    throw new ConflictError(`${entityName} with this ${config.nameField} already exists`);
                }
            }

            // Validate foreign key references
            await oftFldRepository.validateReferences(entityName, data);

            return await oftFldRepository.create(entityName, data);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof ConflictError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'create');
        }
    }

    /**
     * Update entity
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @param {object} data - Updated data
     * @returns {Promise<object>}
     * @throws {ValidationError} If validation fails
     * @throws {NotFoundError} If entity not found
     * @throws {ConflictError} If duplicate exists
     */
    async update(entityName, id, data) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }
        
        if (id === undefined || id === null || id === '') {
            throw new ValidationError('ID is required');
        }
        
        if (!data || typeof data !== 'object') {
            throw new ValidationError('Data is required and must be an object');
        }
        
        try {
            // Check if entity exists
            await this.getById(entityName, id);

            // Get entity config for duplicate name check
            const { getEntityConfig } = require('../../repositories/all-masters/oftFldRepository.js');
            const config = getEntityConfig ? getEntityConfig(entityName) : null;

            // Check for duplicate names (excluding current entity)
            if (config && config.nameField && data[config.nameField]) {
                const exists = await oftFldRepository.nameExists(
                    entityName,
                    data[config.nameField],
                    id
                );
                if (exists) {
                    throw new ConflictError(`${entityName} with this ${config.nameField} already exists`);
                }
            }

            // Validate foreign key references if they're being updated
            if (Object.keys(data).some(key => key.includes('Id'))) {
                await oftFldRepository.validateReferences(entityName, data);
            }

            return await oftFldRepository.update(entityName, id, data);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'update');
        }
    }

    /**
     * Delete entity
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @returns {Promise<object>}
     * @throws {ValidationError} If ID is invalid
     * @throws {NotFoundError} If entity not found
     * @throws {ConflictError} If entity has dependent records
     */
    async delete(entityName, id) {
        if (!entityName || typeof entityName !== 'string') {
            throw new ValidationError('Entity name is required');
        }
        
        if (id === undefined || id === null || id === '') {
            throw new ValidationError('ID is required');
        }
        
        try {
            // Check if entity exists
            await this.getById(entityName, id);

            return await oftFldRepository.deleteEntity(entityName, id);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
                throw error;
            }
            throw translatePrismaError(error, entityName, 'delete');
        }
    }

    /**
     * Get OFT thematic areas by subject ID
     * @param {number} oftSubjectId - OFT Subject ID
     * @returns {Promise<Array>}
     * @throws {ValidationError} If subjectId is invalid
     */
    async getOftThematicAreasBySubject(oftSubjectId) {
        try {
            return await oftFldRepository.findOftThematicAreasBySubject(oftSubjectId);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, 'OFT Thematic Area', 'getBySubject');
        }
    }

    /**
     * Get FLD thematic areas by sector ID
     * @param {number} sectorId - Sector ID
     * @returns {Promise<Array>}
     * @throws {ValidationError} If sectorId is invalid
     */
    async getFldThematicAreasBySector(sectorId) {
        try {
            return await oftFldRepository.findFldThematicAreasBySector(sectorId);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, 'FLD Thematic Area', 'getBySector');
        }
    }

    /**
     * Get FLD categories by sector ID
     * @param {number} sectorId - Sector ID
     * @returns {Promise<Array>}
     * @throws {ValidationError} If sectorId is invalid
     */
    async getFldCategoriesBySector(sectorId) {
        try {
            return await oftFldRepository.findFldCategoriesBySector(sectorId);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, 'FLD Category', 'getBySector');
        }
    }

    /**
     * Get FLD subcategories by category ID
     * @param {number} categoryId - Category ID
     * @returns {Promise<Array>}
     * @throws {ValidationError} If categoryId is invalid
     */
    async getFldSubcategoriesByCategory(categoryId) {
        try {
            return await oftFldRepository.findFldSubcategoriesByCategory(categoryId);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, 'FLD Subcategory', 'getByCategory');
        }
    }

    /**
     * Get FLD crops by subcategory ID
     * @param {number} subCategoryId - Subcategory ID
     * @returns {Promise<Array>}
     * @throws {ValidationError} If subCategoryId is invalid
     */
    async getFldCropsBySubcategory(subCategoryId) {
        try {
            return await oftFldRepository.findFldCropsBySubcategory(subCategoryId);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, 'FLD Crop', 'getBySubcategory');
        }
    }

    /**
     * Get CFLD crops by season and type
     * @param {number} seasonId - Season ID
     * @param {number} typeId - Crop Type ID
     * @returns {Promise<Array>}
     * @throws {ValidationError} If IDs are invalid
     */
    async getCfldCropsBySeasonAndType(seasonId, typeId) {
        if (!seasonId && !typeId) {
            throw new ValidationError('At least one of seasonId or typeId is required');
        }
        
        try {
            const filters = {};
            if (seasonId) {
                const parsedSeasonId = parseInt(seasonId);
                if (isNaN(parsedSeasonId) || parsedSeasonId <= 0) {
                    throw new ValidationError('Invalid season ID', 'seasonId');
                }
                filters.seasonId = parsedSeasonId;
            }
            if (typeId) {
                const parsedTypeId = parseInt(typeId);
                if (isNaN(parsedTypeId) || parsedTypeId <= 0) {
                    throw new ValidationError('Invalid crop type ID', 'typeId');
                }
                filters.typeId = parsedTypeId;
            }
            
            const result = await oftFldRepository.findAll('cfld-crops', {
                filters,
                limit: 1000, // Fetch all for dropdowns usually
            });
            return result.data;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw translatePrismaError(error, 'CFLD Crop', 'getBySeasonAndType');
        }
    }

    /**
     * Get statistics
     * @returns {Promise<object>}
     */
    async getStats() {
        try {
            return await oftFldRepository.getStats();
        } catch (error) {
            throw translatePrismaError(error, 'Statistics', 'getStats');
        }
    }
}

module.exports = new OftFldService();
