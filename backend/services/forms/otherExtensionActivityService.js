const otherExtensionActivityRepository = require('../../repositories/forms/otherExtensionActivityRepository.js');

const otherExtensionActivityService = {
    createOtherExtensionActivity: async (data) => {
        return await otherExtensionActivityRepository.create(data);
    },

    getAllOtherExtensionActivities: async (filters = {}) => {
        return await otherExtensionActivityRepository.findAll(filters);
    },

    getOtherExtensionActivityById: async (id) => {
        return await otherExtensionActivityRepository.findById(id);
    },

    updateOtherExtensionActivity: async (id, data) => {
        return await otherExtensionActivityRepository.update(id, data);
    },

    deleteOtherExtensionActivity: async (id) => {
        return await otherExtensionActivityRepository.delete(id);
    }
};

module.exports = otherExtensionActivityService;
