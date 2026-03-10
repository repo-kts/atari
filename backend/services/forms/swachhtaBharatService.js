const swachhtaBharatRepository = require('../../repositories/forms/swachhtaBharatRepository');

const createServiceLayer = (repo) => ({
    create: async (data, user) => {
        return await repo.create(data, user);
    },
    findAll: async (filters, user) => {
        return await repo.findAll(filters, user);
    },
    findById: async (id, user) => {
        const record = await repo.findById(id, user);
        if (!record) throw new Error('Record not found');
        return record;
    },
    update: async (id, data, user) => {
        return await repo.update(id, data, user);
    },
    delete: async (id, user) => {
        return await repo.delete(id, user);
    }
});

const swachhtaBharatService = {
    hiSewa: createServiceLayer(swachhtaBharatRepository.hiSewa),
    pakhwada: createServiceLayer(swachhtaBharatRepository.pakhwada),
    budget: createServiceLayer(swachhtaBharatRepository.budget),
};

module.exports = swachhtaBharatService;
