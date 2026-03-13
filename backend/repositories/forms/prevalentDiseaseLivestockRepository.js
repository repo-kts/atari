const prisma = require('../../config/prisma.js');

const prevalentDiseaseLivestockRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        return await prisma.prevalentDiseasesOnLivestock.create({
            data: {
                kvkId,
                diseaseName: data.diseaseName || '',
                livestockType: data.livestockType || '',
                dateOfOutbreak: data.dateOfOutbreak ? new Date(data.dateOfOutbreak) : new Date(),
                mortalityCount: parseFloat(data.mortalityCount || 0),
                animalsTreated: parseInt(data.animalsTreated || 0),
                preventiveMeasures: data.preventiveMeasures || '',
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.prevalentDiseasesOnLivestock.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { prevalentLivestockDiseaseId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { prevalentLivestockDiseaseId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        return await prisma.prevalentDiseasesOnLivestock.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { prevalentLivestockDiseaseId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.prevalentDiseasesOnLivestock.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.prevalentDiseasesOnLivestock.update({
            where: { prevalentLivestockDiseaseId: parseInt(id) },
            data: {
                diseaseName: data.diseaseName !== undefined ? data.diseaseName : existing.diseaseName,
                livestockType: data.livestockType !== undefined ? data.livestockType : existing.livestockType,
                dateOfOutbreak: data.dateOfOutbreak !== undefined ? new Date(data.dateOfOutbreak) : existing.dateOfOutbreak,
                mortalityCount: data.mortalityCount !== undefined ? parseFloat(data.mortalityCount) : existing.mortalityCount,
                animalsTreated: data.animalsTreated !== undefined ? parseInt(data.animalsTreated) : existing.animalsTreated,
                preventiveMeasures: data.preventiveMeasures !== undefined ? data.preventiveMeasures : existing.preventiveMeasures,
            }
        });
    },

    delete: async (id, user) => {
        const where = { prevalentLivestockDiseaseId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.prevalentDiseasesOnLivestock.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.prevalentDiseasesOnLivestock.delete({
            where: { prevalentLivestockDiseaseId: parseInt(id) }
        });
    }
};

module.exports = prevalentDiseaseLivestockRepository;
