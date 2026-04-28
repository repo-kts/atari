const drmrDetailsRepository = require('../../repositories/forms/drmrDetailsRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const drmrDetailsService = {
    create: async (data, user) => {
        const result = await drmrDetailsRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('drmrDetails', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await drmrDetailsRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await drmrDetailsRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await drmrDetailsRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const result = await drmrDetailsRepository.update(id, data);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('drmrDetails', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await drmrDetailsRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        const result = await drmrDetailsRepository.delete(id);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('drmrDetails', existing?.kvkId || user?.kvkId);
        return result;
    }
};

module.exports = drmrDetailsService;
