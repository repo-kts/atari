const soilWaterRepository = require('../../repositories/forms/soilWaterRepository');

const soilWaterService = {
    // Equipment
    createEquipment: async (data, user) => {
        return await soilWaterRepository.createEquipment(data, user);
    },
    getAllEquipment: async (user) => {
        return await soilWaterRepository.findAllEquipment(user);
    },
    updateEquipment: async (id, data, user) => {
        const existing = await soilWaterRepository.findEquipmentById(id);
        if (!existing) throw new Error('Equipment not found');
        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.updateEquipment(id, data);
    },
    deleteEquipment: async (id, user) => {
        const existing = await soilWaterRepository.findEquipmentById(id);
        if (!existing) throw new Error('Equipment not found');
        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.deleteEquipment(id);
    },

    // Analysis
    createAnalysis: async (data, user) => {
        return await soilWaterRepository.createAnalysis(data, user);
    },
    getAllAnalysis: async (user) => {
        return await soilWaterRepository.findAllAnalysis(user);
    },
    updateAnalysis: async (id, data, user) => {
        const existing = await soilWaterRepository.findAnalysisById(id);
        if (!existing) throw new Error('Analysis not found');
        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.updateAnalysis(id, data);
    },
    deleteAnalysis: async (id, user) => {
        const existing = await soilWaterRepository.findAnalysisById(id);
        if (!existing) throw new Error('Analysis not found');
        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.deleteAnalysis(id);
    },

    // World Soil Day
    createWorldSoilDay: async (data, user) => {
        return await soilWaterRepository.createWorldSoilDay(data, user);
    },
    getAllWorldSoilDay: async (user) => {
        return await soilWaterRepository.findAllWorldSoilDay(user);
    },
    updateWorldSoilDay: async (id, data, user) => {
        const existing = await soilWaterRepository.findWorldSoilDayById(id);
        if (!existing) throw new Error('Record not found');
        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.updateWorldSoilDay(id, data);
    },
    deleteWorldSoilDay: async (id, user) => {
        const existing = await soilWaterRepository.findWorldSoilDayById(id);
        if (!existing) throw new Error('Record not found');
        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.deleteWorldSoilDay(id);
    },

    // Masters
    getAllAnalysisMasters: async () => {
        return await soilWaterRepository.findAllAnalysisMasters();
    }
};

module.exports = soilWaterService;
