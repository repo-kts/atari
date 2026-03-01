const agriDroneRepository = require('../../repositories/forms/agriDroneRepository.js');

const agriDroneService = {
    create: async (data, user) => {
        return await agriDroneRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return await agriDroneRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await agriDroneRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        return await agriDroneRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await agriDroneRepository.delete(id, user);
    }
};

module.exports = agriDroneService;
