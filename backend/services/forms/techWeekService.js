const techWeekRepository = require('../../repositories/forms/techWeekRepository.js');

const techWeekService = {
    create: async (data, user) => techWeekRepository.create(data, user),
    getAll: async (user) => techWeekRepository.findAll(user),
    getById: async (id) => techWeekRepository.findById(id),
    update: async (id, data) => techWeekRepository.update(id, data),
    delete: async (id) => techWeekRepository.delete(id),
};

module.exports = techWeekService;
