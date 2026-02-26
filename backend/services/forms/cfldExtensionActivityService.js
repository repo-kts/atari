const cfldExtensionActivityRepository = require('../../repositories/forms/cfldExtensionActivityRepository');

const cfldExtensionActivityService = {
    create: async (data, user) => {
        return await cfldExtensionActivityRepository.create(data, {}, user);
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
        return await cfldExtensionActivityRepository.update(id, data);
    },

    delete: async (id, user) => {
        const existing = await cfldExtensionActivityRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await cfldExtensionActivityRepository.delete(id);
    }
};

module.exports = cfldExtensionActivityService;
