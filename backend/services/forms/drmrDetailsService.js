const drmrDetailsRepository = require('../../repositories/forms/drmrDetailsRepository');

const drmrDetailsService = {
    create: async (data, user) => {
        return await drmrDetailsRepository.create(data, user);
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
        return await drmrDetailsRepository.update(id, data);
    },

    delete: async (id, user) => {
        const existing = await drmrDetailsRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await drmrDetailsRepository.delete(id);
    }
};

module.exports = drmrDetailsService;
