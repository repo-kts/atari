const prisma = require('../../config/prisma.js');

const kvkAwardRepository = {
    /**
     * Create a new KVK Award
     */
    create: async (data) => {
        return await prisma.kvkAward.create({
            data,
        });
    },

    /**
     * Find all KVK Awards (optionally filter by KVK ID if needed)
     */
    findAll: async (filters = {}) => {
        return await prisma.kvkAward.findMany({
            where: filters,
            orderBy: {
                kvkAwardID: 'desc',
            },
        });
    },

    /**
     * Find KVK Award by ID
     */
    findById: async (id) => {
        return await prisma.kvkAward.findUnique({
            where: { kvkAwardID: parseInt(id) },
        });
    },

    /**
     * Update KVK Award
     */
    update: async (id, data) => {
        return await prisma.kvkAward.update({
            where: { kvkAwardID: parseInt(id) },
            data,
        });
    },

    /**
     * Delete KVK Award
     */
    delete: async (id) => {
        return await prisma.kvkAward.delete({
            where: { kvkAwardID: parseInt(id) },
        });
    },
};

module.exports = kvkAwardRepository;
