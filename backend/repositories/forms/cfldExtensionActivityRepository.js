const prisma = require('../../config/prisma.js');

const cfldExtensionActivityRepository = {
    getActivityTypes: async () => {
        const rows = await prisma.$queryRawUnsafe(
            "SELECT extension_activity_id AS \"extensionActivityId\", extension_name AS \"extensionName\" FROM extension_activity ORDER BY extension_activity_id"
        );
        return rows;
    },

    create: async (data, opts, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        const seasonId = data.seasonId ? parseInt(data.seasonId) : 1;
        const extensionActivityId = data.extensionActivityId ? parseInt(data.extensionActivityId) : 1;
        // Frontend sends 'date', fallback to 'activityDate'
        const activityDate = (data.date || data.activityDate) ? new Date(data.date || data.activityDate) : new Date();
        const placeOfActivity = data.placeOfActivity || '';
        // Frontend sends genM/genF, fallback to generalM/generalF
        const generalM = parseInt(data.genM ?? data.generalM ?? 0);
        const generalF = parseInt(data.genF ?? data.generalF ?? 0);
        const obcM = parseInt(data.obcM || 0);
        const obcF = parseInt(data.obcF || 0);
        const scM = parseInt(data.scM || 0);
        const scF = parseInt(data.scF || 0);
        const stM = parseInt(data.stM || 0);
        const stF = parseInt(data.stF || 0);

        await prisma.$executeRawUnsafe(`
            INSERT INTO extension_activity_organized (
                "kvkId", "seasonId", "extensionActivityId", 
                activity_date, place_of_activity, 
                general_m, general_f, obc_m, obc_f, 
                sc_m, sc_f, st_m, st_f, 
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId, seasonId, extensionActivityId, activityDate, placeOfActivity, generalM, generalF, obcM, obcF, scM, scF, stM, stF);

        const result = await prisma.extensionActivityOrganized.findFirst({
            where: {
                kvkId,
                seasonId,
                extensionActivityId,
                activityDate: activityDate
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                extensionActivity: { select: { extensionName: true } },
            },
            orderBy: { organizedId: 'desc' }
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
        const organizedId = parseInt(id);
        const existing = await prisma.extensionActivityOrganized.findUnique({
            where: { organizedId }
        });
        if (!existing) throw new Error("Record not found");

        const updateData = {};
        if (data.seasonId) updateData.seasonId = parseInt(data.seasonId);
        if (data.extensionActivityId) updateData.extensionActivityId = parseInt(data.extensionActivityId);
        // Accept 'date' from frontend or 'activityDate'
        const dateVal = data.date || data.activityDate;
        if (dateVal) updateData.activityDate = new Date(dateVal);
        if (data.placeOfActivity !== undefined) updateData.placeOfActivity = data.placeOfActivity;
        // Accept genM/genF from frontend or generalM/generalF
        if (data.genM !== undefined || data.generalM !== undefined) updateData.generalM = parseInt(data.genM ?? data.generalM);
        if (data.genF !== undefined || data.generalF !== undefined) updateData.generalF = parseInt(data.genF ?? data.generalF);
        if (data.obcM !== undefined) updateData.obcM = parseInt(data.obcM);
        if (data.obcF !== undefined) updateData.obcF = parseInt(data.obcF);
        if (data.scM !== undefined) updateData.scM = parseInt(data.scM);
        if (data.scF !== undefined) updateData.scF = parseInt(data.scF);
        if (data.stM !== undefined) updateData.stM = parseInt(data.stM);
        if (data.stF !== undefined) updateData.stF = parseInt(data.stF);

        await prisma.$executeRawUnsafe(`
            UPDATE extension_activity_organized 
            SET 
                "seasonId" = $1, "extensionActivityId" = $2, 
                activity_date = $3, place_of_activity = $4, 
                general_m = $5, general_f = $6, obc_m = $7, obc_f = $8, 
                sc_m = $9, sc_f = $10, st_m = $11, st_f = $12, 
                updated_at = CURRENT_TIMESTAMP
            WHERE organized_id = $13
        `,
            updateData.seasonId ?? existing.seasonId,
            updateData.extensionActivityId ?? existing.extensionActivityId,
            updateData.activityDate ?? existing.activityDate,
            updateData.placeOfActivity ?? existing.placeOfActivity,
            updateData.generalM ?? existing.generalM,
            updateData.generalF ?? existing.generalF,
            updateData.obcM ?? existing.obcM,
            updateData.obcF ?? existing.obcF,
            updateData.scM ?? existing.scM,
            updateData.scF ?? existing.scF,
            updateData.stM ?? existing.stM,
            updateData.stF ?? existing.stF,
            organizedId
        );

        const result = await prisma.extensionActivityOrganized.findUnique({
            where: { organizedId },
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
