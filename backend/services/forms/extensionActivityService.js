const extensionActivityRepository = require('../../repositories/forms/extensionActivityRepository.js');

const extensionActivityService = {
    /**
     * Create a new Extension Activity
     */
    createExtensionActivity: async (data) => {
        // Validation can be added here
        return await extensionActivityRepository.create(data);
    },

    /**
     * Get all Extension Activities
     */
    getAllExtensionActivities: async (filters = {}) => {
        const activities = await extensionActivityRepository.findAll(filters);

        // Transform the data to include Reporting Year and Participant Sum for the frontend
        return activities.map(activity => {
            const startDate = new Date(activity.startDate);
            const reportingYear = startDate.getFullYear();

            // Calculate total participants
            const farmersSum =
                (activity.farmersGeneralM || 0) + (activity.farmersGeneralF || 0) +
                (activity.farmersObcM || 0) + (activity.farmersObcF || 0) +
                (activity.farmersScM || 0) + (activity.farmersScF || 0) +
                (activity.farmersStM || 0) + (activity.farmersStF || 0);

            const officialsSum =
                (activity.officialsGeneralM || 0) + (activity.officialsGeneralF || 0) +
                (activity.officialsObcM || 0) + (activity.officialsObcF || 0) +
                (activity.officialsScM || 0) + (activity.officialsScF || 0) +
                (activity.officialsStM || 0) + (activity.officialsStF || 0);

            return {
                ...activity,
                reportingYear: reportingYear,
                totalParticipants: farmersSum + officialsSum,
                kvkName: activity.kvk ? activity.kvk.kvkName : 'N/A',
                activityName: activity.activity ? activity.activity.activityName : 'N/A',
                staffName: activity.staff ? activity.staff.staffName : 'N/A'
            };
        });
    },

    /**
     * Get Extension Activity by ID
     */
    getExtensionActivityById: async (id) => {
        return await extensionActivityRepository.findById(id);
    },

    /**
     * Update Extension Activity
     */
    updateExtensionActivity: async (id, data) => {
        return await extensionActivityRepository.update(id, data);
    },

    /**
     * Delete Extension Activity
     */
    deleteExtensionActivity: async (id) => {
        return await extensionActivityRepository.delete(id);
    },
};

module.exports = extensionActivityService;
