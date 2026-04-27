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
const { createAttachmentBinding, createAttachmentAwareCrud } = require('./formAttachmentBinding.js');

const detailsCrud = createAttachmentAwareCrud({
    repo: nicraDetailsRepository,
    binding: createAttachmentBinding({ formCode: 'nicra_details', primaryKey: 'nicraDetailsId' }),
});
const farmImplementCrud = createAttachmentAwareCrud({
    repo: nicraFarmImplementRepository,
    binding: createAttachmentBinding({ formCode: 'nicra_farm_implement', primaryKey: 'nicraFarmImplementId' }),
});
const vcrmcCrud = createAttachmentAwareCrud({
    repo: nicraVcrmcRepository,
    binding: createAttachmentBinding({ formCode: 'nicra_vcrmc', primaryKey: 'nicraVcrmcId' }),
});
const soilHealthCrud = createAttachmentAwareCrud({
    repo: nicraSoilHealthRepository,
    binding: createAttachmentBinding({ formCode: 'nicra_soil_health', primaryKey: 'nicraSoilHealthCardId' }),
});
const convergenceCrud = createAttachmentAwareCrud({
    repo: nicraConvergenceRepository,
    binding: createAttachmentBinding({ formCode: 'nicra_convergence', primaryKey: 'nicraConvergenceProgrammeId' }),
});
const dignitariesCrud = createAttachmentAwareCrud({
    repo: nicraDignitariesRepository,
    binding: createAttachmentBinding({ formCode: 'nicra_dignitaries', primaryKey: 'nicraDignitariesVisitedId' }),
});

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
    createExtensionActivity: async (data, user) => {
        const result = await nicraExtensionActivityRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraExtensionActivity', result?.kvkId || user?.kvkId);
        return result;
    },
    updateExtensionActivity: async (id, data, user) => {
        const existing = await nicraExtensionActivityRepository.findById(id, user);
        const result = await nicraExtensionActivityRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraExtensionActivity', existing?.kvkId || user?.kvkId);
        return result;
    },
    deleteExtensionActivity: async (id, user) => {
        const existing = await nicraExtensionActivityRepository.findById(id, user);
        const result = await nicraExtensionActivityRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nicraExtensionActivity', existing?.kvkId || user?.kvkId);
        return result;
    },

    // Details
    getAllDetails: detailsCrud.findAll,
    getDetailsById: detailsCrud.findById,
    createDetails: detailsCrud.create,
    updateDetails: detailsCrud.update,
    deleteDetails: detailsCrud.delete,

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
    getAllFarmImplement: farmImplementCrud.findAll,
    getFarmImplementById: farmImplementCrud.findById,
    createFarmImplement: farmImplementCrud.create,
    updateFarmImplement: farmImplementCrud.update,
    deleteFarmImplement: farmImplementCrud.delete,

    // VCRMC
    getAllVcrmc: vcrmcCrud.findAll,
    getVcrmcById: vcrmcCrud.findById,
    createVcrmc: vcrmcCrud.create,
    updateVcrmc: vcrmcCrud.update,
    deleteVcrmc: vcrmcCrud.delete,

    // Soil Health
    getAllSoilHealth: soilHealthCrud.findAll,
    getSoilHealthById: soilHealthCrud.findById,
    createSoilHealth: soilHealthCrud.create,
    updateSoilHealth: soilHealthCrud.update,
    deleteSoilHealth: soilHealthCrud.delete,

    // Convergence
    getAllConvergence: convergenceCrud.findAll,
    getConvergenceById: convergenceCrud.findById,
    createConvergence: convergenceCrud.create,
    updateConvergence: convergenceCrud.update,
    deleteConvergence: convergenceCrud.delete,

    // Dignitaries
    getAllDignitaries: dignitariesCrud.findAll,
    getDignitariesById: dignitariesCrud.findById,
    createDignitaries: dignitariesCrud.create,
    updateDignitaries: dignitariesCrud.update,
    deleteDignitaries: dignitariesCrud.delete,

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
