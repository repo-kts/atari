const farmerAwardRepository = require('../../repositories/forms/farmerAwardRepository');

const farmerAwardService = {
    /**
     * Create a new Farmer Award
     */
    createFarmerAward: async (data, user) => {
        if (!data.awardName || !data.farmerName || !data.year || !data.amount || !data.achievement || !data.conferringAuthority) {
            throw new Error('All required fields must be filled');
        }

        const awardData = {
            kvkId: parseInt(user.kvkId || data.kvkId),
            awardName: data.awardName,
            farmerName: data.farmerName,
            contactNumber: (data.contactNumber || data.contactNo || '').toString(),
            address: data.address,
            year: data.year,
            amount: parseInt(data.amount),
            achievement: data.achievement,
            conferringAuthority: data.conferringAuthority,
            image: (typeof data.image === 'string') ? data.image : null
        };

        return await farmerAwardRepository.create(awardData, user);
    },

    /**
     * Get all Farmer Awards
     */
    getAllFarmerAwards: async (user) => {
        return await farmerAwardRepository.findAll(user);
    },

    /**
     * Get Farmer Award by ID
     */
    getFarmerAwardById: async (id, user) => {
        const award = await farmerAwardRepository.findById(id);
        if (!award) throw new Error('Award not found');

        if (user.role === 'kvk' && award.kvkId !== user.kvkId) {
            throw new Error('Unauthorized access');
        }

        return award;
    },

    /**
     * Update Farmer Award
     */
    updateFarmerAward: async (id, data, user) => {
        const existing = await farmerAwardRepository.findById(id);
        if (!existing) throw new Error('Award not found');

        if (user.role === 'kvk' && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }

        const updateData = {};
        if (data.awardName) updateData.awardName = data.awardName;
        if (data.farmerName) updateData.farmerName = data.farmerName;
        if (data.contactNumber || data.contactNo) updateData.contactNumber = String(data.contactNumber || data.contactNo);
        if (data.address) updateData.address = data.address;
        if (data.year) updateData.year = data.year;
        if (data.amount) updateData.amount = parseInt(data.amount);
        if (data.achievement) updateData.achievement = data.achievement;
        if (data.conferringAuthority) updateData.conferringAuthority = data.conferringAuthority;
        if (data.image !== undefined) updateData.image = (typeof data.image === 'string') ? data.image : null;

        return await farmerAwardRepository.update(id, updateData);
    },

    /**
     * Delete Farmer Award
     */
    deleteFarmerAward: async (id, user) => {
        const existing = await farmerAwardRepository.findById(id);
        if (!existing) throw new Error('Award not found');

        if (user.role === 'kvk' && existing.kvkId !== user.kvkId) {
            throw new Error('Unauthorized');
        }

        return await farmerAwardRepository.delete(id);
    },
};

module.exports = farmerAwardService;
