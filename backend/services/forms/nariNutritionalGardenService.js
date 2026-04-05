const nariNutritionalGardenRepository = require('../../repositories/forms/nariNutritionalGardenRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

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
    }
};

module.exports = nariNutritionalGardenService;
