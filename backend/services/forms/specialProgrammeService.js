const specialProgrammeRepository = require('../../repositories/forms/specialProgrammeRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const specialProgrammeService = {
    getAll: (filters, user) => specialProgrammeRepository.findAll(filters, user),
    
    getById: (id, user) => specialProgrammeRepository.findById(id, user),
    
    create: async (data, user) => {
        const result = await specialProgrammeRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'specialProgramme',
            result?.kvkId || user?.kvkId,
        );
        return result;
    },
    
    update: async (id, data, user) => {
        const existing = await specialProgrammeRepository.findById(id, user);
        const result = await specialProgrammeRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'specialProgramme',
            result?.kvkId || existing?.kvkId || user?.kvkId,
        );
        return result;
    },
    
    delete: async (id, user) => {
        const existing = await specialProgrammeRepository.findById(id, user);
        const result = await specialProgrammeRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'specialProgramme',
            existing?.kvkId || user?.kvkId,
        );
        return result;
    },
};

module.exports = specialProgrammeService;
