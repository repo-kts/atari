const prisma = require('../../config/prisma.js');

const cfldExtensionActivityRepository = {
    create: async (data, opts, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        const result = await prisma.extensionActivityOrganized.create({
            data: {
                kvkId,
                seasonId: data.seasonId ? parseInt(data.seasonId) : 1, // Defaulting if missing for now
                extensionActivityId: data.extensionActivityId ? parseInt(data.extensionActivityId) : 1,
                activityDate: data.activityDate ? new Date(data.activityDate) : new Date(),
                placeOfActivity: data.placeOfActivity || '',
                generalM: parseInt(data.generalM ?? data.genM ?? 0),
                generalF: parseInt(data.generalF ?? data.genF ?? 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                extensionActivity: { select: { extensionName: true } },
            }
        });
        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.extensionActivityOrganized.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                extensionActivity: { select: { extensionName: true } },
            },
            orderBy: { organizedId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.extensionActivityOrganized.findUnique({
            where: { organizedId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                extensionActivity: { select: { extensionName: true } },
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const updateData = {};
        if (data.seasonId) updateData.seasonId = parseInt(data.seasonId);
        if (data.extensionActivityId) updateData.extensionActivityId = parseInt(data.extensionActivityId);
        if (data.activityDate) updateData.activityDate = new Date(data.activityDate);
        if (data.placeOfActivity !== undefined) updateData.placeOfActivity = data.placeOfActivity;

        if (data.generalM !== undefined || data.genM !== undefined) updateData.generalM = parseInt(data.generalM ?? data.genM);
        if (data.generalF !== undefined || data.genF !== undefined) updateData.generalF = parseInt(data.generalF ?? data.genF);
        if (data.obcM !== undefined) updateData.obcM = parseInt(data.obcM);
        if (data.obcF !== undefined) updateData.obcF = parseInt(data.obcF);
        if (data.scM !== undefined) updateData.scM = parseInt(data.scM);
        if (data.scF !== undefined) updateData.scF = parseInt(data.scF);
        if (data.stM !== undefined) updateData.stM = parseInt(data.stM);
        if (data.stF !== undefined) updateData.stF = parseInt(data.stF);

        const result = await prisma.extensionActivityOrganized.update({
            where: { organizedId: parseInt(id) },
            data: updateData,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                extensionActivity: { select: { extensionName: true } },
            }
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.extensionActivityOrganized.delete({
            where: { organizedId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    const totalFarmers = (r.generalM || 0) + (r.generalF || 0) + (r.obcM || 0) + (r.obcF || 0) + (r.scM || 0) + (r.scF || 0) + (r.stM || 0) + (r.stF || 0);

    return {
        id: r.organizedId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        extensionActivityId: r.extensionActivityId,
        extensionActivityOrganized: r.extensionActivity ? r.extensionActivity.extensionName : undefined,
        activityDate: r.activityDate,
        placeOfActivity: r.placeOfActivity,
        generalM: r.generalM,
        generalF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,

        // Frontend friendly aliases
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Season': r.season ? r.season.seasonName : undefined,
        'Extension Activities Organized': r.extensionActivity ? r.extensionActivity.extensionName : undefined,
        'Date': r.activityDate ? new Date(r.activityDate).toLocaleDateString('en-GB') : undefined,
        'Place of Activity': r.placeOfActivity,
        'No. of Farmers attended': totalFarmers
    };
}

module.exports = cfldExtensionActivityRepository;
