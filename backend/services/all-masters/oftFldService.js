const oftFldRepository = require('../../repositories/all-masters/oftFldRepository.js');

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
     */
    async getAll(entityName, options = {}) {
        const result = await oftFldRepository.findAll(entityName, options);
        return {
            ...result,
            page: options.page || 1,
            limit: options.limit || 100,
        };
    }

    /**
     * Get entity by ID
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @returns {Promise<object>}
     */
    async getById(entityName, id) {
        const entity = await oftFldRepository.findById(entityName, id);
        if (!entity) {
            throw new Error(`${entityName} with ID ${id} not found`);
        }
        return entity;
    }

    /**
     * Create new entity
     * @param {string} entityName - Entity name
     * @param {object} data - Entity data
     * @returns {Promise<object>}
     */
    async create(entityName, data) {
        // Validate foreign key references
        const isValid = await oftFldRepository.validateReferences(entityName, data);
        if (!isValid) {
            throw new Error('Invalid foreign key reference');
        }

        // Check for duplicate names (where applicable)
        const config = oftFldRepository.getEntityConfig ?
            oftFldRepository.getEntityConfig(entityName) : null;

        if (config && config.nameField && data[config.nameField]) {
            const exists = await oftFldRepository.nameExists(
                entityName,
                data[config.nameField]
            );
            if (exists) {
                throw new Error(`${entityName} with this name already exists`);
            }
        }

        return await oftFldRepository.create(entityName, data);
    }

    /**
     * Update entity
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @param {object} data - Updated data
     * @returns {Promise<object>}
     */
    async update(entityName, id, data) {
        // Check if entity exists
        await this.getById(entityName, id);

        // Validate foreign key references if they're being updated
        if (Object.keys(data).some(key => key.includes('Id'))) {
            const isValid = await oftFldRepository.validateReferences(entityName, data);
            if (!isValid) {
                throw new Error('Invalid foreign key reference');
            }
        }

        return await oftFldRepository.update(entityName, id, data);
    }

    /**
     * Delete entity
     * @param {string} entityName - Entity name
     * @param {number} id - Entity ID
     * @returns {Promise<object>}
     */
    async delete(entityName, id) {
        // Check if entity exists
        await this.getById(entityName, id);

        return await oftFldRepository.deleteEntity(entityName, id);
    }

    /**
     * Get OFT thematic areas by subject ID
     * @param {number} oftSubjectId - OFT Subject ID
     * @returns {Promise<Array>}
     */
    async getOftThematicAreasBySubject(oftSubjectId) {
        return await oftFldRepository.findOftThematicAreasBySubject(oftSubjectId);
    }

    /**
     * Get FLD thematic areas by sector ID
     * @param {number} sectorId - Sector ID
     * @returns {Promise<Array>}
     */
    async getFldThematicAreasBySector(sectorId) {
        return await oftFldRepository.findFldThematicAreasBySector(sectorId);
    }

    /**
     * Get FLD categories by sector ID
     * @param {number} sectorId - Sector ID
     * @returns {Promise<Array>}
     */
    async getFldCategoriesBySector(sectorId) {
        return await oftFldRepository.findFldCategoriesBySector(sectorId);
    }

    /**
     * Get FLD subcategories by category ID
     * @param {number} categoryId - Category ID
     * @returns {Promise<Array>}
     */
    async getFldSubcategoriesByCategory(categoryId) {
        return await oftFldRepository.findFldSubcategoriesByCategory(categoryId);
    }

    /**
     * Get FLD crops by subcategory ID
     * @param {number} subCategoryId - Subcategory ID
     * @returns {Promise<Array>}
     */
    async getFldCropsBySubcategory(subCategoryId) {
        return await oftFldRepository.findFldCropsBySubcategory(subCategoryId);
    }

    /**
     * Get CFLD crops by season and type
     * @param {number} seasonId - Season ID
     * @param {number} typeId - Crop Type ID
     * @returns {Promise<Array>}
     */
    async getCfldCropsBySeasonAndType(seasonId, typeId) {
        const result = await oftFldRepository.findAll('cfld-crops', {
            filters: {
                seasonId: parseInt(seasonId),
                typeId: parseInt(typeId),
            },
            limit: 1000, // Fetch all for dropdowns usually
        });
        return result.data;
    }

    /**
     * Get statistics
     * @returns {Promise<object>}
     */
    async getStats() {
        return await oftFldRepository.getStats();
    }
}

module.exports = new OftFldService();
