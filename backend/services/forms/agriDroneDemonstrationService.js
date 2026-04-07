const repo = require('../../repositories/forms/agriDroneDemonstrationRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const agriDroneDemonstrationService = {
    create: async (data, user) => {
        const result = await repo.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneIntroduction', result?.kvkId || user?.kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneDemonstrationDetails', result?.kvkId || user?.kvkId);
        return result;
    },
    findAll: async (filters, user) => repo.findAll(filters, user),
    findById: async (id, user) => repo.findById(id, user),
    update: async (id, data, user) => {
        const result = await repo.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneIntroduction', result?.kvkId || user?.kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneDemonstrationDetails', result?.kvkId || user?.kvkId);
        return result;
    },
    delete: async (id, user) => {
        const existing = await repo.findById(id, user);
        const result = await repo.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneIntroduction', existing?.kvkId || user?.kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('agriDroneDemonstrationDetails', existing?.kvkId || user?.kvkId);
        return result;
    },
};

module.exports = agriDroneDemonstrationService;

