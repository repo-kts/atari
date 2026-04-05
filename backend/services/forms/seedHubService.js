const seedHubRepository = require('../../repositories/forms/seedHubRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const seedHubService = {
    getAll: async (filters, user) => {
        return await seedHubRepository.findAll(filters, user);
    },

    getById: async (id, user) => {
        return await seedHubRepository.findById(id, user);
    },

    create: async (data, user) => {
        const result = await seedHubRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('seedHub', result?.kvkId || user?.kvkId);
        return result;
    },

    update: async (id, data, user) => {
        const existing = await seedHubRepository.findById(id, user);
        const result = await seedHubRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('seedHub', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await seedHubRepository.findById(id, user);
        const result = await seedHubRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('seedHub', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = seedHubService;
