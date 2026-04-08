const soilWaterRepository = require('../../repositories/forms/soilWaterRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const soilWaterService = {
    // Equipment
    createEquipment: async (data, user) => {
        const result = await soilWaterRepository.createEquipment(data, user);
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId, 10) : (data.kvkId ? parseInt(data.kvkId, 10) : null);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('soilWaterEquipmentReport', kvkId);
        return result;
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
        const result = await soilWaterRepository.updateEquipment(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('soilWaterEquipmentReport', existing.kvkId);
        return result;
    },
    deleteEquipment: async (id, user) => {
        const existing = await soilWaterRepository.findEquipmentById(id);
        if (!existing) throw new Error('Equipment not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        const result = await soilWaterRepository.deleteEquipment(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('soilWaterEquipmentReport', existing.kvkId);
        return result;
    },

    // Analysis
    createAnalysis: async (data, user) => {
        const result = await soilWaterRepository.createAnalysis(data, user);
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId, 10) : (data.kvkId ? parseInt(data.kvkId, 10) : null);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('soilWaterAnalysisReport', kvkId);
        return result;
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
        const result = await soilWaterRepository.updateAnalysis(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('soilWaterAnalysisReport', existing.kvkId);
        return result;
    },
    deleteAnalysis: async (id, user) => {
        const existing = await soilWaterRepository.findAnalysisById(id);
        if (!existing) throw new Error('Analysis not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        const result = await soilWaterRepository.deleteAnalysis(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('soilWaterAnalysisReport', existing.kvkId);
        return result;
    },

    // World Soil Day
    createWorldSoilDay: async (data, user) => {
        const result = await soilWaterRepository.createWorldSoilDay(data, user);
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId, 10) : (data.kvkId ? parseInt(data.kvkId, 10) : null);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('worldSoilDayReport', kvkId);
        return result;
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
        const result = await soilWaterRepository.updateWorldSoilDay(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('worldSoilDayReport', existing.kvkId);
        return result;
    },
    deleteWorldSoilDay: async (id, user) => {
        const existing = await soilWaterRepository.findWorldSoilDayById(id);
        if (!existing) throw new Error('Record not found');
        if (user.kvkId && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }
        const result = await soilWaterRepository.deleteWorldSoilDay(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('worldSoilDayReport', existing.kvkId);
        return result;
    },

    // Masters
    getAllAnalysisMasters: async () => {
        return await soilWaterRepository.findAllAnalysisMasters();
    }
};

module.exports = soilWaterService;
