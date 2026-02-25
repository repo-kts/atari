const farmerAwardRepository = require('../../repositories/forms/farmerAwardRepository');

const farmerAwardService = {
    /**
     * Create a new Farmer Award
     */
    createFarmerAward: async (data, user) => {
        if (!data.awardName || !data.farmerName || !(data.year || data.reportingYear) || !data.amount || !data.achievement || !data.conferringAuthority) {
            throw new Error('All required fields must be filled');
        }

        const awardData = {
            kvkId: parseInt(user.kvkId || data.kvkId),
            awardName: data.awardName,
            farmerName: data.farmerName,
            contactNumber: (data.contactNumber || data.contactNo || '').toString(),
            address: data.address,
            year: data.year || data.reportingYear,
            reportingYear: data.reportingYear || data.year,
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

        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(award.kvkId) !== Number(user.kvkId)) {
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

        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        const updateData = {};
        if (data.awardName !== undefined) updateData.awardName = data.awardName;
        if (data.farmerName !== undefined) updateData.farmerName = data.farmerName;
        if (data.contactNumber !== undefined || data.contactNo !== undefined) {
            updateData.contactNumber = String(data.contactNumber !== undefined ? data.contactNumber : data.contactNo);
        }
        if (data.address !== undefined) updateData.address = data.address;
        if (data.year !== undefined || data.reportingYear !== undefined) {
            updateData.reportingYear = data.year || data.reportingYear;
        }
        if (data.amount !== undefined) updateData.amount = parseInt(data.amount);
        if (data.achievement !== undefined) updateData.achievement = data.achievement;
        if (data.conferringAuthority !== undefined) updateData.conferringAuthority = data.conferringAuthority;
        if (data.image !== undefined) updateData.image = (typeof data.image === 'string') ? data.image : null;

        return await farmerAwardRepository.update(id, updateData);
    },

    /**
     * Delete Farmer Award
     */
    deleteFarmerAward: async (id, user) => {
        const existing = await farmerAwardRepository.findById(id);
        if (!existing) throw new Error('Award not found');

        if (['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        return await farmerAwardRepository.delete(id);
    },
};

module.exports = farmerAwardService;
