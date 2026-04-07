const otherExtensionActivityRepository = require('../../repositories/forms/otherExtensionActivityRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const otherExtensionActivityService = {
    createOtherExtensionActivity: async (data, user) => {
        const result = await otherExtensionActivityRepository.create(data, null, user);
        const kvkId = result?.kvkId ?? user?.kvkId;
        await reportCacheInvalidationService.invalidateDataSourceForKvk('otherExtensionContentReport', kvkId);
        return result;
    },

    getAllOtherExtensionActivities: async (filters = {}, user) => {
        return await otherExtensionActivityRepository.findAll(filters, user);
    },

    getOtherExtensionActivityById: async (id, user) => {
        return await otherExtensionActivityRepository.findById(id, user);
    },

    updateOtherExtensionActivity: async (id, data, user) => {
        const result = await otherExtensionActivityRepository.update(id, data, user);
        const kvkId = result?.kvkId ?? user?.kvkId;
        await reportCacheInvalidationService.invalidateDataSourceForKvk('otherExtensionContentReport', kvkId);
        return result;
    },

    deleteOtherExtensionActivity: async (id, user) => {
        const existing = await otherExtensionActivityRepository.findById(id, user);
        const result = await otherExtensionActivityRepository.delete(id, user);
        const kvkId = existing?.kvkId ?? user?.kvkId;
        await reportCacheInvalidationService.invalidateDataSourceForKvk('otherExtensionContentReport', kvkId);
        return result;
    },
};

module.exports = otherExtensionActivityService;
