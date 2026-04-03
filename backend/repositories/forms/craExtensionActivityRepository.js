const prisma = require('../../config/prisma.js');

const craExtensionActivityRepository = {
    create: async (data, opts, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const exposureVisitNoRaw = data.exposureVisitNo ?? data.exposureVisit
        const exposureVisitNo = parseInt(exposureVisitNoRaw || 0)
        const activityIdRaw = data.activityId ?? data.extensionActivityId ?? data.extensionActivityID
        const activityId = activityIdRaw !== undefined && activityIdRaw !== null && activityIdRaw !== ''
            ? parseInt(activityIdRaw)
            : null
        if (!activityId) throw new Error('Valid extensionActivityId is required')

        return await prisma.craExtensionActivity.create({
            data: {
                kvkId,
                activityId: parseInt(data.activityId || data.extensionActivityId),
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
                generalM: parseInt(data.generalM || data.genM || 0),
                generalF: parseInt(data.generalF || data.genF || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
                exposureVisitNo: parseInt(data.exposureVisitNo || data.exposureVisit || 0)
            },
            include: {
                kvk: { select: { kvkName: true } },
                activity: { select: { activityName: true } }
                // activity: { select: { activityName: true } }
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
                activity: { select: { activityName: true } }
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
                activity: { select: { activityName: true } }
                // activity: { select: { activityName: true } }
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
                activityId: (data.extensionActivityId !== undefined || data.activityId !== undefined) ? parseInt(data.extensionActivityId ?? data.activityId) : undefined,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                generalM: (data.genM !== undefined || data.generalM !== undefined) ? parseInt(data.genM ?? data.generalM) : undefined,
                generalF: (data.genF !== undefined || data.generalF !== undefined) ? parseInt(data.genF ?? data.generalF) : undefined,
                obcM: data.obcM !== undefined ? parseInt(data.obcM) : undefined,
                obcF: data.obcF !== undefined ? parseInt(data.obcF) : undefined,
                scM: data.scM !== undefined ? parseInt(data.scM) : undefined,
                scF: data.scF !== undefined ? parseInt(data.scF) : undefined,
                stM: data.stM !== undefined ? parseInt(data.stM) : undefined,
                stF: data.stF !== undefined ? parseInt(data.stF) : undefined,
                exposureVisitNo: (data.exposureVisit !== undefined || data.exposureVisitNo !== undefined) ? parseInt(data.exposureVisit ?? data.exposureVisitNo) : undefined
            },
            include: {
                kvk: { select: { kvkName: true } },
                activity: { select: { activityName: true } }
                // activity: { select: { activityName: true } }
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
        id: r.craExtensionActivityId,
        activityId: r.activityId,
        extensionActivityId: r.activityId,
        activityName: r.activity ? r.activity.activityName : '',
        nameOfExtensionActivities: r.activity ? r.activity.activityName : '', // For table display
        kvkName: r.kvk ? r.kvk.kvkName : '',
        startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : '',
        endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : '',
        // Map back to frontend names
        genM: r.generalM,
        genF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        exposureVisit: r.exposureVisitNo,
        numberOfFarmersUnderExposure: (r.generalM || 0) + (r.generalF || 0) + (r.obcM || 0) + (r.obcF || 0) + (r.scM || 0) + (r.scF || 0) + (r.stM || 0) + (r.stF || 0)
    };
}

module.exports = craExtensionActivityRepository;
