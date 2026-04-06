const aryaCurrentYearRepository = require('../../repositories/forms/aryaCurrentYearRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const aryaCurrentYearService = {
    getAll: async (filters, user) => {
        return await aryaCurrentYearRepository.findAll(filters, user);
    },

    getById: async (id, user) => {
        return await aryaCurrentYearRepository.findById(id, user);
    },

    create: async (data, user) => {
        const result = await aryaCurrentYearRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaCurrent', result?.kvkId || user?.kvkId);
        return result;
    },

    update: async (id, data, user) => {
        const existing = await aryaCurrentYearRepository.findById(id, user);
        const result = await aryaCurrentYearRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaCurrent', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await aryaCurrentYearRepository.findById(id, user);
        const result = await aryaCurrentYearRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaCurrent', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = aryaCurrentYearService;
