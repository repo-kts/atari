const prisma = require('../../config/prisma.js');

const prevalentDiseaseCropRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        return await prisma.prevalentDiseasesInCrop.create({
            data: {
                kvkId,
                diseaseName: data.diseaseName || '',
                crop: data.crop || '',
                dateOfOutbreak: data.dateOfOutbreak ? new Date(data.dateOfOutbreak) : new Date(),
                areaAffected: parseFloat(data.areaAffected || 0),
                commodityLossPercent: parseFloat(data.commodityLossPercent || 0),
                preventiveMeasuresArea: parseFloat(data.preventiveMeasuresArea || 0),
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

        return await prisma.prevalentDiseasesInCrop.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { prevalentDiseaseId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { prevalentDiseaseId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        return await prisma.prevalentDiseasesInCrop.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { prevalentDiseaseId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.prevalentDiseasesInCrop.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.prevalentDiseasesInCrop.update({
            where: { prevalentDiseaseId: parseInt(id) },
            data: {
                diseaseName: data.diseaseName !== undefined ? data.diseaseName : existing.diseaseName,
                crop: data.crop !== undefined ? data.crop : existing.crop,
                dateOfOutbreak: data.dateOfOutbreak !== undefined ? new Date(data.dateOfOutbreak) : existing.dateOfOutbreak,
                areaAffected: data.areaAffected !== undefined ? parseFloat(data.areaAffected) : existing.areaAffected,
                commodityLossPercent: data.commodityLossPercent !== undefined ? parseFloat(data.commodityLossPercent) : existing.commodityLossPercent,
                preventiveMeasuresArea: data.preventiveMeasuresArea !== undefined ? parseFloat(data.preventiveMeasuresArea) : existing.preventiveMeasuresArea,
            }
        });
    },

    delete: async (id, user) => {
        const where = { prevalentDiseaseId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.prevalentDiseasesInCrop.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.prevalentDiseasesInCrop.delete({
            where: { prevalentDiseaseId: parseInt(id) }
        });
    }
};

module.exports = prevalentDiseaseCropRepository;
