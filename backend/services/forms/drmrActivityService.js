const drmrActivityRepository = require('../../repositories/forms/drmrActivityRepository');

const drmrActivityService = {
    create: async (data, user) => drmrActivityRepository.create(data, user),
    findAll: async (filters, user) => drmrActivityRepository.findAll(filters, user),
    findById: async (id, user) => drmrActivityRepository.findById(id, user),
    update: async (id, data, user) => drmrActivityRepository.update(id, data, user),
    delete: async (id, user) => drmrActivityRepository.delete(id, user),
};

module.exports = drmrActivityService;

