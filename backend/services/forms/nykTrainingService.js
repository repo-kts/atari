const nykTrainingRepository = require('../../repositories/forms/nykTrainingRepository.js');

const nykTrainingService = {
    create: async (data, user) => {
        return await nykTrainingRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return await nykTrainingRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        const record = await nykTrainingRepository.findById(id, user);
        if (!record) throw new Error('Record not found');
        return record;
    },

    update: async (id, data, user) => {
        return await nykTrainingRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await nykTrainingRepository.delete(id, user);
    }
};

module.exports = nykTrainingService;
