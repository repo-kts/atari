const scientistAwardRepository = require('../../repositories/forms/scientistAwardRepository');

const scientistAwardService = {
    /**
     * Create a new Scientist Award
     */
    createScientistAward: async (data, user) => {
        if (!data.awardName || !data.scientistName || !data.year || !data.amount || !data.achievement || !data.conferringAuthority) {
            throw new Error('All fields are required');
        }

        const awardData = {
            kvkId: parseInt(user.kvkId || data.kvkId),
            awardName: data.awardName,
            scientistName: data.scientistName,
            year: data.year,
            amount: parseInt(data.amount),
            achievement: data.achievement,
            conferringAuthority: data.conferringAuthority,
        };

        return await scientistAwardRepository.create(awardData, user);
    },

    /**
     * Get all Scientist Awards
     */
    getAllScientistAwards: async (user) => {
        return await scientistAwardRepository.findAll(user);
    },

    /**
     * Get Scientist Award by ID
     */
    getScientistAwardById: async (id, user) => {
        const award = await scientistAwardRepository.findById(id);
        if (!award) throw new Error('Award not found');

        if (['kvk_admin', 'kvk_user'].includes(user.role) && Number(award.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized access');
        }

        return award;
    },

    /**
     * Update Scientist Award
     */
    updateScientistAward: async (id, data, user) => {
        const existing = await scientistAwardRepository.findById(id);
        if (!existing) throw new Error('Award not found');

        if (['kvk_admin', 'kvk_user'].includes(user.role) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        const updateData = {};
        if (data.awardName !== undefined) updateData.awardName = data.awardName;
        if (data.scientistName !== undefined) updateData.scientistName = data.scientistName;
        if (data.year !== undefined) updateData.year = data.year;
        if (data.amount !== undefined) updateData.amount = parseInt(data.amount);
        if (data.achievement !== undefined) updateData.achievement = data.achievement;
        if (data.conferringAuthority !== undefined) updateData.conferringAuthority = data.conferringAuthority;

        return await scientistAwardRepository.update(id, updateData);
    },

    /**
     * Delete Scientist Award
     */
    deleteScientistAward: async (id, user) => {
        const existing = await scientistAwardRepository.findById(id);
        if (!existing) throw new Error('Award not found');

        if (['kvk_admin', 'kvk_user'].includes(user.role) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        return await scientistAwardRepository.delete(id);
    },
};

module.exports = scientistAwardService;
