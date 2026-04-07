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

const naturalFarmingService = {
    // Geographical Info
    getAllGeo: (filters, user) => geographicalInfoRepository.findAll(filters, user),
    getGeoById: (id, user) => geographicalInfoRepository.findById(id, user),
    createGeo: (data, user) => geographicalInfoRepository.create(data, user),
    updateGeo: (id, data, user) => geographicalInfoRepository.update(id, data, user),
    deleteGeo: (id, user) => geographicalInfoRepository.delete(id, user),

    // Physical Info
    getAllPhysical: (filters, user) => physicalInfoRepository.findAll(filters, user),
    getPhysicalById: (id, user) => physicalInfoRepository.findById(id, user),
    createPhysical: (data, user) => physicalInfoRepository.create(data, user),
    updatePhysical: (id, data, user) => physicalInfoRepository.update(id, data, user),
    deletePhysical: (id, user) => physicalInfoRepository.delete(id, user),

    // Demonstration Info
    getAllDemo: (filters, user) => demonstrationInfoRepository.findAll(filters, user),
    getDemoById: (id, user) => demonstrationInfoRepository.findById(id, user),
    createDemo: async (data, user) => {
        const result = await demonstrationInfoRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingDemonstration', result?.kvkId || user?.kvkId);
        return result;
    },
    updateDemo: async (id, data, user) => {
        const result = await demonstrationInfoRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingDemonstration', result?.kvkId || user?.kvkId);
        return result;
    },
    deleteDemo: async (id, user) => {
        const existing = await demonstrationInfoRepository.findById(id, user);
        const result = await demonstrationInfoRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingDemonstration', existing?.kvkId || user?.kvkId);
        return result;
    },

    // Farmers already practicing Natural Farming
    getAllFarmersPracticing: (filters, user) => farmersPracticingRepository.findAll(filters, user),
    getFarmersPracticingById: (id, user) => farmersPracticingRepository.findById(id, user),
    createFarmersPracticing: async (data, user) => {
        const result = await farmersPracticingRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingFarmersPracticing', result?.kvkId || user?.kvkId);
        return result;
    },
    updateFarmersPracticing: async (id, data, user) => {
        const result = await farmersPracticingRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingFarmersPracticing', result?.kvkId || user?.kvkId);
        return result;
    },
    deleteFarmersPracticing: async (id, user) => {
        const existing = await farmersPracticingRepository.findById(id, user);
        await farmersPracticingRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingFarmersPracticing', existing?.kvkId || user?.kvkId);
    },

    // Beneficiaries
    getAllBeneficiaries: (filters, user) => beneficiariesRepository.findAll(filters, user),
    getBeneficiariesById: (id, user) => beneficiariesRepository.findById(id, user),
    createBeneficiaries: (data, user) => beneficiariesRepository.create(data, user),
    updateBeneficiaries: (id, data, user) => beneficiariesRepository.update(id, data, user),
    deleteBeneficiaries: (id, user) => beneficiariesRepository.delete(id, user),

    // Soil Data
    getAllSoil: (filters, user) => soilDataRepository.findAll(filters, user),
    getSoilById: (id, user) => soilDataRepository.findById(id, user),
    createSoil: async (data, user) => {
        const result = await soilDataRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingSoilData', result?.kvkId || user?.kvkId);
        return result;
    },
    updateSoil: async (id, data, user) => {
        const result = await soilDataRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingSoilData', result?.kvkId || user?.kvkId);
        return result;
    },
    deleteSoil: async (id, user) => {
        const existing = await soilDataRepository.findById(id, user);
        const result = await soilDataRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingSoilData', existing?.kvkId || user?.kvkId);
        return result;
    },

    // Financial Info (Budget)
    getAllFinancial: (filters, user) => financialInfoRepository.findAll(filters, user),
    getFinancialById: (id, user) => financialInfoRepository.findById(id, user),
    createFinancial: async (data, user) => {
        const result = await financialInfoRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingBudgetExpenditure', result?.kvkId || user?.kvkId);
        return result;
    },
    updateFinancial: async (id, data, user) => {
        const result = await financialInfoRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingBudgetExpenditure', result?.kvkId || user?.kvkId);
        return result;
    },
    deleteFinancial: async (id, user) => {
        const existing = await financialInfoRepository.findById(id, user);
        const result = await financialInfoRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('naturalFarmingBudgetExpenditure', existing?.kvkId || user?.kvkId);
        return result;
    },
};

module.exports = naturalFarmingService;
