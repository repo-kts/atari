const {
    geographicalInfoRepository,
    physicalInfoRepository,
    demonstrationInfoRepository,
    beneficiariesRepository,
    soilDataRepository,
    financialInfoRepository,
} = require('../../repositories/forms/naturalFarmingRepository');
const { farmersPracticingRepository } = require('../../repositories/forms/farmersPracticingRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');
const { createAttachmentBinding, createAttachmentAwareCrud } = require('./formAttachmentBinding.js');

const invalidate = (dataSource) => async (record, user) =>
    reportCacheInvalidationService.invalidateDataSourceForKvk(
        dataSource,
        record?.kvkId || user?.kvkId,
    );

const physicalCrud = createAttachmentAwareCrud({
    repo: physicalInfoRepository,
    binding: createAttachmentBinding({ formCode: 'natural_farming_physical', primaryKey: 'physicalInfoId' }),
});

const demoCrud = createAttachmentAwareCrud({
    repo: demonstrationInfoRepository,
    binding: createAttachmentBinding({ formCode: 'natural_farming_demo', primaryKey: 'demonstrationInfoId' }),
    onWrite: invalidate('naturalFarmingDemonstration'),
});

// Farmers Practicing has no attachments — pass through to the repo directly.
const farmersPracticingCrud = {
    findAll: (filters, user) => farmersPracticingRepository.findAll(filters, user),
    findById: (id, user) => farmersPracticingRepository.findById(id, user),
    create: async (data, user) => {
        const result = await farmersPracticingRepository.create(data, user);
        await invalidate('naturalFarmingFarmersPracticing')(result, user);
        return result;
    },
    update: async (id, data, user) => {
        const result = await farmersPracticingRepository.update(id, data, user);
        await invalidate('naturalFarmingFarmersPracticing')(result, user);
        return result;
    },
    delete: async (id, user) => {
        const existing = await farmersPracticingRepository.findById(id, user);
        const result = await farmersPracticingRepository.delete(id, user);
        await invalidate('naturalFarmingFarmersPracticing')(existing, user);
        return result;
    },
};

const naturalFarmingService = {
    // Geographical Info (no attachments)
    getAllGeo: (filters, user) => geographicalInfoRepository.findAll(filters, user),
    getGeoById: (id, user) => geographicalInfoRepository.findById(id, user),
    createGeo: (data, user) => geographicalInfoRepository.create(data, user),
    updateGeo: (id, data, user) => geographicalInfoRepository.update(id, data, user),
    deleteGeo: (id, user) => geographicalInfoRepository.delete(id, user),

    // Physical Info — uses FormAttachment for photos
    getAllPhysical: physicalCrud.findAll,
    getPhysicalById: physicalCrud.findById,
    createPhysical: physicalCrud.create,
    updatePhysical: physicalCrud.update,
    deletePhysical: physicalCrud.delete,

    // Demonstration Info — uses FormAttachment for photos
    getAllDemo: demoCrud.findAll,
    getDemoById: demoCrud.findById,
    createDemo: demoCrud.create,
    updateDemo: demoCrud.update,
    deleteDemo: demoCrud.delete,

    // Farmers Practicing Natural Farming — uses FormAttachment for photos (UUID PK)
    getAllFarmersPracticing: farmersPracticingCrud.findAll,
    getFarmersPracticingById: farmersPracticingCrud.findById,
    createFarmersPracticing: farmersPracticingCrud.create,
    updateFarmersPracticing: farmersPracticingCrud.update,
    deleteFarmersPracticing: farmersPracticingCrud.delete,

    // Beneficiaries (no attachments)
    getAllBeneficiaries: (filters, user) => beneficiariesRepository.findAll(filters, user),
    getBeneficiariesById: (id, user) => beneficiariesRepository.findById(id, user),
    createBeneficiaries: (data, user) => beneficiariesRepository.create(data, user),
    updateBeneficiaries: (id, data, user) => beneficiariesRepository.update(id, data, user),
    deleteBeneficiaries: (id, user) => beneficiariesRepository.delete(id, user),

    // Soil Data (no attachments)
    getAllSoil: (filters, user) => soilDataRepository.findAll(filters, user),
    getSoilById: (id, user) => soilDataRepository.findById(id, user),
    createSoil: async (data, user) => {
        const result = await soilDataRepository.create(data, user);
        await invalidate('naturalFarmingSoilData')(result, user);
        return result;
    },
    updateSoil: async (id, data, user) => {
        const result = await soilDataRepository.update(id, data, user);
        await invalidate('naturalFarmingSoilData')(result, user);
        return result;
    },
    deleteSoil: async (id, user) => {
        const existing = await soilDataRepository.findById(id, user);
        const result = await soilDataRepository.delete(id, user);
        await invalidate('naturalFarmingSoilData')(existing, user);
        return result;
    },

    // Financial Info (Budget) (no attachments)
    getAllFinancial: (filters, user) => financialInfoRepository.findAll(filters, user),
    getFinancialById: (id, user) => financialInfoRepository.findById(id, user),
    createFinancial: async (data, user) => {
        const result = await financialInfoRepository.create(data, user);
        await invalidate('naturalFarmingBudgetExpenditure')(result, user);
        return result;
    },
    updateFinancial: async (id, data, user) => {
        const result = await financialInfoRepository.update(id, data, user);
        await invalidate('naturalFarmingBudgetExpenditure')(result, user);
        return result;
    },
    deleteFinancial: async (id, user) => {
        const existing = await financialInfoRepository.findById(id, user);
        const result = await financialInfoRepository.delete(id, user);
        await invalidate('naturalFarmingBudgetExpenditure')(existing, user);
        return result;
    },
};

module.exports = naturalFarmingService;
