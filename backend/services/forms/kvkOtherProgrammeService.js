const kvkOtherProgrammeRepository = require('../../repositories/forms/kvkOtherProgrammeRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const kvkOtherProgrammeService = {
    getAll: (filters, user) => kvkOtherProgrammeRepository.findAll(filters, user),
    getById: (id, user) => kvkOtherProgrammeRepository.findById(id, user),
    create: async (data, user) => {
        const result = await kvkOtherProgrammeRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('otherProgrammes', result?.kvkId || user?.kvkId);
        return result;
    },
    update: async (id, data, user) => {
        const existing = await kvkOtherProgrammeRepository.findById(id, user);
        const result = await kvkOtherProgrammeRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('otherProgrammes', existing?.kvkId || user?.kvkId);
        return result;
    },
    delete: async (id, user) => {
        const existing = await kvkOtherProgrammeRepository.findById(id, user);
        const result = await kvkOtherProgrammeRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('otherProgrammes', existing?.kvkId || user?.kvkId);
        return result;
    },
};

module.exports = kvkOtherProgrammeService;
