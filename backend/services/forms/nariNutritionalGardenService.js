const nariNutritionalGardenRepository = require('../../repositories/forms/nariNutritionalGardenRepository.js');

const nariNutritionalGardenService = {
    create: async (data, user) => {
        return await nariNutritionalGardenRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return await nariNutritionalGardenRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariNutritionalGardenRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        return await nariNutritionalGardenRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await nariNutritionalGardenRepository.delete(id, user);
    }
};

module.exports = nariNutritionalGardenService;
