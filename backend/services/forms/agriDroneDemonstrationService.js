const repo = require('../../repositories/forms/agriDroneDemonstrationRepository.js');

const agriDroneDemonstrationService = {
    create: async (data, user) => repo.create(data, user),
    findAll: async (filters, user) => repo.findAll(filters, user),
    findById: async (id, user) => repo.findById(id, user),
    update: async (id, data, user) => repo.update(id, data, user),
    delete: async (id, user) => repo.delete(id, user),
};

module.exports = agriDroneDemonstrationService;

