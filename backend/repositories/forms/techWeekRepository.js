const prisma = require('../../config/prisma.js');

const techWeekRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        const result = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_technology_week_celebration (
                "kvkId", start_date, end_date, type_of_activities,
                number_of_activities, related_crop_livestock_technology,
                farmers_general_m, farmers_general_f, farmers_obc_m, farmers_obc_f,
                farmers_sc_m, farmers_sc_f, farmers_st_m, farmers_st_f,
                created_at, updated_at
            ) VALUES (
                $1, $2::timestamp, $3::timestamp, $4, $5, $6,
                $7, $8, $9, $10, $11, $12, $13, $14,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING tech_week_id
        `, kvkId, new Date(data.startDate).toISOString(), new Date(data.endDate).toISOString(),
            data.activityType || '', parseInt(data.activityCount || 0), data.relatedTechnology || '',
            parseInt(data.gen_m || 0), parseInt(data.gen_f || 0), parseInt(data.obc_m || 0), parseInt(data.obc_f || 0),
            parseInt(data.sc_m || 0), parseInt(data.sc_f || 0), parseInt(data.st_m || 0), parseInt(data.st_f || 0));

        return await techWeekRepository.findById(result[0].tech_week_id, user);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const activities = await prisma.kvkTechnologyWeekCelebration.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { techWeekId: 'desc' }
        });

        return activities.map(a => techWeekRepository._mapResponse(a));
    },

    findById: async (id, user) => {
        const where = { techWeekId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const activity = await prisma.kvkTechnologyWeekCelebration.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
        return techWeekRepository._mapResponse(activity);
    },

    update: async (id, data, user) => {
        const where = { techWeekId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.kvkTechnologyWeekCelebration.findFirst({
            where,
            select: { techWeekId: true }
        });

        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = {};
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);
        if (data.activityType !== undefined) updateData.typeOfActivities = data.activityType;

        const count = data.activityCount !== undefined ? data.activityCount : data.numberOfActivities;
        if (count !== undefined) updateData.numberOfActivities = parseInt(count);

        if (data.relatedTechnology !== undefined) updateData.relatedTechnology = data.relatedTechnology;

        // Farmer fields
        const mpping = {
            gen_m: 'farmersGeneralM', gen_f: 'farmersGeneralF',
            obc_m: 'farmersObcM', obc_f: 'farmersObcF',
            sc_m: 'farmersScM', sc_f: 'farmersScF',
            st_m: 'farmersStM', st_f: 'farmersStF'
        };

        for (const [front, back] of Object.entries(mpping)) {
            const val = data[front] !== undefined ? data[front] : data[back];
            if (val !== undefined) updateData[back] = parseInt(val);
        }

        const updates = [];
        const values = [];
        let index = 1;

        for (const [key, val] of Object.entries(updateData)) {
            let colName = key;
            if (key === 'kvkId') colName = '"kvkId"';
            else if (key === 'techWeekId') colName = 'tech_week_id';
            else if (key === 'typeOfActivities') colName = 'type_of_activities';
            else if (key === 'numberOfActivities') colName = 'number_of_activities';
            else if (key === 'relatedTechnology') colName = 'related_crop_livestock_technology';
            else colName = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

            updates.push(`${colName} = $${index++}`);
            values.push(val);
        }

        if (updates.length > 0) {
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            let sql = `UPDATE kvk_technology_week_celebration SET ${updates.join(', ')} WHERE tech_week_id = $${index++}`;
            const params = [...values, parseInt(id)];

            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                sql += ` AND "kvkId" = $${index++}`;
                params.push(parseInt(user.kvkId));
            }

            const result = await prisma.$executeRawUnsafe(sql, ...params);
            if (result === 0) throw new Error("Record not found or unauthorized");
        }

        return await prisma.kvkTechnologyWeekCelebration.findUnique({
            where: { techWeekId: parseInt(id) },
            include: { kvk: { select: { kvkName: true } } }
        });
    },

    delete: async (id, user) => {
        const where = { techWeekId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkTechnologyWeekCelebration.deleteMany({
            where
        });

        if (result.count === 0) throw new Error("Record not found or unauthorized");

        return { success: true };
    },

    _mapResponse: (a) => {
        if (!a) return null;
        const startDate = new Date(a.startDate);
        const month = startDate.getMonth() + 1;
        const startYear = month >= 4 ? startDate.getFullYear() : startDate.getFullYear() - 1;
        const reportingYear = `${startYear}-${(startYear + 1).toString().slice(2)}`;

        const participants = (a.farmersGeneralM || 0) + (a.farmersGeneralF || 0) +
            (a.farmersObcM || 0) + (a.farmersObcF || 0) +
            (a.farmersScM || 0) + (a.farmersScF || 0) +
            (a.farmersStM || 0) + (a.farmersStF || 0);

        return {
            ...a,
            id: a.techWeekId,
            activityType: a.type_of_activities,
            activityCount: a.number_of_activities,
            gen_m: a.farmersGeneralM,
            gen_f: a.farmersGeneralF,
            obc_m: a.farmersObcM,
            obc_f: a.farmersObcF,
            sc_m: a.farmersScM,
            sc_f: a.farmersScF,
            st_m: a.farmersStM,
            st_f: a.farmersStF,
            reportingYear,
            'Reporting Year': reportingYear,
            'KVK Name': a.kvk?.kvkName,
            'Start Date': a.startDate ? new Date(a.startDate).toISOString().split('T')[0] : '',
            'End Date': a.endDate ? new Date(a.endDate).toISOString().split('T')[0] : '',
            'Type Of Activities': a.type_of_activities,
            'No. of activities': a.number_of_activities,
            'Related Crop/Live Stock Technology': a.related_crop_livestock_technology,
            'No. of Participants': participants
        };
    }
};

module.exports = techWeekRepository;
