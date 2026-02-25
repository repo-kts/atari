const otherExtensionActivityRepository = require('../../repositories/forms/otherExtensionActivityRepository.js');

const otherExtensionActivityService = {
    createOtherExtensionActivity: async (data, user) => {
        return await otherExtensionActivityRepository.create(data, user);
    },

    getAllOtherExtensionActivities: async (filters = {}, user) => {
        return await otherExtensionActivityRepository.findAll(filters, user);
    },

    getOtherExtensionActivityById: async (id) => {
        return await otherExtensionActivityRepository.findById(id);
    },

    updateOtherExtensionActivity: async (id, data, user) => {
        const existing = await otherExtensionActivityRepository.findById(id);
        if (!existing) throw new Error('Other extension activity not found');

        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        return await otherExtensionActivityRepository.update(id, data, user);
    },

    deleteOtherExtensionActivity: async (id, user) => {
        const existing = await otherExtensionActivityRepository.findById(id);
        if (!existing) throw new Error('Other extension activity not found');

        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        return await otherExtensionActivityRepository.delete(id);
    }
};

module.exports = otherExtensionActivityService;
