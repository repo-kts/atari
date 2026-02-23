const celebrationDaysRepository = require('../../repositories/forms/celebrationDaysRepository.js');

const celebrationDaysService = {
    create: async (data, user) => celebrationDaysRepository.create(data, user),
    getAll: async (user) => celebrationDaysRepository.findAll(user),
    getById: async (id) => celebrationDaysRepository.findById(id),
    update: async (id, data) => celebrationDaysRepository.update(id, data),
    delete: async (id) => celebrationDaysRepository.delete(id),
};

module.exports = celebrationDaysService;
