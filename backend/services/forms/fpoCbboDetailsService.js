const fpoCbboDetailsRepository = require('../../repositories/forms/fpoCbboDetailsRepository');

const fpoCbboDetailsService = {
    create: async (data, user) => {
        return await fpoCbboDetailsRepository.create(data, user);
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
        return await fpoCbboDetailsRepository.update(id, data);
    },

    delete: async (id, user) => {
        const existing = await fpoCbboDetailsRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await fpoCbboDetailsRepository.delete(id);
    }
};

module.exports = fpoCbboDetailsService;
