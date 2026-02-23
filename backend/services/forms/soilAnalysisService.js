const soilAnalysisRepository = require('../../repositories/forms/soilAnalysisRepository.js');

const soilAnalysisService = {
    create: async (data, user) => soilAnalysisRepository.create(data, user),
    getAll: async (user) => soilAnalysisRepository.findAll(user),
    getById: async (id) => soilAnalysisRepository.findById(id),
    update: async (id, data) => soilAnalysisRepository.update(id, data),
    delete: async (id) => soilAnalysisRepository.delete(id),
};

module.exports = soilAnalysisService;
