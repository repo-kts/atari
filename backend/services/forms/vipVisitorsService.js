const vipVisitorsRepository = require('../../repositories/forms/vipVisitorsRepository.js');

const vipVisitorsService = {
    create: async (data, user) => {
        return await vipVisitorsRepository.create(data, user);
    },

    findAll: async (filters, user) => {
        return await vipVisitorsRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        const record = await vipVisitorsRepository.findById(id, user);
        if (!record) throw new Error('Record not found');
        return record;
    },

    update: async (id, data, user) => {
        return await vipVisitorsRepository.update(id, data, user);
    },

    delete: async (id, user) => {
        return await vipVisitorsRepository.delete(id, user);
    },

    findAllDignitaryTypes: async () => {
        return await vipVisitorsRepository.findAllDignitaryTypes();
    }
};

module.exports = vipVisitorsService;
