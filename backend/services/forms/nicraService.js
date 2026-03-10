const nicraBasicInfoRepository = require('../../repositories/forms/nicraBasicInfoRepository');
const nicraTrainingRepository = require('../../repositories/forms/nicraTrainingRepository');
const nicraExtensionActivityRepository = require('../../repositories/forms/nicraExtensionActivityRepository');
const nicraDetailsRepository = require('../../repositories/forms/nicraDetailsRepository');
const nicraMasterRepository = require('../../repositories/all-masters/nicraMasterRepository');

const nicraService = {
    // Basic Info
    getAllBasicInfo: async (filters, user) => await nicraBasicInfoRepository.findAll(filters, user),
    getBasicInfoById: async (id, user) => await nicraBasicInfoRepository.findById(id, user),
    createBasicInfo: async (data, user) => await nicraBasicInfoRepository.create(data, user),
    updateBasicInfo: async (id, data, user) => await nicraBasicInfoRepository.update(id, data, user),
    deleteBasicInfo: async (id, user) => await nicraBasicInfoRepository.delete(id, user),

    // Training
    getAllTraining: async (filters, user) => await nicraTrainingRepository.findAll(filters, user),
    getTrainingById: async (id, user) => await nicraTrainingRepository.findById(id, user),
    createTraining: async (data, user) => await nicraTrainingRepository.create(data, user),
    updateTraining: async (id, data, user) => await nicraTrainingRepository.update(id, data, user),
    deleteTraining: async (id, user) => await nicraTrainingRepository.delete(id, user),

    // Extension Activity
    getAllExtensionActivity: async (filters, user) => await nicraExtensionActivityRepository.findAll(filters, user),
    getExtensionActivityById: async (id, user) => await nicraExtensionActivityRepository.findById(id, user),
    createExtensionActivity: async (data, user) => await nicraExtensionActivityRepository.create(data, user),
    updateExtensionActivity: async (id, data, user) => await nicraExtensionActivityRepository.update(id, data, user),
    deleteExtensionActivity: async (id, user) => await nicraExtensionActivityRepository.delete(id, user),

    // Details
    getAllDetails: async (filters, user) => await nicraDetailsRepository.findAll(filters, user),
    getDetailsById: async (id, user) => await nicraDetailsRepository.findById(id, user),
    createDetails: async (data, user) => await nicraDetailsRepository.create(data, user),
    updateDetails: async (id, data, user) => await nicraDetailsRepository.update(id, data, user),
    deleteDetails: async (id, user) => await nicraDetailsRepository.delete(id, user),

    // Masters
    getCategories: async () => await nicraMasterRepository.getAllCategories(),
    getSubCategories: async (categoryId) => await nicraMasterRepository.getAllSubCategories(categoryId),
};

module.exports = nicraService;
