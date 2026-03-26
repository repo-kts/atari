const tspScspRepository = require('../../repositories/forms/tspScspRepository.js');

const tspScspService = {
    create: async (data, user) => tspScspRepository.create(data, user),
    findAll: async (filters, user) => tspScspRepository.findAll(filters, user),
    findById: async (id, user) => tspScspRepository.findById(id, user),
    update: async (id, data, user) => tspScspRepository.update(id, data, user),
    delete: async (id, user) => tspScspRepository.delete(id, user),
};

module.exports = tspScspService;

