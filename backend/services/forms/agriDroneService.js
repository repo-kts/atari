const agriDroneRepository = require('../../repositories/forms/agriDroneRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const agriDroneService = {
    create: async (data, user) => {
        const result = await agriDroneRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneIntroduction', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await agriDroneRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await agriDroneRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        const result = await agriDroneRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneIntroduction', result?.kvkId ?? user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await agriDroneRepository.findById(id, user);
        const result = await agriDroneRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneIntroduction', existing?.kvkId || user?.kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneDemonstrationDetails', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = agriDroneService;
