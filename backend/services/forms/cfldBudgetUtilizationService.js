const cfldBudgetUtilizationRepository = require('../../repositories/forms/cfldBudgetUtilizationRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const cfldBudgetUtilizationService = {
    create: async (data, user) => {
        const result = await cfldBudgetUtilizationRepository.create(data, {}, user);
        await invalidateCfldBudgetReportCache(result?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await cfldBudgetUtilizationRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await cfldBudgetUtilizationRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await cfldBudgetUtilizationRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const result = await cfldBudgetUtilizationRepository.update(id, data, user);
        await invalidateCfldBudgetReportCache(existing.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await cfldBudgetUtilizationRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const deleted = await cfldBudgetUtilizationRepository.delete(id);
        await invalidateCfldBudgetReportCache(existing.kvkId);
        return deleted;
    }
};

async function invalidateCfldBudgetReportCache(kvkId) {
    if (!kvkId) return;
    try {
        await reportCacheInvalidationService.invalidateDataSourceForKvk('cfldBudgetUtilization', kvkId);
    } catch (error) {
        console.warn('Failed to invalidate CFLD budget report cache:', error?.message || error);
    }
}

module.exports = cfldBudgetUtilizationService;
