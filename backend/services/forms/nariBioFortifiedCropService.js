const nariBioFortifiedCropRepository = require('../../repositories/forms/nariBioFortifiedCropRepository.js');

const nariBioFortifiedCropService = {
    create: async (data, user) => {
        return await nariBioFortifiedCropRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return await nariBioFortifiedCropRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariBioFortifiedCropRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        return await nariBioFortifiedCropRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await nariBioFortifiedCropRepository.delete(id, user);
    }
};

module.exports = nariBioFortifiedCropService;
