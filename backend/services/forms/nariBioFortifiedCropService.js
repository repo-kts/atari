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
        const result   = await nariBioFortifiedCropRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariBioFortified',
            result?.kvkId || existing?.kvkId || user?.kvkId,
        );
        return result;
    },

    delete: async (id, user) => {
        const existing = await nariBioFortifiedCropRepository.findById(id);
        const result   = await nariBioFortifiedCropRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'nariBioFortified',
            existing?.kvkId || user?.kvkId,
        );
        return result;
    },
};

module.exports = nariBioFortifiedCropService;
