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
    },

    getResultById: async (id) => {
        return await nariBioFortifiedCropRepository.getResultById(id);
    },

    createResult: async (id, data) => {
        return await nariBioFortifiedCropRepository.createResult(id, data);
    },

    updateResult: async (id, data) => {
        return await nariBioFortifiedCropRepository.updateResult(id, data);
    }
};

module.exports = nariBioFortifiedCropService;
