const nariValueAdditionRepository = require('../../repositories/forms/nariValueAdditionRepository.js');

const nariValueAdditionService = {
    create: async (data, user) => {
        return await nariValueAdditionRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return await nariValueAdditionRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariValueAdditionRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        return await nariValueAdditionRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await nariValueAdditionRepository.delete(id, user);
    }
};

module.exports = nariValueAdditionService;
