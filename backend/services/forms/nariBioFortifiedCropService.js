const nariBioFortifiedCropRepository = require('../../repositories/forms/nariBioFortifiedCropRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const nariBioFortifiedCropService = {
    create: async (data, user) => {
        const result = await nariBioFortifiedCropRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariBioFortified',
            result?.kvkId || user?.kvkId,
        );
        return result;
    },

    findAll: async (filters, user) => {
        return await nariBioFortifiedCropRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariBioFortifiedCropRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        const existing = await nariBioFortifiedCropRepository.findById(id);
        const result = await nariBioFortifiedCropRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariBioFortified',
            result?.kvkId || existing?.kvkId || user?.kvkId,
        );
        return result;
    },

    delete: async (id, user) => {
        const existing = await nariBioFortifiedCropRepository.findById(id);
        const result = await nariBioFortifiedCropRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariBioFortified',
            existing?.kvkId || user?.kvkId,
        );
        return result;
    },

    getResultById: async (id) => {
        return await nariBioFortifiedCropRepository.getResultById(id);
    },

    createResult: async (id, data) => {
        const result = await nariBioFortifiedCropRepository.createResult(id, data);
        const parent = await nariBioFortifiedCropRepository.findById(id);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariBioFortified',
            parent?.kvkId,
        );
        return result;
    },

    updateResult: async (id, data) => {
        const result = await nariBioFortifiedCropRepository.updateResult(id, data);
        const parent = await nariBioFortifiedCropRepository.findById(id);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariBioFortified',
            parent?.kvkId,
        );
        return result;
    }
};

module.exports = nariBioFortifiedCropService;
