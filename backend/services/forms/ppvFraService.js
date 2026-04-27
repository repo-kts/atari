const ppvFraTrainingRepository = require('../../repositories/forms/ppvFraTrainingRepository');
const ppvFraPlantVarietiesRepository = require('../../repositories/forms/ppvFraPlantVarietiesRepository');
const { createAttachmentBinding, createAttachmentAwareCrud } = require('./formAttachmentBinding.js');

const plantVarietyCrud = createAttachmentAwareCrud({
    repo: ppvFraPlantVarietiesRepository,
    binding: createAttachmentBinding({
        formCode: 'ppv_fra',
        primaryKey: 'ppvFraPlantVarietiesID',
    }),
});

const ppvFraService = {
    // Training (no attachments today)
    createTraining: async (data, user) => ppvFraTrainingRepository.create(data, user),
    findAllTrainings: async (filters, user) => ppvFraTrainingRepository.findAll(filters, user),
    findTrainingById: async (id, user) => {
        const record = await ppvFraTrainingRepository.findById(id, user);
        if (!record) throw new Error('Record not found');
        return record;
    },
    updateTraining: async (id, data, user) => ppvFraTrainingRepository.update(id, data, user),
    deleteTraining: async (id, user) => ppvFraTrainingRepository.delete(id, user),

    // Plant Varieties — uses FormAttachment for photos
    createPlantVariety: plantVarietyCrud.create,
    findAllPlantVarieties: plantVarietyCrud.findAll,
    findPlantVarietyById: async (id, user) => {
        const record = await plantVarietyCrud.findById(id, user);
        if (!record) throw new Error('Record not found');
        return record;
    },
    updatePlantVariety: plantVarietyCrud.update,
    deletePlantVariety: plantVarietyCrud.delete,
};

module.exports = ppvFraService;
