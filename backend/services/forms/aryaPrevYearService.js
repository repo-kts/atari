const aryaPrevYearRepository = require('../../repositories/forms/aryaPrevYearRepository');

const aryaPrevYearService = {
    getAll: async (filters, user) => {
        return await aryaPrevYearRepository.findAll(filters, user);
    },

    getById: async (id, user) => {
        return await aryaPrevYearRepository.findById(id, user);
    },

    create: async (data, user) => {
        return await aryaPrevYearRepository.create(data, user);
    },

    update: async (id, data, user) => {
        return await aryaPrevYearRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await aryaPrevYearRepository.delete(id, user);
    }
};

module.exports = aryaPrevYearService;
