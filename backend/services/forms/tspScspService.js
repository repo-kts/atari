'use strict';

const tspScspRepository = require('../../repositories/forms/tspScspRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const tspScspService = {
    create: async (data, user) => {
        const result = await tspScspRepository.create(data, user);
        const kvkId = result?.kvkId || user?.kvkId;
        // Invalidate both TSP and SCSP datasources since type may be either
        await reportCacheInvalidationService.invalidateDataSourceForKvk('tsp', kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('scsp', kvkId);
        return result;
    },

    findAll: async (filters, user) => tspScspRepository.findAll(filters, user),

    findById: async (id, user) => tspScspRepository.findById(id, user),

    update: async (id, data, user) => {
        const existing = await tspScspRepository.findById(id, user);
        if (!existing) throw new Error('Record not found or unauthorized');
        const result = await tspScspRepository.update(id, data, user);
        const kvkId = result?.kvkId || existing?.kvkId || user?.kvkId;
        await reportCacheInvalidationService.invalidateDataSourceForKvk('tsp', kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('scsp', kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await tspScspRepository.findById(id, user);
        if (!existing) throw new Error('Record not found or unauthorized');
        const result = await tspScspRepository.delete(id, user);
        const kvkId = existing?.kvkId || user?.kvkId;
        await reportCacheInvalidationService.invalidateDataSourceForKvk('tsp', kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('scsp', kvkId);
        return result;
    },
};

module.exports = tspScspService;
