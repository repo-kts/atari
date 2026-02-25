const cfldTechnicalParameterRepository = require('../../repositories/forms/cfldTechnicalParameterRepository');

const cfldTechnicalParameterService = {
    create: async (data, user) => {
        return await cfldTechnicalParameterRepository.create(data, {}, user);
    },

    findAll: async (filters, user) => {
        return await cfldTechnicalParameterRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await cfldTechnicalParameterRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await cfldTechnicalParameterRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await cfldTechnicalParameterRepository.update(id, data);
    },

    delete: async (id, user) => {
        const existing = await cfldTechnicalParameterRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await cfldTechnicalParameterRepository.delete(id);
    }
};

module.exports = cfldTechnicalParameterService;
