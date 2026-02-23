const soilEquipmentRepository = require('../../repositories/forms/soilEquipmentRepository.js');

const soilEquipmentService = {
    create: async (data, user) => soilEquipmentRepository.create(data, user),
    getAll: async (user) => soilEquipmentRepository.findAll(user),
    getById: async (id) => soilEquipmentRepository.findById(id),
    update: async (id, data) => soilEquipmentRepository.update(id, data),
    delete: async (id) => soilEquipmentRepository.delete(id),
    getAllAnalysisTypes: async () => soilEquipmentRepository.getAllAnalysisTypes(),
};

module.exports = soilEquipmentService;
