const prisma = require('../../config/prisma.js');
const nariNutritionalGardenRepository = require('../../repositories/forms/nariNutritionalGardenRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

async function invalidateReportCacheForGardenId(gardenId) {
    const id = parseInt(String(gardenId), 10);
    if (!Number.isFinite(id)) return;
    const garden = await prisma.nariNutritionalGarden.findUnique({
        where: { nariNutritionalGardenId: id },
        select: { kvkId: true },
    });
    if (garden?.kvkId != null) {
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariNutritionGarden', garden.kvkId);
    }
}

const nariNutritionalGardenService = {
    create: async (data, user) => {
        const result = await nariNutritionalGardenRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariNutritionGarden', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await nariNutritionalGardenRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariNutritionalGardenRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        const existing = await nariNutritionalGardenRepository.findById(id, user);
        const result = await nariNutritionalGardenRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariNutritionGarden', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await nariNutritionalGardenRepository.findById(id, user);
        const result = await nariNutritionalGardenRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariNutritionGarden', existing?.kvkId || user?.kvkId);
        return result;
    },

    getResultById: async (id) => {
        return await nariNutritionalGardenRepository.getResultById(id);
    },

    createResult: async (id, data) => {
        const result = await nariNutritionalGardenRepository.createResult(id, data);
        await invalidateReportCacheForGardenId(id);
        return result;
    },

    updateResult: async (id, data) => {
        const result = await nariNutritionalGardenRepository.updateResult(id, data);
        await invalidateReportCacheForGardenId(id);
        return result;
    },
};

module.exports = nariNutritionalGardenService;
