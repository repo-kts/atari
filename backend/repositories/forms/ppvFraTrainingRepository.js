const prisma = require('../../config/prisma.js');

const ppvFraTrainingRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        return await prisma.ppvFraTraining.create({
            data: {
                kvkId,
                programmeDate: data.programmeDate ? new Date(data.programmeDate) : new Date(),
                typeId: parseInt(data.typeId || 0),
                title: data.title || '',
                venue: data.venue || '',
                resourcePerson: data.resourcePerson || '',
                generalM: parseInt(data.generalM || 0),
                generalF: parseInt(data.generalF || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
            },
            include: { 
                kvk: { select: { kvkName: true } },
                trainingType: { select: { typeName: true } }
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
        return await prisma.ppvFraTraining.findMany({
            where,
            include: { 
                kvk: { select: { kvkName: true } },
                trainingType: { select: { typeName: true } }
            },
            orderBy: { ppvFraTrainingId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { ppvFraTrainingId: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        return await prisma.ppvFraTraining.findFirst({
            where,
            include: { 
                kvk: { select: { kvkName: true } },
                trainingType: { select: { typeName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { ppvFraTrainingId: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.ppvFraTraining.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.ppvFraTraining.update({
            where: { ppvFraTrainingId: parseInt(id) },
            data: {
                programmeDate: data.programmeDate !== undefined ? new Date(data.programmeDate) : existing.programmeDate,
                typeId: data.typeId !== undefined ? parseInt(data.typeId) : existing.typeId,
                title: data.title !== undefined ? data.title : existing.title,
                venue: data.venue !== undefined ? data.venue : existing.venue,
                resourcePerson: data.resourcePerson !== undefined ? data.resourcePerson : existing.resourcePerson,
                generalM: data.generalM !== undefined ? parseInt(data.generalM) : existing.generalM,
                generalF: data.generalF !== undefined ? parseInt(data.generalF) : existing.generalF,
                obcM: data.obcM !== undefined ? parseInt(data.obcM) : existing.obcM,
                obcF: data.obcF !== undefined ? parseInt(data.obcF) : existing.obcF,
                scM: data.scM !== undefined ? parseInt(data.scM) : existing.scM,
                scF: data.scF !== undefined ? parseInt(data.scF) : existing.scF,
                stM: data.stM !== undefined ? parseInt(data.stM) : existing.stM,
                stF: data.stF !== undefined ? parseInt(data.stF) : existing.stF,
            },
            include: { 
                kvk: { select: { kvkName: true } },
                trainingType: { select: { typeName: true } }
            }
        });
    },

    delete: async (id, user) => {
        const where = { ppvFraTrainingId: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.ppvFraTraining.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.ppvFraTraining.delete({ where: { ppvFraTrainingId: parseInt(id) } });
    }
};

module.exports = ppvFraTrainingRepository;
