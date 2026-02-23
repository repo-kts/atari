const oftRepository = require('../../repositories/forms/oftRepository.js');

const oftService = {
    createOft: async (data, user) => await oftRepository.create(data, user),
    getAllOft: async (user) => await oftRepository.findAll(user),
    getOftById: async (id) => await oftRepository.findById(id),
    updateOft: async (id, data) => await oftRepository.update(id, data),
    deleteOft: async (id) => await oftRepository.delete(id)
};

module.exports = oftService;
