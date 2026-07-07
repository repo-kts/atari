const prisma = require('../../config/prisma.js');

const { buildFormListOrderBy } = require('../../utils/formListOrderBy.js');
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
        // "Other" free-text: only meaningful when the chosen season row is flagged isOther.
        const seasonOther = (typeof data.seasonOther === 'string' && data.seasonOther.trim()) ? data.seasonOther.trim() : null;
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

        const [insertResult] = await prisma.$queryRawUnsafe(`
            INSERT INTO extension_activity_organized (
                "kvkId", "seasonId", season_other, "extensionActivityId",
                activity_date, place_of_activity,
                general_m, general_f, obc_m, obc_f,
                sc_m, sc_f, st_m, st_f,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING organized_id
        `, kvkId, seasonId, seasonOther, extensionActivityId, activityDate, placeOfActivity, generalM, generalF, obcM, obcF, scM, scF, stM, stF);

        const newOrganizedId = insertResult.organized_id;

        const result = await prisma.extensionActivityOrganized.findUnique({
            where: { organizedId: newOrganizedId },
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
            orderBy: buildFormListOrderBy(user, { kvkRelation: 'kvk', createdAt: true, tiebreak: 'organizedId' })
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
        if (data.seasonOther !== undefined) updateData.seasonOther = (typeof data.seasonOther === 'string' && data.seasonOther.trim()) ? data.seasonOther.trim() : null;
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
                "seasonId" = $1, season_other = $2, "extensionActivityId" = $3,
                activity_date = $4, place_of_activity = $5,
                general_m = $6, general_f = $7, obc_m = $8, obc_f = $9,
                sc_m = $10, sc_f = $11, st_m = $12, st_f = $13,
                updated_at = CURRENT_TIMESTAMP
            WHERE organized_id = $14
        `,
            updateData.seasonId ?? existing.seasonId,
            updateData.seasonOther !== undefined ? updateData.seasonOther : existing.seasonOther,
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
        seasonName: r.seasonOther || (r.season ? r.season.seasonName : undefined),
        seasonOther: r.seasonOther ?? '',
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
        genM: r.generalM, // Added for frontend consistency
        genF: r.generalF, // Added for frontend consistency
        date: r.activityDate, // Added for frontend consistency

        // Frontend FIELD_NAMES alignment
        season: r.seasonOther || (r.season ? r.season.seasonName : undefined),
        extensionActivitiesOrganized: r.extensionActivity ? r.extensionActivity.extensionName : undefined,
        activityDate: r.activityDate ? new Date(r.activityDate).toISOString().split('T')[0] : undefined,
        noOfFarmersAttended: totalFarmers,
    };
}

module.exports = cfldExtensionActivityRepository;
