const soilWaterRepository = require('../../repositories/forms/soilWaterRepository');

const soilWaterService = {
    // Equipment
    createEquipment: async (data, user) => {
        return await soilWaterRepository.createEquipment(data, user);
    },
    getAllEquipment: async (user) => {
        return await soilWaterRepository.findAllEquipment(user);
    },
    getEquipmentById: async (id, user) => {
        const equipment = await soilWaterRepository.findEquipmentById(id);
        if (!equipment) throw new Error('Equipment not found');
        if (user.kvkId && equipment.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return equipment;
    },
    updateEquipment: async (id, data, user) => {
        const existing = await soilWaterRepository.findEquipmentById(id);
        if (!existing) throw new Error('Equipment not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.updateEquipment(id, data, user);
    },
    deleteEquipment: async (id, user) => {
        const existing = await soilWaterRepository.findEquipmentById(id);
        if (!existing) throw new Error('Equipment not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.deleteEquipment(id, user);
    },

    // Analysis
    createAnalysis: async (data, user) => {
        return await soilWaterRepository.createAnalysis(data, user);
    },
    getAllAnalysis: async (user) => {
        return await soilWaterRepository.findAllAnalysis(user);
    },
    getAnalysisById: async (id, user) => {
        const analysis = await soilWaterRepository.findAnalysisById(id);
        if (!analysis) throw new Error('Analysis not found');
        if (user.kvkId && analysis.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return analysis;
    },
    updateAnalysis: async (id, data, user) => {
        const existing = await soilWaterRepository.findAnalysisById(id);
        if (!existing) throw new Error('Analysis not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.updateAnalysis(id, data, user);
    },
    deleteAnalysis: async (id, user) => {
        const existing = await soilWaterRepository.findAnalysisById(id);
        if (!existing) throw new Error('Analysis not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.deleteAnalysis(id, user);
    },

    // World Soil Day
    createWorldSoilDay: async (data, user) => {
        return await soilWaterRepository.createWorldSoilDay(data, user);
    },
    getAllWorldSoilDay: async (user) => {
        return await soilWaterRepository.findAllWorldSoilDay(user);
    },
    getWorldSoilDayById: async (id, user) => {
        const record = await soilWaterRepository.findWorldSoilDayById(id);
        if (!record) throw new Error('Record not found');
        if (user.kvkId && record.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return record;
    },
    updateWorldSoilDay: async (id, data, user) => {
        const existing = await soilWaterRepository.findWorldSoilDayById(id);
        if (!existing) throw new Error('Record not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.updateWorldSoilDay(id, data, user);
    },
    deleteWorldSoilDay: async (id, user) => {
        const existing = await soilWaterRepository.findWorldSoilDayById(id);
        if (!existing) throw new Error('Record not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        return await soilWaterRepository.deleteWorldSoilDay(id, user);
    },

    // Masters
    getAllAnalysisMasters: async () => {
        return await soilWaterRepository.findAllAnalysisMasters();
    }
};

module.exports = soilWaterService;
