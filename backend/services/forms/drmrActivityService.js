const drmrActivityRepository = require('../../repositories/forms/drmrActivityRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const drmrActivityService = {
    create: async (data, user) => {
        const result = await drmrActivityRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('drmrActivity', result?.kvkId || user?.kvkId);
        return result;
    },
    findAll: async (filters, user) => drmrActivityRepository.findAll(filters, user),
    findById: async (id, user) => drmrActivityRepository.findById(id, user),
    update: async (id, data, user) => {
        const existing = await drmrActivityRepository.findById(id, user);
        if (!existing) throw new Error('Record not found or unauthorized');
        const result = await drmrActivityRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'drmrActivity',
            result?.kvkId || existing?.kvkId || user?.kvkId
        );
        return result;
    },
    delete: async (id, user) => {
        const existing = await drmrActivityRepository.findById(id, user);
        if (!existing) throw new Error('Record not found or unauthorized');
        const result = await drmrActivityRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('drmrActivity', existing?.kvkId || user?.kvkId);
        return result;
    },
};

module.exports = drmrActivityService;

