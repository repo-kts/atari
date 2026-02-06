const publicationRepository = require('../../repositories/all-masters/publicationRepository.js');

/**
 * Publication Master Service
 * Business logic for Publication master data
 */

/**
 * Generic get all items
 */
const getAll = async (entityType, options) => {
    return await publicationRepository.findAll(entityType, options);
};

/**
 * Generic get by ID
 */
const getById = async (entityType, id) => {
    const item = await publicationRepository.findById(entityType, id);
    if (!item) {
        const error = new Error(`${entityType} not found`);
        error.statusCode = 404;
        throw error;
    }
    return item;
};

/**
 * Create Publication Item
 */
const createPublicationItem = async (data) => {
    const { publicationName } = data;

    // Validate
    if (!publicationName) {
        const error = new Error('Publication name is required');
        error.statusCode = 400;
        throw error;
    }

    // Check duplicate
    const exists = await publicationRepository.nameExists('publication-items', publicationName);
    if (exists) {
        const error = new Error('Publication name already exists');
        error.statusCode = 409;
        throw error;
    }

    return await publicationRepository.create('publication-items', { publicationName });
};

/**
 * Update Publication Item
 */
const updatePublicationItem = async (id, data) => {
    const { publicationName } = data;

    // Check existence
    await getById('publication-items', id);

    // Validate name if provided
    if (publicationName) {
        const exists = await publicationRepository.nameExists('publication-items', publicationName, id);
        if (exists) {
            const error = new Error('Publication name already exists');
            error.statusCode = 409;
            throw error;
        }
    }

    return await publicationRepository.update('publication-items', id, data);
};

/**
 * Generic delete
 */
const deleteEntity = async (entityType, id) => {
    // Check existence
    await getById(entityType, id);

    // Check dependencies (if any) - currently none for plain publication items
    // If future relations exist, validation goes here.

    return await publicationRepository.deleteEntity(entityType, id);
};

/**
 * Get Statistics
 */
const getStats = async () => {
    return await publicationRepository.getStats();
};

module.exports = {
    getAll,
    getById,
    createPublicationItem,
    updatePublicationItem,
    deleteEntity,
    getStats
};
