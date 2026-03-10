const prisma = require('../../config/prisma.js');

const craExtensionActivityRepository = {
    create: async (data, opts, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.craExtensionActivity.create({
            data: {
                kvkId,
                extensionActivityId: parseInt(data.extensionActivityId),
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
                genM: parseInt(data.genM || 0),
                genF: parseInt(data.genF || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcFemale || data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
                exposureVisit: parseInt(data.exposureVisit || 0)
            },
            include: {
                kvk: { select: { kvkName: true } },
                extensionActivity: { select: { activityName: true } }
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.craExtensionActivity.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                extensionActivity: { select: { activityName: true } }
            },
            orderBy: { craExtensionActivityId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const where = { craExtensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const result = await prisma.craExtensionActivity.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                extensionActivity: { select: { activityName: true } }
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const where = { craExtensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.craExtensionActivity.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const result = await prisma.craExtensionActivity.update({
            where: { craExtensionActivityId: parseInt(id) },
            data: {
                extensionActivityId: data.extensionActivityId ? parseInt(data.extensionActivityId) : existing.extensionActivityId,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                genM: data.genM !== undefined ? parseInt(data.genM || 0) : existing.genM,
                genF: data.genF !== undefined ? parseInt(data.genF || 0) : existing.genF,
                obcM: data.obcM !== undefined ? parseInt(data.obcM || 0) : existing.obcM,
                obcF: data.obcF !== undefined ? parseInt(data.obcF || 0) : existing.obcF,
                scM: data.scM !== undefined ? parseInt(data.scM || 0) : existing.scM,
                scF: data.scF !== undefined ? parseInt(data.scF || 0) : existing.scF,
                stM: data.stM !== undefined ? parseInt(data.stM || 0) : existing.stM,
                stF: data.stF !== undefined ? parseInt(data.stF || 0) : existing.stF,
                exposureVisit: data.exposureVisit !== undefined ? parseInt(data.exposureVisit || 0) : existing.exposureVisit
            },
            include: {
                kvk: { select: { kvkName: true } },
                extensionActivity: { select: { activityName: true } }
            }
        });
        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const where = { craExtensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.craExtensionActivity.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.craExtensionActivity.delete({
            where: { craExtensionActivityId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        ...r,
        id: r.craExtensionActivityId,
        activityName: r.extensionActivity ? r.extensionActivity.activityName : '',
        kvkName: r.kvk ? r.kvk.kvkName : '',
        startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : '',
        endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : ''
    };
}

module.exports = craExtensionActivityRepository;
