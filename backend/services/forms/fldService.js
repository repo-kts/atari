const fldRepository = require('../../repositories/forms/fldRepository.js');

const fldService = {
    create: async (data, user) => fldRepository.create(data, user),
    getAll: async (user) => fldRepository.findAll(user),
    getById: async (id) => fldRepository.findById(id),
    update: async (id, data) => fldRepository.update(id, data),
    delete: async (id) => fldRepository.delete(id),
};

module.exports = fldService;
