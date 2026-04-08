const aryaPrevYearRepository = require('../../repositories/forms/aryaPrevYearRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const aryaPrevYearService = {
    getAll: async (filters, user) => {
        return await aryaPrevYearRepository.findAll(filters, user);
    },

    getById: async (id, user) => {
        return await aryaPrevYearRepository.findById(id, user);
    },

    create: async (data, user) => {
        const result = await aryaPrevYearRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaPrevYear', result?.kvkId || user?.kvkId);
        return result;
    },

    update: async (id, data, user) => {
        const existing = await aryaPrevYearRepository.findById(id, user);
        const result = await aryaPrevYearRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaPrevYear', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await aryaPrevYearRepository.findById(id, user);
        const result = await aryaPrevYearRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaPrevYear', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = aryaPrevYearService;
