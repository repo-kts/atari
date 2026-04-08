const nariTrainingRepository = require('../../repositories/forms/nariTrainingRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const nariTrainingService = {
    getAll: async (filters, user) => {
        return await nariTrainingRepository.findAll(filters, user);
    },

    getById: async (id, user) => {
        return await nariTrainingRepository.findById(id, user);
    },

    create: async (data, user) => {
        const result = await nariTrainingRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariTraining',
            result?.kvkId || user?.kvkId,
        );
        return result;
    },

    update: async (id, data, user) => {
        const existing = await nariTrainingRepository.findById(id, user);
        const result   = await nariTrainingRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariTraining',
            result?.kvkId || existing?.kvkId || user?.kvkId,
        );
        return result;
    },

    delete: async (id, user) => {
        const existing = await nariTrainingRepository.findById(id, user);
        const result   = await nariTrainingRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariTraining',
            existing?.kvkId || user?.kvkId,
        );
        return result;
    },
};

module.exports = nariTrainingService;
