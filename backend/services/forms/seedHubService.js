const seedHubRepository = require('../../repositories/forms/seedHubRepository');

const seedHubService = {
    getAll: async (filters, user) => {
        // If user is KVK, always filter by their kvkId
        if (user && user.role === 'KVK') {
            filters.kvkId = user.kvkId;
        }
        return await seedHubRepository.findAll(filters);
    },

    getById: async (id) => {
        return await seedHubRepository.findById(id);
    },

    create: async (data, user) => {
        return await seedHubRepository.create(data, user);
    },

    update: async (id, data) => {
        return await seedHubRepository.update(id, data);
    },

    delete: async (id) => {
        return await seedHubRepository.delete(id);
    }
};

module.exports = seedHubService;
