const nariTrainingProgrammeRepository = require('../../repositories/forms/nariTrainingProgrammeRepository.js');

const nariTrainingProgrammeService = {
    create: async (data, user) => {
        return await nariTrainingProgrammeRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return await nariTrainingProgrammeRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariTrainingProgrammeRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        return await nariTrainingProgrammeRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await nariTrainingProgrammeRepository.delete(id, user);
    }
};

module.exports = nariTrainingProgrammeService;

