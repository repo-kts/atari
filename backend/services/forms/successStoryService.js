const successStoryRepository = require('../../repositories/forms/successStoryRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const successStoryService = {
    getAll: (filters, user) => successStoryRepository.findAll(filters, user),
    
    getById: (id, user) => successStoryRepository.findById(id, user),
    
    create: async (data, user) => {
        const result = await successStoryRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'successStory',
            result?.kvkId || user?.kvkId,
        );
        return result;
    },
    
    update: async (id, data, user) => {
        const result = await successStoryRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'successStory',
            result?.kvkId || user?.kvkId,
        );
        return result;
    },
    
    delete: async (id, user) => {
        const existing = await successStoryRepository.findById(id, user);
        const result = await successStoryRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'successStory',
            existing?.kvkId || user?.kvkId,
        );
        return result;
    },
};

module.exports = successStoryService;
