const nicraBasicInfoRepository = require('../../repositories/forms/nicraBasicInfoRepository');
const nicraTrainingRepository = require('../../repositories/forms/nicraTrainingRepository');
const nicraExtensionActivityRepository = require('../../repositories/forms/nicraExtensionActivityRepository');
const nicraDetailsRepository = require('../../repositories/forms/nicraDetailsRepository');
const nicraInterventionRepository = require('../../repositories/forms/nicraInterventionRepository');
const nicraRevenueRepository = require('../../repositories/forms/nicraRevenueRepository');
const nicraFarmImplementRepository = require('../../repositories/forms/nicraFarmImplementRepository');
const nicraVcrmcRepository = require('../../repositories/forms/nicraVcrmcRepository');
const nicraSoilHealthRepository = require('../../repositories/forms/nicraSoilHealthRepository');
const nicraConvergenceRepository = require('../../repositories/forms/nicraConvergenceRepository');
const nicraDignitariesRepository = require('../../repositories/forms/nicraDignitariesRepository');
const nicraPiCopiRepository = require('../../repositories/forms/nicraPiCopiRepository');
const nicraMasterRepository = require('../../repositories/all-masters/nicraMasterRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const nicraService = {
    // Basic Info
    getAllBasicInfo: async (filters, user) => await nicraBasicInfoRepository.findAll(filters, user),
    getBasicInfoById: async (id, user) => await nicraBasicInfoRepository.findById(id, user),
    createBasicInfo: async (data, user) => {
        const result = await nicraBasicInfoRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraBasic', result?.kvkId || user?.kvkId);
        return result;
    },
    updateBasicInfo: async (id, data, user) => {
        const result = await nicraBasicInfoRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraBasic', result?.kvkId || user?.kvkId);
        return result;
    },
    deleteBasicInfo: async (id, user) => {
        const existing = await nicraBasicInfoRepository.findById(id, user);
        const result = await nicraBasicInfoRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraBasic', existing?.kvkId || user?.kvkId);
        return result;
    },

    // Training
    getAllTraining: async (filters, user) => await nicraTrainingRepository.findAll(filters, user),
    getTrainingById: async (id, user) => await nicraTrainingRepository.findById(id, user),
    createTraining: async (data, user) => {
        const result = await nicraTrainingRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraTraining', result?.kvkId || user?.kvkId);
        return result;
    },
    updateTraining: async (id, data, user) => {
        const existing = await nicraTrainingRepository.findById(id, user);
        const result = await nicraTrainingRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraTraining', existing?.kvkId || user?.kvkId);
        return result;
    },
    deleteTraining: async (id, user) => {
        const existing = await nicraTrainingRepository.findById(id, user);
        const result = await nicraTrainingRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraTraining', existing?.kvkId || user?.kvkId);
        return result;
    },

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

    // Intervention
    getAllIntervention: async (filters, user) => await nicraInterventionRepository.findAll(filters, user),
    getInterventionById: async (id, user) => await nicraInterventionRepository.findById(id, user),
    createIntervention: async (data, user) => {
        const result = await nicraInterventionRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraIntervention', result?.kvkId || user?.kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicra', result?.kvkId || user?.kvkId);
        return result;
    },
    updateIntervention: async (id, data, user) => {
        const result = await nicraInterventionRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraIntervention', result?.kvkId || user?.kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicra', result?.kvkId || user?.kvkId);
        return result;
    },
    deleteIntervention: async (id, user) => {
        const existing = await nicraInterventionRepository.findById(id, user);
        const result = await nicraInterventionRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraIntervention', existing?.kvkId || user?.kvkId);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicra', existing?.kvkId || user?.kvkId);
        return result;
    },

    // Revenue
    getAllRevenue: async (filters, user) => await nicraRevenueRepository.findAll(filters, user),
    getRevenueById: async (id, user) => await nicraRevenueRepository.findById(id, user),
    createRevenue: async (data, user) => await nicraRevenueRepository.create(data, user),
    updateRevenue: async (id, data, user) => await nicraRevenueRepository.update(id, data, user),
    deleteRevenue: async (id, user) => await nicraRevenueRepository.delete(id, user),

    // Farm Implement (Custom Hiring)
    getAllFarmImplement: async (filters, user) => await nicraFarmImplementRepository.findAll(filters, user),
    getFarmImplementById: async (id, user) => await nicraFarmImplementRepository.findById(id, user),
    createFarmImplement: async (data, user) => await nicraFarmImplementRepository.create(data, user),
    updateFarmImplement: async (id, data, user) => await nicraFarmImplementRepository.update(id, data, user),
    deleteFarmImplement: async (id, user) => await nicraFarmImplementRepository.delete(id, user),

    // VCRMC
    getAllVcrmc: async (filters, user) => await nicraVcrmcRepository.findAll(filters, user),
    getVcrmcById: async (id, user) => await nicraVcrmcRepository.findById(id, user),
    createVcrmc: async (data, user) => await nicraVcrmcRepository.create(data, user),
    updateVcrmc: async (id, data, user) => await nicraVcrmcRepository.update(id, data, user),
    deleteVcrmc: async (id, user) => await nicraVcrmcRepository.delete(id, user),

    // Soil Health
    getAllSoilHealth: async (filters, user) => await nicraSoilHealthRepository.findAll(filters, user),
    getSoilHealthById: async (id, user) => await nicraSoilHealthRepository.findById(id, user),
    createSoilHealth: async (data, user) => await nicraSoilHealthRepository.create(data, user),
    updateSoilHealth: async (id, data, user) => await nicraSoilHealthRepository.update(id, data, user),
    deleteSoilHealth: async (id, user) => await nicraSoilHealthRepository.delete(id, user),

    // Convergence
    getAllConvergence: async (filters, user) => await nicraConvergenceRepository.findAll(filters, user),
    getConvergenceById: async (id, user) => await nicraConvergenceRepository.findById(id, user),
    createConvergence: async (data, user) => await nicraConvergenceRepository.create(data, user),
    updateConvergence: async (id, data, user) => await nicraConvergenceRepository.update(id, data, user),
    deleteConvergence: async (id, user) => await nicraConvergenceRepository.delete(id, user),

    // Dignitaries
    getAllDignitaries: async (filters, user) => await nicraDignitariesRepository.findAll(filters, user),
    getDignitariesById: async (id, user) => await nicraDignitariesRepository.findById(id, user),
    createDignitaries: async (data, user) => await nicraDignitariesRepository.create(data, user),
    updateDignitaries: async (id, data, user) => await nicraDignitariesRepository.update(id, data, user),
    deleteDignitaries: async (id, user) => await nicraDignitariesRepository.delete(id, user),

    // PI CO-PI
    getAllPiCopi: async (filters, user) => await nicraPiCopiRepository.findAll(filters, user),
    getPiCopiById: async (id, user) => await nicraPiCopiRepository.findById(id, user),
    createPiCopi: async (data, user) => await nicraPiCopiRepository.create(data, user),
    updatePiCopi: async (id, data, user) => await nicraPiCopiRepository.update(id, data, user),
    deletePiCopi: async (id, user) => await nicraPiCopiRepository.delete(id, user),

    // Masters
    getCategories: async () => await nicraMasterRepository.getAllCategories(),
    getSubCategories: async (categoryId) => await nicraMasterRepository.getAllSubCategories(categoryId),
};

module.exports = nicraService;
