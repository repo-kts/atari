const kvkAwardRepository = require('../../repositories/forms/kvkAwardRepository');

const kvkAwardService = {
    /**
     * Create a new KVK Award
     */
    createKvkAward: async (data, user) => {
        // Basic validation
        if (!data.awardName || !data.amount || !data.achievement || !data.conferringAuthority) {
            throw new Error('All fields are required');
        }

        // Ensure the KVK ID is correct (from user context if KVK login)
        const awardData = {
            kvkId: parseInt(user.kvkId || data.kvkId),
            awardName: data.awardName,
            year: data.year,
            reportingYear: data.reportingYear || data.year,
            amount: parseInt(data.amount),
            achievement: data.achievement,
            conferringAuthority: data.conferringAuthority,
        };

        return await kvkAwardRepository.create(awardData, user);
    },

    /**
     * Get all KVK Awards (filtered by KVK if user is KVK role)
     */
    getAllKvkAwards: async (user) => {
        return await kvkAwardRepository.findAll(user);
    },

    /**
     * Get KVK Award by ID
     */
    getKvkAwardById: async (id, user) => {
        const award = await kvkAwardRepository.findById(id);
        if (!award) throw new Error('Award not found');

        // Authorization check
        if (['kvk_admin', 'kvk_user'].includes(user.role) && Number(award.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized access');
        }

        return award;
    },

    /**
     * Update KVK Award
     */
    updateKvkAward: async (id, data, user) => {
        const existing = await kvkAwardRepository.findById(id);
        if (!existing) throw new Error('Award not found');

        // Authorization check
        if (['kvk_admin', 'kvk_user'].includes(user.role) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        const updateData = {};
        if (data.awardName) updateData.awardName = data.awardName;
        if (data.year) updateData.year = data.year;
        if (data.reportingYear || data.year) updateData.reportingYear = data.reportingYear || data.year;
        if (data.amount) updateData.amount = parseInt(data.amount);
        if (data.achievement) updateData.achievement = data.achievement;
        if (data.conferringAuthority) updateData.conferringAuthority = data.conferringAuthority;

        return await kvkAwardRepository.update(id, updateData);
    },

    /**
     * Delete KVK Award
     */
    deleteKvkAward: async (id, user) => {
        const existing = await kvkAwardRepository.findById(id);
        if (!existing) throw new Error('Award not found');

        // Authorization check
        if (['kvk_admin', 'kvk_user'].includes(user.role) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        return await kvkAwardRepository.delete(id);
    },
};

module.exports = kvkAwardService;
