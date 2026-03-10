const prevalentDiseaseCropRepository = require('../../repositories/forms/prevalentDiseaseCropRepository');
const prevalentDiseaseLivestockRepository = require('../../repositories/forms/prevalentDiseaseLivestockRepository');

const prevalentDiseaseService = {
    // Crops
    cropCreate: async (data, user) => await prevalentDiseaseCropRepository.create(data, user),
    cropFindAll: async (filters, user) => await prevalentDiseaseCropRepository.findAll(filters, user),
    cropFindById: async (id, user) => await prevalentDiseaseCropRepository.findById(id, user),
    cropUpdate: async (id, data, user) => await prevalentDiseaseCropRepository.update(id, data, user),
    cropDelete: async (id, user) => await prevalentDiseaseCropRepository.delete(id, user),

    // Livestock
    livestockCreate: async (data, user) => await prevalentDiseaseLivestockRepository.create(data, user),
    livestockFindAll: async (filters, user) => await prevalentDiseaseLivestockRepository.findAll(filters, user),
    livestockFindById: async (id, user) => await prevalentDiseaseLivestockRepository.findById(id, user),
    livestockUpdate: async (id, data, user) => await prevalentDiseaseLivestockRepository.update(id, data, user),
    livestockDelete: async (id, user) => await prevalentDiseaseLivestockRepository.delete(id, user),
};

module.exports = prevalentDiseaseService;
