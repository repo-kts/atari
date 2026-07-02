const poshanMaahRepository = require('../../repositories/forms/poshanMaahRepository.js');

const poshanMaahService = {
    create: async (data, user) => {
        return poshanMaahRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return poshanMaahRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return poshanMaahRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        return poshanMaahRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return poshanMaahRepository.delete(id, user);
    },
};

module.exports = poshanMaahService;
