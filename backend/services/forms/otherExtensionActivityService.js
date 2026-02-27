const otherExtensionActivityRepository = require('../../repositories/forms/otherExtensionActivityRepository.js');

const otherExtensionActivityService = {
    createOtherExtensionActivity: async (data, user) => {
        return await otherExtensionActivityRepository.create(data, user);
    },

    getAllOtherExtensionActivities: async (filters = {}, user) => {
        return await otherExtensionActivityRepository.findAll(filters, user);
    },

    getOtherExtensionActivityById: async (id, user) => {
        return await otherExtensionActivityRepository.findById(id, user);
    },

    updateOtherExtensionActivity: async (id, data, user) => {
        return await otherExtensionActivityRepository.update(id, data, user);
    },

    deleteOtherExtensionActivity: async (id, user) => {
        return await otherExtensionActivityRepository.delete(id, user);
    }
};

module.exports = otherExtensionActivityService;
