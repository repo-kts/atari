const prisma = require('../../config/prisma.js');

const nicraExtensionActivityRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraExtensionActivity.create({
            data: {
                kvkId,
                activityName: data.activityName || '',
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
                venue: data.venue || '',
                generalM: parseInt(data.genMale || 0),
                generalF: parseInt(data.genFemale || 0),
                obcM: parseInt(data.obcMale || 0),
                obcF: parseInt(data.obcFemale || 0),
                scM: parseInt(data.scMale || 0),
                scF: parseInt(data.scFemale || 0),
                stM: parseInt(data.stMale || 0),
                stF: parseInt(data.stFemale || 0),
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.nicraExtensionActivity.findMany({
            where,
            include: { kvk: { select: { kvkName: true } } },
            orderBy: { nicraExtensionActivityId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraExtensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraExtensionActivity.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } } }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraExtensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraExtensionActivity.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraExtensionActivity.update({
            where: { nicraExtensionActivityId: parseInt(id) },
            data: {
                activityName: data.activityName !== undefined ? data.activityName : existing.activityName,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                venue: data.venue !== undefined ? data.venue : existing.venue,
                generalM: data.genMale !== undefined ? parseInt(data.genMale || 0) : (data.generalM !== undefined ? parseInt(data.generalM || 0) : existing.generalM),
                generalF: data.genFemale !== undefined ? parseInt(data.genFemale || 0) : (data.generalF !== undefined ? parseInt(data.generalF || 0) : existing.generalF),
                obcM: data.obcMale !== undefined ? parseInt(data.obcMale || 0) : (data.obcM !== undefined ? parseInt(data.obcM || 0) : existing.obcM),
                obcF: data.obcFemale !== undefined ? parseInt(data.obcFemale || 0) : (data.obcF !== undefined ? parseInt(data.obcF || 0) : existing.obcF),
                scM: data.scMale !== undefined ? parseInt(data.scMale || 0) : (data.scM !== undefined ? parseInt(data.scM || 0) : existing.scM),
                scF: data.scFemale !== undefined ? parseInt(data.scFemale || 0) : (data.scF !== undefined ? parseInt(data.scF || 0) : existing.scF),
                stM: data.stMale !== undefined ? parseInt(data.stMale || 0) : (data.stM !== undefined ? parseInt(data.stM || 0) : existing.stM),
                stF: data.stFemale !== undefined ? parseInt(data.stFemale || 0) : (data.stF !== undefined ? parseInt(data.stF || 0) : existing.stF),
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraExtensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraExtensionActivity.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraExtensionActivity.delete({
            where: { nicraExtensionActivityId: parseInt(id) }
        });
    }
};

module.exports = nicraExtensionActivityRepository;
