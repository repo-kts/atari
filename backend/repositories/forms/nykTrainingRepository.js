const prisma = require('../../config/prisma.js');

const nykTrainingRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        return await prisma.nykTraining.create({
            data: {
                kvkId,
                title: data.title || '',
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
                generalM: parseInt(data.generalM || 0),
                generalF: parseInt(data.generalF || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
                fundReceived: parseFloat(data.fundReceived || 0),
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

        return await prisma.nykTraining.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { nykTrainingId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nykTrainingId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        return await prisma.nykTraining.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nykTrainingId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.nykTraining.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nykTraining.update({
            where: { nykTrainingId: parseInt(id) },
            data: {
                title: data.title !== undefined ? data.title : existing.title,
                startDate: data.startDate !== undefined ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate !== undefined ? new Date(data.endDate) : existing.endDate,
                generalM: data.generalM !== undefined ? parseInt(data.generalM) : existing.generalM,
                generalF: data.generalF !== undefined ? parseInt(data.generalF) : existing.generalF,
                obcM: data.obcM !== undefined ? parseInt(data.obcM) : existing.obcM,
                obcF: data.obcF !== undefined ? parseInt(data.obcF) : existing.obcF,
                scM: data.scM !== undefined ? parseInt(data.scM) : existing.scM,
                scF: data.scF !== undefined ? parseInt(data.scF) : existing.scF,
                stM: data.stM !== undefined ? parseInt(data.stM) : existing.stM,
                stF: data.stF !== undefined ? parseInt(data.stF) : existing.stF,
                fundReceived: data.fundReceived !== undefined ? parseFloat(data.fundReceived) : existing.fundReceived,
            }
        });
    },

    delete: async (id, user) => {
        const where = { nykTrainingId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.nykTraining.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nykTraining.delete({
            where: { nykTrainingId: parseInt(id) }
        });
    }
};

module.exports = nykTrainingRepository;
