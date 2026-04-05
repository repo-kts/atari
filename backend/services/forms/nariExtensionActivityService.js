const nariExtensionActivityRepository = require('../../repositories/forms/nariExtensionActivityRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const nariExtensionActivityService = {
    create: async (data, user) => {
        const result = await nariExtensionActivityRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariExtension', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await nariExtensionActivityRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariExtensionActivityRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        const existing = await nariExtensionActivityRepository.findById(id, user);
        const result = await nariExtensionActivityRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariExtension', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await nariExtensionActivityRepository.findById(id, user);
        const result = await nariExtensionActivityRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariExtension', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = nariExtensionActivityService;
