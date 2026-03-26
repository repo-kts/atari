const nariTrainingRepository = require('../../repositories/forms/nariTrainingRepository');

const nariTrainingService = {
    getAll: async (filters, user) => {
        return await nariTrainingRepository.findAll(filters, user);
    },

    getById: async (id, user) => {
        return await nariTrainingRepository.findById(id, user);
    },

    create: async (data, user) => {
        return await nariTrainingRepository.create(data, user);
    },

    update: async (id, data, user) => {
        return await nariTrainingRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await nariTrainingRepository.delete(id, user);
    }
};

module.exports = nariTrainingService;
