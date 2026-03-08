const trainingRepository = require('../../repositories/forms/trainingRepository.js');

/**
 * Training Service
 * Business logic layer for Training Achievement forms
 * Follows the same pattern as extensionActivityService for consistency
 */

const trainingService = {
    /**
     * Create a new Training Achievement
     */
    createTraining: async (data, user) => {
        return await trainingRepository.create(data, null, user);
    },

    /**
     * Get all Training Achievements
     */
    getAllTrainings: async (filters = {}, user) => {
        const trainings = await trainingRepository.findAll(filters, user);

        return trainings.map(training => {
            let reportingYear = null;
            if (training.startDate && !isNaN(Date.parse(training.startDate))) {
                const startDate = new Date(training.startDate);
                const month = startDate.getMonth() + 1;
                const startYear = month >= 4 ? startDate.getFullYear() : startDate.getFullYear() - 1;
                reportingYear = String(startYear);
            }

            // Calculate total participants
            const totalParticipants =
                (training.gen_m ?? training.generalM ?? 0) + (training.gen_f ?? training.generalF ?? 0) +
                (training.obc_m ?? training.obcM ?? 0) + (training.obc_f ?? training.obcF ?? 0) +
                (training.sc_m ?? training.scM ?? 0) + (training.sc_f ?? training.scF ?? 0) +
                (training.st_m ?? training.stM ?? 0) + (training.st_f ?? training.stF ?? 0);

            return {
                ...training,
                reportingYear,
                totalParticipants,
                // Ensure display names are available
                kvkName: training.kvkName || (training.kvk ? training.kvk.kvkName : ''),
                clientele: training.clientele || (training.clientele ? training.clientele.name : ''),
                trainingType: training.trainingType || (training.trainingType ? training.trainingType.name : ''),
                trainingArea: training.trainingArea || (training.trainingArea ? training.trainingArea.name : ''),
                thematicArea: training.thematicArea || (training.thematicArea ? training.thematicArea.name : ''),
                coordinator: training.coordinator || (training.coordinator ? training.coordinator.name : ''),
                fundingSource: training.fundingSource || (training.fundingSource ? training.fundingSource.name : ''),
            };
        });
    },

    /**
     * Get Training Achievement by ID
     */
    getTrainingById: async (id, user) => {
        return await trainingRepository.findById(id, user);
    },

    /**
     * Update Training Achievement
     */
    updateTraining: async (id, data, user) => {
        return await trainingRepository.update(id, data, user);
    },

    /**
     * Delete Training Achievement
     */
    deleteTraining: async (id, user) => {
        return await trainingRepository.delete(id, user);
    },
};

module.exports = trainingService;
