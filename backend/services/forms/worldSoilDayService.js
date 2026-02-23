const worldSoilDayRepository = require('../../repositories/forms/worldSoilDayRepository.js');

const worldSoilDayService = {
    create: async (data, user) => {
        return await worldSoilDayRepository.create(data, user);
    },

    findAll: async (user) => {
        return await worldSoilDayRepository.findAll(user);
    },

    findById: async (id) => {
        return await worldSoilDayRepository.findById(id);
    },

    update: async (id, data) => {
        return await worldSoilDayRepository.update(id, data);
    },

    delete: async (id) => {
        return await worldSoilDayRepository.delete(id);
    }
};

module.exports = worldSoilDayService;
