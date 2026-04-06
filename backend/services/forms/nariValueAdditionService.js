const nariValueAdditionRepository = require('../../repositories/forms/nariValueAdditionRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const nariValueAdditionService = {
    create: async (data, user) => {
        const result = await nariValueAdditionRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariValueAddition', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await nariValueAdditionRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariValueAdditionRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        const existing = await nariValueAdditionRepository.findById(id, user);
        const result = await nariValueAdditionRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariValueAddition', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await nariValueAdditionRepository.findById(id, user);
        const result = await nariValueAdditionRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariValueAddition', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = nariValueAdditionService;
