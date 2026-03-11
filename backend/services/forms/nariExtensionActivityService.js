const nariExtensionActivityRepository = require('../../repositories/forms/nariExtensionActivityRepository.js');

const nariExtensionActivityService = {
    create: async (data, user) => {
        return await nariExtensionActivityRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return await nariExtensionActivityRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariExtensionActivityRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        return await nariExtensionActivityRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await nariExtensionActivityRepository.delete(id, user);
    }
};

module.exports = nariExtensionActivityService;
