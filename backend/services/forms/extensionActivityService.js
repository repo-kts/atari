const extensionActivityRepository = require('../../repositories/forms/extensionActivityRepository.js');

const extensionActivityService = {
    /**
     * Create a new Extension Activity
     */
    createExtensionActivity: async (data, user) => {
        return await extensionActivityRepository.create(data, null, user);
    },

    /**
     * Get all Extension Activities
     */
    getAllExtensionActivities: async (filters = {}, user) => {
        const activities = await extensionActivityRepository.findAll(filters, user);

        return activities.map(activity => {
            const startDate = new Date(activity.startDate);
            const reportingYear = startDate.getFullYear();

            // Calculate total participants (using both naming conventions)
            const farmersSum =
                (activity.gen_m || activity.farmersGeneralM || 0) + (activity.gen_f || activity.farmersGeneralF || 0) +
                (activity.obc_m || activity.farmersObcM || 0) + (activity.obc_f || activity.farmersObcF || 0) +
                (activity.sc_m || activity.farmersScM || 0) + (activity.sc_f || activity.farmersScF || 0) +
                (activity.st_m || activity.farmersStM || 0) + (activity.st_f || activity.farmersStF || 0);

            const officialsSum =
                (activity.ext_gen_m || activity.officialsGeneralM || 0) + (activity.ext_gen_f || activity.officialsGeneralF || 0) +
                (activity.ext_obc_m || activity.officialsObcM || 0) + (activity.ext_obc_f || activity.officialsObcF || 0) +
                (activity.ext_sc_m || activity.officialsScM || 0) + (activity.ext_sc_f || activity.officialsScF || 0) +
                (activity.ext_st_m || activity.officialsStM || 0) + (activity.ext_st_f || activity.officialsStF || 0);

            return {
                ...activity,
                reportingYear,
                totalParticipants: farmersSum + officialsSum,
                // extensionActivityType is set by _mapRegularResponse; use it as the display name
                kvkName: activity.kvkName || (activity.kvk ? activity.kvk.kvkName : ''),
                activityName: activity.extensionActivityType || (activity.activity ? activity.activity.activityName : ''),
                staffName: activity.staffName || (activity.staff ? activity.staff.staffName : ''),
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
