const fpoManagementRepository = require('../../repositories/forms/fpoManagementRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const fpoManagementService = {
    create: async (data, user) => {
        const result = await fpoManagementRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('fpoManagement', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await fpoManagementRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await fpoManagementRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await fpoManagementRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const result = await fpoManagementRepository.update(id, data);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('fpoManagement', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await fpoManagementRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const result = await fpoManagementRepository.delete(id);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('fpoManagement', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = fpoManagementService;
