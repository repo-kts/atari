const fpoCbboDetailsRepository = require('../../repositories/forms/fpoCbboDetailsRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const fpoCbboDetailsService = {
    create: async (data, user) => {
        const result = await fpoCbboDetailsRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('fpoCbboDetails', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await fpoCbboDetailsRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await fpoCbboDetailsRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await fpoCbboDetailsRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const result = await fpoCbboDetailsRepository.update(id, data);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('fpoCbboDetails', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await fpoCbboDetailsRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const result = await fpoCbboDetailsRepository.delete(id);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('fpoCbboDetails', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = fpoCbboDetailsService;
