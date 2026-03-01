const prisma = require('../../config/prisma.js');

const celebrationDayRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        let importantDayId = data.importantDayId;
        if (!importantDayId && data.importantDay) {
            const dayName = String(data.importantDay);
            let day = await prisma.importantDay.findFirst({
                where: { dayName: { equals: dayName, mode: 'insensitive' } }
            });
            if (!day) {
                day = await prisma.importantDay.create({ data: { dayName } });
            }
            importantDayId = day.importantDayId;
        }

        const result = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_important_day_celebration (
                "kvkId", event_date, "importantDayId", 
                number_of_activities,
                farmers_general_m, farmers_general_f, farmers_obc_m, farmers_obc_f,
                farmers_sc_m, farmers_sc_f, farmers_st_m, farmers_st_f,
                officials_general_m, officials_general_f, officials_obc_m, officials_obc_f,
                officials_sc_m, officials_sc_f, officials_st_m, officials_st_f,
                created_at, updated_at
            ) VALUES (
                $1, $2::timestamp, $3, $4,
                $5, $6, $7, $8, $9, $10, $11, $12,
                $13, $14, $15, $16, $17, $18, $19, $20,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING celebration_id
        `, kvkId, new Date(data.eventDate).toISOString(), parseInt(importantDayId ?? 1),
            parseInt(data.activityCount ?? data.numberOfActivities ?? 0),
            parseInt(data.gen_m ?? data.farmersGeneralM ?? 0), parseInt(data.gen_f ?? data.farmersGeneralF ?? 0),
            parseInt(data.obc_m ?? data.farmersObcM ?? 0), parseInt(data.obcF ?? data.farmersObcF ?? 0),
            parseInt(data.sc_m ?? data.farmersScM ?? 0), parseInt(data.sc_f ?? data.farmersScF ?? 0),
            parseInt(data.st_m ?? data.farmersStM ?? 0), parseInt(data.st_f ?? data.farmersStF ?? 0),
            parseInt(data.ext_gen_m ?? data.officialsGeneralM ?? 0), parseInt(data.ext_gen_f ?? data.officialsGeneralF ?? 0),
            parseInt(data.ext_obc_m ?? data.officialsObcM ?? 0), parseInt(data.ext_obc_f ?? data.officialsObcF ?? 0),
            parseInt(data.ext_sc_m ?? data.officialsScM ?? 0), parseInt(data.ext_sc_f ?? data.officialsScF ?? 0),
            parseInt(data.ext_st_m ?? data.officialsStM ?? 0), parseInt(data.ext_st_f ?? data.officialsStF ?? 0));

        return await celebrationDayRepository.findById(result[0].celebration_id, user);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const activities = await prisma.kvkImportantDayCelebration.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                importantDay: { select: { dayName: true } }
            },
            orderBy: { celebrationId: 'desc' }
        });

        return activities.map(a => celebrationDayRepository._mapResponse(a));
    },

    findById: async (id, user) => {
        const where = { celebrationId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const activity = await prisma.kvkImportantDayCelebration.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                importantDay: { select: { dayName: true } }
            }
        });
        return celebrationDayRepository._mapResponse(activity);
    },

    update: async (id, data, user) => {
        const where = { celebrationId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.kvkImportantDayCelebration.findFirst({
            where,
            select: { celebrationId: true }
        });

        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = {};
        if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
        if (data.importantDay !== undefined) {
            const dayName = String(data.importantDay);
            let day = await prisma.importantDay.findFirst({
                where: { dayName: { equals: dayName, mode: 'insensitive' } }
            });
            if (!day) {
                day = await prisma.importantDay.create({ data: { dayName } });
            }
            updateData.importantDayId = day.importantDayId;
        } else if (data.importantDayId !== undefined) {
            updateData.importantDayId = data.importantDayId ? parseInt(data.importantDayId) : null;
        }

        const count = data.activityCount !== undefined ? data.activityCount : data.numberOfActivities;
        if (count !== undefined) updateData.numberOfActivities = parseInt(count);

        // Naming mapper
        const mpping = {
            gen_m: 'farmersGeneralM', gen_f: 'farmersGeneralF',
            obc_m: 'farmersObcM', obc_f: 'farmersObcF',
            sc_m: 'farmersScM', sc_f: 'farmersScF',
            st_m: 'farmersStM', st_f: 'farmersStF',
            ext_gen_m: 'officialsGeneralM', ext_gen_f: 'officialsGeneralF',
            ext_obc_m: 'officialsObcM', ext_obc_f: 'officialsObcF',
            ext_sc_m: 'officialsScM', ext_sc_f: 'officialsScF',
            ext_st_m: 'officialsStM', ext_st_f: 'officialsStF'
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
            else if (key === 'importantDayId') colName = '"importantDayId"';
            else if (key === 'numberOfActivities') colName = 'number_of_activities';
            else colName = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

            updates.push(`${colName} = $${index++}`);
            values.push(val);
        }

        if (updates.length > 0) {
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            let sql = `UPDATE kvk_important_day_celebration SET ${updates.join(', ')} WHERE celebration_id = $${index++}`;
            const params = [...values, parseInt(id)];

            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                sql += ` AND "kvkId" = $${index++}`;
                params.push(parseInt(user.kvkId));
            }

            const result = await prisma.$executeRawUnsafe(sql, ...params);
            if (result === 0) throw new Error("Record not found or unauthorized");
        }

        return await celebrationDayRepository.findById(id, user);
    },

    delete: async (id, user) => {
        const where = { celebrationId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.kvkImportantDayCelebration.findFirst({
            where,
            select: { celebrationId: true }
        });

        if (!existing) throw new Error("Record not found or unauthorized");

        return await prisma.kvkImportantDayCelebration.delete({
            where: { celebrationId: parseInt(id) }
        });
    },

    _mapResponse: (a) => {
        if (!a) return null;
        const eventDate = new Date(a.eventDate);
        const month = eventDate.getMonth() + 1;
        const startYear = month >= 4 ? eventDate.getFullYear() : eventDate.getFullYear() - 1;
        const reportingYear = `${startYear}-${(startYear + 1).toString().slice(2)}`;

        const participants = a.farmersGeneralM + a.farmersGeneralF + a.farmersObcM + a.farmersObcF +
            a.farmersScM + a.farmersScF + a.farmersStM + a.farmersStF +
            a.officialsGeneralM + a.officialsGeneralF + a.officialsObcM + a.officialsObcF +
            a.officialsScM + a.officialsScF + a.officialsStM + a.officialsStF;

        return {
            ...a,
            id: a.celebrationId,
            eventDate: a.eventDate ? new Date(a.eventDate).toISOString().split('T')[0] : '',
            importantDay: a.importantDay?.dayName,
            activityCount: a.numberOfActivities,
            gen_m: a.farmersGeneralM,
            gen_f: a.farmersGeneralF,
            obc_m: a.farmersObcM,
            obc_f: a.farmersObcF,
            sc_m: a.farmersScM,
            sc_f: a.farmersScF,
            st_m: a.farmersStM,
            st_f: a.farmersStF,
            ext_gen_m: a.officialsGeneralM,
            ext_gen_f: a.officialsGeneralF,
            ext_obc_m: a.officialsObcM,
            ext_obc_f: a.officialsObcF,
            ext_sc_m: a.officialsScM,
            ext_sc_f: a.officialsScF,
            ext_st_m: a.officialsStM,
            ext_st_f: a.officialsStF,
            reportingYear,
            'Reporting Year': reportingYear,
            'KVK Name': a.kvk?.kvkName,
            'Important Days': a.importantDay?.dayName,
            'Event Date': a.eventDate.toISOString().split('T')[0],
            'No. of Activities': a.numberOfActivities,
            'No. of Participants': participants
        };
    }
};

module.exports = celebrationDayRepository;
