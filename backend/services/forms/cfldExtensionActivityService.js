const cfldExtensionActivityRepository = require('../../repositories/forms/cfldExtensionActivityRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const cfldExtensionActivityService = {
    getActivityTypes: async () => {
        return await cfldExtensionActivityRepository.getActivityTypes();
    },

    create: async (data, user) => {
        const result = await cfldExtensionActivityRepository.create(data, {}, user);
        await invalidateCfldExtensionReportCache(result?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await cfldExtensionActivityRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await cfldExtensionActivityRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await cfldExtensionActivityRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const result = await cfldExtensionActivityRepository.update(id, data);
        await invalidateCfldExtensionReportCache(existing.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await cfldExtensionActivityRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const deleted = await cfldExtensionActivityRepository.delete(id);
        await invalidateCfldExtensionReportCache(existing.kvkId);
        return deleted;
    }
};

async function invalidateCfldExtensionReportCache(kvkId) {
    if (!kvkId) return;
    try {
        await reportCacheInvalidationService.invalidateDataSourceForKvk('cfldExtensionActivity', kvkId);
    } catch (error) {
        console.warn('Failed to invalidate CFLD extension report cache:', error?.message || error);
    }
}

module.exports = cfldExtensionActivityService;
