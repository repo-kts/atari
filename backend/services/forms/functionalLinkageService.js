const functionalLinkageRepository = require('../../repositories/forms/functionalLinkageRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const functionalLinkageService = {
    getAll: (filters, user) => functionalLinkageRepository.findAll(filters, user),
    
    getById: (id, user) => functionalLinkageRepository.findById(id, user),
    
    create: async (data, user) => {
        const result = await functionalLinkageRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'functionalLinkage',
            result?.kvkId || user?.kvkId,
        );
        return result;
    },
    
    update: async (id, data, user) => {
        const result = await functionalLinkageRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'functionalLinkage',
            result?.kvkId || user?.kvkId,
        );
        return result;
    },
    
    delete: async (id, user) => {
        const existing = await functionalLinkageRepository.findById(id, user);
        const result = await functionalLinkageRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'functionalLinkage',
            existing?.kvkId || user?.kvkId,
        );
        return result;
    },
};

module.exports = functionalLinkageService;
