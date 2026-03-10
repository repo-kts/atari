const {
    geographicalInfoRepository,
    physicalInfoRepository,
    demonstrationInfoRepository,
    beneficiariesRepository,
    soilDataRepository,
    financialInfoRepository,
} = require('../../repositories/forms/naturalFarmingRepository');

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
    createDemo: (data, user) => demonstrationInfoRepository.create(data, user),
    updateDemo: (id, data, user) => demonstrationInfoRepository.update(id, data, user),
    deleteDemo: (id, user) => demonstrationInfoRepository.delete(id, user),

    // Beneficiaries
    getAllBeneficiaries: (filters, user) => beneficiariesRepository.findAll(filters, user),
    getBeneficiariesById: (id, user) => beneficiariesRepository.findById(id, user),
    createBeneficiaries: (data, user) => beneficiariesRepository.create(data, user),
    updateBeneficiaries: (id, data, user) => beneficiariesRepository.update(id, data, user),
    deleteBeneficiaries: (id, user) => beneficiariesRepository.delete(id, user),

    // Soil Data
    getAllSoil: (filters, user) => soilDataRepository.findAll(filters, user),
    getSoilById: (id, user) => soilDataRepository.findById(id, user),
    createSoil: (data, user) => soilDataRepository.create(data, user),
    updateSoil: (id, data, user) => soilDataRepository.update(id, data, user),
    deleteSoil: (id, user) => soilDataRepository.delete(id, user),

    // Financial Info (Budget)
    getAllFinancial: (filters, user) => financialInfoRepository.findAll(filters, user),
    getFinancialById: (id, user) => financialInfoRepository.findById(id, user),
    createFinancial: (data, user) => financialInfoRepository.create(data, user),
    updateFinancial: (id, data, user) => financialInfoRepository.update(id, data, user),
    deleteFinancial: (id, user) => financialInfoRepository.delete(id, user),
};

module.exports = naturalFarmingService;
