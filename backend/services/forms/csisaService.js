const csisaRepository = require('../../repositories/forms/csisaRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const csisaService = {
    createCSISA: async (data, user) => {
        const result = await csisaRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'csisa',
            result?.kvkId || user?.kvkId,
        );
        return result;
    },

    getAllCSISA: async (filters = {}, user) => {
        return await csisaRepository.findAll(filters, user);
    },

    getCSISAById: async (id, user) => {
        return await csisaRepository.findById(id, user);
    },

    updateCSISA: async (id, data, user) => {
        const existing = await csisaRepository.findById(id, user);
        const result   = await csisaRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'csisa',
            result?.kvkId || existing?.kvkId || user?.kvkId,
        );
        return result;
    },

    deleteCSISA: async (id, user) => {
        const existing = await csisaRepository.findById(id, user);
        const result   = await csisaRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'csisa',
            existing?.kvkId || user?.kvkId,
        );
        return result;
    },
};

module.exports = csisaService;
