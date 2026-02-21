const prisma = require('../../config/prisma.js');

const farmerAwardRepository = {
    /**
     * Create a new Farmer Award
     */
    create: async (data) => {
        // Force conversion to string and remove snake_case duplicates that might confuse Prisma
        const contactValue = data.contactNumber || data.contactNo || data['contact_number'];

        const cleanData = {
            kvkId: parseInt(data.kvkId),
            farmerName: String(data.farmerName),
            contactNumber: String(contactValue || ''),
            address: String(data.address),
            awardName: String(data.awardName),
            year: String(data.year),
            amount: parseInt(data.amount),
            achievement: String(data.achievement),
            conferringAuthority: String(data.conferringAuthority),
            image: typeof data.image === 'string' ? data.image : null
        };

        return await prisma.farmerAward.create({
            data: cleanData,
        });
    },

    /**
     * Find all Farmer Awards
     */
    findAll: async (filters = {}) => {
        return await prisma.farmerAward.findMany({
            where: filters,
            select: {
                farmerAwardID: true,
                kvkId: true,
                farmerName: true,
                contactNumber: true,
                address: true,
                awardName: true,
                year: true,
                amount: true,
                achievement: true,
                conferringAuthority: true,
                image: true
            },
            orderBy: {
                farmerAwardID: 'desc',
            },
        });
    },

    /**
     * Find Farmer Award by ID
     */
    findById: async (id) => {
        return await prisma.farmerAward.findUnique({
            where: { farmerAwardID: parseInt(id) },
        });
    },

    /**
     * Update Farmer Award
     */
    update: async (id, data) => {
        const updateData = {};

        if (data.awardName !== undefined) updateData.awardName = String(data.awardName);
        if (data.farmerName !== undefined) updateData.farmerName = String(data.farmerName);
        if (data.contactNumber !== undefined || data.contactNo !== undefined || data['contact_number'] !== undefined) {
            updateData.contactNumber = String(data.contactNumber || data.contactNo || data['contact_number'] || '');
        }
        if (data.address !== undefined) updateData.address = String(data.address);
        if (data.year !== undefined) updateData.year = String(data.year);
        if (data.amount !== undefined) updateData.amount = parseInt(data.amount);
        if (data.achievement !== undefined) updateData.achievement = String(data.achievement);
        if (data.conferringAuthority !== undefined) updateData.conferringAuthority = String(data.conferringAuthority);
        if (data.image !== undefined) updateData.image = typeof data.image === 'string' ? data.image : null;

        return await prisma.farmerAward.update({
            where: { farmerAwardID: parseInt(id) },
            data: updateData,
        });
    },

    /**
     * Delete Farmer Award
     */
    delete: async (id) => {
        return await prisma.farmerAward.delete({
            where: { farmerAwardID: parseInt(id) },
        });
    },
};

module.exports = farmerAwardRepository;
