const poshanMaahRepository = require('../../repositories/forms/poshanMaahRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const poshanMaahService = {
    create: async (data, user) => {
        const result = await poshanMaahRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('poshanMaah', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return poshanMaahRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return poshanMaahRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        const result = await poshanMaahRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('poshanMaah', result?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const result = await poshanMaahRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('poshanMaah', result?.kvkId || user?.kvkId);
        return result;
    },
};

module.exports = poshanMaahService;
