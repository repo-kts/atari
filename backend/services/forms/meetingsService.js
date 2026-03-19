const meetingsRepository = require('../../repositories/forms/meetingsRepository');

const meetingsService = {
    sac: {
        findAll: async (filters, user) => await meetingsRepository.sac.findAll(filters, user),
        findById: async (id, user) => await meetingsRepository.sac.findById(id, user),
        create: async (data, user) => await meetingsRepository.sac.create(data, user),
        update: async (id, data, user) => await meetingsRepository.sac.update(id, data, user),
        delete: async (id, user) => await meetingsRepository.sac.delete(id, user),
    },
    other: {
        findAll: async (filters, user) => await meetingsRepository.other.findAll(filters, user),
        findById: async (id, user) => await meetingsRepository.other.findById(id, user),
        create: async (data, user) => await meetingsRepository.other.create(data, user),
        update: async (id, data, user) => await meetingsRepository.other.update(id, data, user),
        delete: async (id, user) => await meetingsRepository.other.delete(id, user),
    }
};

module.exports = meetingsService;
