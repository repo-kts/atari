const csisaRepository = require('../../repositories/forms/csisaRepository.js');

const csisaService = {
    createCSISA: async (data, user) => {
        return await csisaRepository.create(data, user);
    },

    getAllCSISA: async (filters = {}, user) => {
        return await csisaRepository.findAll(filters, user);
    },

    getCSISAById: async (id, user) => {
        return await csisaRepository.findById(id, user);
    },

    updateCSISA: async (id, data, user) => {
        return await csisaRepository.update(id, data, user);
    },

    deleteCSISA: async (id, user) => {
        return await csisaRepository.delete(id, user);
    },
};

module.exports = csisaService;
