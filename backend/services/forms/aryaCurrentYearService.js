const aryaCurrentYearRepository = require('../../repositories/forms/aryaCurrentYearRepository');

const aryaCurrentYearService = {
    getAll: async (filters, user) => {
        return await aryaCurrentYearRepository.findAll(filters, user);
    },

    getById: async (id, user) => {
        return await aryaCurrentYearRepository.findById(id, user);
    },

    create: async (data, user) => {
        return await aryaCurrentYearRepository.create(data, user);
    },

    update: async (id, data, user) => {
        return await aryaCurrentYearRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await aryaCurrentYearRepository.delete(id, user);
    }
};

module.exports = aryaCurrentYearService;
