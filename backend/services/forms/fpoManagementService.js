const fpoManagementRepository = require('../../repositories/forms/fpoManagementRepository');

const fpoManagementService = {
    create: async (data, user) => {
        return await fpoManagementRepository.create(data, user);
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
        return await fpoManagementRepository.update(id, data);
    },

    delete: async (id, user) => {
        const existing = await fpoManagementRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await fpoManagementRepository.delete(id);
    }
};

module.exports = fpoManagementService;
