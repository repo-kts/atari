const oftRepository = require('../../repositories/forms/oftRepository.js');

const oftService = {
    createOft: async (data, user) => {
        return await oftRepository.create(data, user);
    },

    getAllOft: async (filters = {}, user) => {
        return await oftRepository.findAll(filters, user);
    },

    getOftById: async (id, user) => {
        return await oftRepository.findById(id, user);
    },

    updateOft: async (id, data, user) => {
        return await oftRepository.update(id, data, user);
    },

    deleteOft: async (id, user) => {
        return await oftRepository.delete(id, user);
    },
};

module.exports = oftService;
