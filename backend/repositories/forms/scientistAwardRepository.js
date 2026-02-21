const prisma = require('../../config/prisma.js');

const scientistAwardRepository = {
    /**
     * Create a new Scientist Award
     */
    create: async (data) => {
        return await prisma.scientistAward.create({
            data,
        });
    },

    /**
     * Find all Scientist Awards
     */
    findAll: async (filters = {}) => {
        return await prisma.scientistAward.findMany({
            where: filters,
            orderBy: {
                scientistAwardID: 'desc',
            },
        });
    },

    /**
     * Find Scientist Award by ID
     */
    findById: async (id) => {
        return await prisma.scientistAward.findUnique({
            where: { scientistAwardID: parseInt(id) },
        });
    },

    /**
     * Update Scientist Award
     */
    update: async (id, data) => {
        return await prisma.scientistAward.update({
            where: { scientistAwardID: parseInt(id) },
            data,
        });
    },

    /**
     * Delete Scientist Award
     */
    delete: async (id) => {
        return await prisma.scientistAward.delete({
            where: { scientistAwardID: parseInt(id) },
        });
    },
};

module.exports = scientistAwardRepository;
