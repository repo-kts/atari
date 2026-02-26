const prisma = require('../../config/prisma.js');

const celebrationDayRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : 1;

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

        return await prisma.kvkImportantDayCelebration.create({
            data: {
                kvkId,
                eventDate: new Date(data.eventDate),
                importantDayId: parseInt(importantDayId || 1),
                numberOfActivities: parseInt(data.activityCount || data.numberOfActivities || 0),
                farmersGeneralM: parseInt(data.gen_m || data.farmersGeneralM || 0),
                farmersGeneralF: parseInt(data.gen_f || data.farmersGeneralF || 0),
                farmersObcM: parseInt(data.obc_m || data.farmersObcM || 0),
                farmersObcF: parseInt(data.obc_f || data.farmersObcF || 0),
                farmersScM: parseInt(data.sc_m || data.farmersScM || 0),
                farmersScF: parseInt(data.sc_f || data.farmersScF || 0),
                farmersStM: parseInt(data.st_m || data.farmersStM || 0),
                farmersStF: parseInt(data.st_f || data.farmersStF || 0),
                officialsGeneralM: parseInt(data.ext_gen_m || data.officialsGeneralM || 0),
                officialsGeneralF: parseInt(data.ext_gen_f || data.officialsGeneralF || 0),
                officialsObcM: parseInt(data.ext_obc_m || data.officialsObcM || 0),
                officialsObcF: parseInt(data.ext_obc_f || data.officialsObcF || 0),
                officialsScM: parseInt(data.ext_sc_m || data.officialsScM || 0),
                officialsScF: parseInt(data.ext_sc_f || data.officialsScF || 0),
                officialsStM: parseInt(data.ext_st_m || data.officialsStM || 0),
                officialsStF: parseInt(data.ext_st_f || data.officialsStF || 0),
            }
        });
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

    findById: async (id) => {
        const activity = await prisma.kvkImportantDayCelebration.findUnique({
            where: { celebrationId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                importantDay: { select: { dayName: true } }
            }
        });
        return celebrationDayRepository._mapResponse(activity);
    },

    update: async (id, data) => {
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

        return await prisma.kvkImportantDayCelebration.update({
            where: { celebrationId: parseInt(id) },
            data: updateData
        });
    },

    delete: async (id) => {
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
