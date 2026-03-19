const prisma = require('../../config/prisma.js');

const techWeekRepository = {
    create: async (data, user) => {
        // Resolve kvkId: prioritized from user session (if linked to a KVK like Gaya), then from data.
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);

        if (!kvkId || isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }
        kvkId = parseInt(kvkId);

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
        if (user && user.kvkId) {
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
        if (user && user.kvkId) {
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

            if (user && user.kvkId) {
                sql += ` AND "kvkId" = $${index++}`;
                params.push(parseInt(user.kvkId));
            }

            const result = await prisma.$executeRawUnsafe(sql, ...params);
            if (result === 0) throw new Error("Record not found or unauthorized");
        }

        return await techWeekRepository.findById(id, user);
    },

    delete: async (id, user) => {
        const where = { techWeekId: parseInt(id) };
        if (user && user.kvkId) {
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
        const reportingYear = String(startYear);

        const farmersGeneralM = a.farmersGeneralM ?? a.farmers_general_m ?? 0;
        const farmersGeneralF = a.farmersGeneralF ?? a.farmers_general_f ?? 0;
        const farmersObcM = a.farmersObcM ?? a.farmers_obc_m ?? 0;
        const farmersObcF = a.farmersObcF ?? a.farmers_obc_f ?? 0;
        const farmersScM = a.farmersScM ?? a.farmers_sc_m ?? 0;
        const farmersScF = a.farmersScF ?? a.farmers_sc_f ?? 0;
        const farmersStM = a.farmersStM ?? a.farmers_st_m ?? 0;
        const farmersStF = a.farmersStF ?? a.farmers_st_f ?? 0;

        const participants = farmersGeneralM + farmersGeneralF +
            farmersObcM + farmersObcF +
            farmersScM + farmersScF +
            farmersStM + farmersStF;

        return {
            ...a,
            id: a.techWeekId,
            activityType: a.typeOfActivities || a.type_of_activities,
            activityCount: a.numberOfActivities || a.number_of_activities,
            relatedTechnology: a.relatedTechnology || a.related_crop_livestock_technology,
            gen_m: farmersGeneralM,
            gen_f: farmersGeneralF,
            obc_m: farmersObcM,
            obc_f: farmersObcF,
            sc_m: farmersScM,
            sc_f: farmersScF,
            st_m: farmersStM,
            st_f: farmersStF,
            reportingYear: reportingYear,
            kvkName: a.kvk?.kvkName,
            startDate: a.startDate ? new Date(a.startDate).toISOString().split('T')[0] : '',
            endDate: a.endDate ? new Date(a.endDate).toISOString().split('T')[0] : '',
            typeOfActivities: a.typeOfActivities || a.type_of_activities,
            noOfActivities: a.numberOfActivities || a.number_of_activities,
            relatedCropLivestockTechnology: a.relatedTechnology || a.related_crop_livestock_technology,
            noOfParticipants: participants
        };
    }
};

module.exports = techWeekRepository;
