const cfldBudgetUtilizationRepository = require('../../repositories/forms/cfldBudgetUtilizationRepository');

const cfldBudgetUtilizationService = {
    create: async (data, user) => {
        return await cfldBudgetUtilizationRepository.create(data, {}, user);
    },

    findAll: async (filters, user) => {
        return await cfldBudgetUtilizationRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await cfldBudgetUtilizationRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await cfldBudgetUtilizationRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await cfldBudgetUtilizationRepository.update(id, data);
    },

    delete: async (id, user) => {
        const existing = await cfldBudgetUtilizationRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await cfldBudgetUtilizationRepository.delete(id);
    }
};

module.exports = cfldBudgetUtilizationService;
