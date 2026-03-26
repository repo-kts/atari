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
                // Prisma schema requires relation objects for kvk/activity
                kvk: { connect: { kvkId } },
                activity: { connect: { activityId } },
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
                // Prisma uses generalM/generalF (payload uses genM/genF)
                generalM: parseInt((data.generalM ?? data.genM) || 0),
                generalF: parseInt((data.generalF ?? data.genF) || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcFemale || data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
                exposureVisitNo
            },
            include: {
                kvk: { select: { kvkName: true } },
                activity: { select: { activityName: true } }
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
                activity: (data.extensionActivityId !== undefined || data.activityId !== undefined)
                    ? { connect: { activityId: parseInt(data.activityId ?? data.extensionActivityId) } }
                    : undefined,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                generalM: (data.generalM !== undefined || data.genM !== undefined)
                    ? parseInt((data.generalM ?? data.genM) || 0)
                    : existing.generalM,
                generalF: (data.generalF !== undefined || data.genF !== undefined)
                    ? parseInt((data.generalF ?? data.genF) || 0)
                    : existing.generalF,
                obcM: data.obcM !== undefined ? parseInt(data.obcM || 0) : existing.obcM,
                obcF: data.obcF !== undefined ? parseInt(data.obcF || 0) : existing.obcF,
                scM: data.scM !== undefined ? parseInt(data.scM || 0) : existing.scM,
                scF: data.scF !== undefined ? parseInt(data.scF || 0) : existing.scF,
                stM: data.stM !== undefined ? parseInt(data.stM || 0) : existing.stM,
                stF: data.stF !== undefined ? parseInt(data.stF || 0) : existing.stF,
                exposureVisitNo: (data.exposureVisitNo !== undefined || data.exposureVisit !== undefined)
                    ? parseInt((data.exposureVisitNo ?? data.exposureVisit) || 0)
                    : existing.exposureVisitNo
            },
            include: {
                kvk: { select: { kvkName: true } },
                activity: { select: { activityName: true } }
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
        // Backwards compatible aliases expected by frontend
        extensionActivityId: r.activityId ?? r.extensionActivityId,
        activityName: r.activity ? r.activity.activityName : '',
        kvkName: r.kvk ? r.kvk.kvkName : '',
        startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : '',
        endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : '',
        exposureVisit: r.exposureVisitNo,
        genM: r.generalM,
        genF: r.generalF,
    };
}

module.exports = craExtensionActivityRepository;
