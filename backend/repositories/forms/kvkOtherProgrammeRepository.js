const prisma = require('../../config/prisma.js');

const kvkOtherProgrammeRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        const safeInt = (v) => (v === undefined || v === null || isNaN(parseInt(v))) ? 0 : parseInt(v);

        return await prisma.kvkOtherProgramme.create({
            data: {
                kvkId,
                programmeName: data.programmeName || '',
                programmeDate: data.programmeDate ? new Date(data.programmeDate) : new Date(),
                venue: data.venue || '',
                purpose: data.purpose || '',
                farmersGeneralM: safeInt(data.farmersGeneralM || data.gen_m),
                farmersGeneralF: safeInt(data.farmersGeneralF || data.gen_f),
                farmersObcM: safeInt(data.farmersObcM || data.obc_m),
                farmersObcF: safeInt(data.farmersObcF || data.obc_f),
                farmersScM: safeInt(data.farmersScM || data.sc_m),
                farmersScF: safeInt(data.farmersScF || data.sc_f),
                farmersStM: safeInt(data.farmersStM || data.st_m),
                farmersStF: safeInt(data.farmersStF || data.st_f),
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

        return await prisma.kvkOtherProgramme.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { kvkOtherProgrammeId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { kvkOtherProgrammeId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        return await prisma.kvkOtherProgramme.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { kvkOtherProgrammeId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.kvkOtherProgramme.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const safeInt = (v) => (v === undefined || v === null || isNaN(parseInt(v))) ? 0 : parseInt(v);

        return await prisma.kvkOtherProgramme.update({
            where: { kvkOtherProgrammeId: parseInt(id) },
            data: {
                programmeName: data.programmeName !== undefined ? data.programmeName : existing.programmeName,
                programmeDate: data.programmeDate !== undefined ? new Date(data.programmeDate) : existing.programmeDate,
                venue: data.venue !== undefined ? data.venue : existing.venue,
                purpose: data.purpose !== undefined ? data.purpose : existing.purpose,
                farmersGeneralM: data.farmersGeneralM !== undefined ? safeInt(data.farmersGeneralM) : (data.gen_m !== undefined ? safeInt(data.gen_m) : existing.farmersGeneralM),
                farmersGeneralF: data.farmersGeneralF !== undefined ? safeInt(data.farmersGeneralF) : (data.gen_f !== undefined ? safeInt(data.gen_f) : existing.farmersGeneralF),
                farmersObcM: data.farmersObcM !== undefined ? safeInt(data.farmersObcM) : (data.obc_m !== undefined ? safeInt(data.obc_m) : existing.farmersObcM),
                farmersObcF: data.farmersObcF !== undefined ? safeInt(data.farmersObcF) : (data.obc_f !== undefined ? safeInt(data.obc_f) : existing.farmersObcF),
                farmersScM: data.farmersScM !== undefined ? safeInt(data.farmersScM) : (data.sc_m !== undefined ? safeInt(data.sc_m) : existing.farmersScM),
                farmersScF: data.farmersScF !== undefined ? safeInt(data.farmersScF) : (data.sc_f !== undefined ? safeInt(data.sc_f) : existing.farmersScF),
                farmersStM: data.farmersStM !== undefined ? safeInt(data.farmersStM) : (data.st_m !== undefined ? safeInt(data.st_m) : existing.farmersStM),
                farmersStF: data.farmersStF !== undefined ? safeInt(data.farmersStF) : (data.st_f !== undefined ? safeInt(data.st_f) : existing.farmersStF),
            }
        });
    },

    delete: async (id, user) => {
        const where = { kvkOtherProgrammeId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.kvkOtherProgramme.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.kvkOtherProgramme.delete({
            where: { kvkOtherProgrammeId: parseInt(id) }
        });
    }
};

module.exports = kvkOtherProgrammeRepository;
