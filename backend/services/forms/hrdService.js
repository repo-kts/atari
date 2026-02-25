const hrdRepository = require('../../repositories/forms/hrdRepository');

const hrdService = {
    create: async (data, user) => {
        return await hrdRepository.create(data, user);
    },

    findAll: async (user) => {
        return await hrdRepository.findAll(user);
    },

    findById: async (id) => {
        return await hrdRepository.findById(id);
    },

    update: async (id, data, user) => {
        // Optional: Check if record exists and user has permission to update it
        if (user.roleName === 'kvk_admin' || user.roleName === 'kvk_user') {
            const existing = await hrdRepository.findById(id);
            if (!existing || existing.kvkId !== parseInt(user.kvkId)) {
                throw new Error('Unauthorized or record not found');
            }
        }
        return await hrdRepository.update(id, data);
    },

    delete: async (id, user) => {
        // Optional: Check if record exists and user has permission to delete it
        if (user.roleName === 'kvk_admin' || user.roleName === 'kvk_user') {
            const existing = await hrdRepository.findById(id);
            if (!existing || existing.kvkId !== parseInt(user.kvkId)) {
                throw new Error('Unauthorized or record not found');
            }
        }
        return await hrdRepository.delete(id);
    }
};

module.exports = hrdService;
