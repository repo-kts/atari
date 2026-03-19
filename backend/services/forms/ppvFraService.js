const ppvFraTrainingRepository = require('../../repositories/forms/ppvFraTrainingRepository');
const ppvFraPlantVarietiesRepository = require('../../repositories/forms/ppvFraPlantVarietiesRepository');

const ppvFraService = {
    // Training
    createTraining: async (data, user) => ppvFraTrainingRepository.create(data, user),
    findAllTrainings: async (filters, user) => ppvFraTrainingRepository.findAll(filters, user),
    findTrainingById: async (id, user) => {
        const record = await ppvFraTrainingRepository.findById(id, user);
        if (!record) throw new Error('Record not found');
        return record;
    },
    updateTraining: async (id, data, user) => ppvFraTrainingRepository.update(id, data, user),
    deleteTraining: async (id, user) => ppvFraTrainingRepository.delete(id, user),

    // Plant Varieties
    createPlantVariety: async (data, user) => ppvFraPlantVarietiesRepository.create(data, user),
    findAllPlantVarieties: async (filters, user) => ppvFraPlantVarietiesRepository.findAll(filters, user),
    findPlantVarietyById: async (id, user) => {
        const record = await ppvFraPlantVarietiesRepository.findById(id, user);
        if (!record) throw new Error('Record not found');
        return record;
    },
    updatePlantVariety: async (id, data, user) => ppvFraPlantVarietiesRepository.update(id, data, user),
    deletePlantVariety: async (id, user) => ppvFraPlantVarietiesRepository.delete(id, user),
};

module.exports = ppvFraService;
