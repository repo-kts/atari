const prisma = require('../../config/prisma.js');

const techWeekRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        return await prisma.kvkTechnologyWeekCelebration.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                typeOfActivities: data.activityType || '',
                numberOfActivities: parseInt(data.activityCount || 0),
                relatedTechnology: data.relatedTechnology || '',
                farmersGeneralM: parseInt(data.gen_m || 0),
                farmersGeneralF: parseInt(data.gen_f || 0),
                farmersObcM: parseInt(data.obc_m || 0),
                farmersObcF: parseInt(data.obc_f || 0),
                farmersScM: parseInt(data.sc_m || 0),
                farmersScF: parseInt(data.sc_f || 0),
                farmersStM: parseInt(data.st_m || 0),
                farmersStF: parseInt(data.st_f || 0),
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

        const result = await prisma.kvkTechnologyWeekCelebration.updateMany({
            where,
            data: updateData
        });

        if (result.count === 0) throw new Error("Record not found or unauthorized");

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

        const participants = a.farmersGeneralM + a.farmersGeneralF + a.farmersObcM + a.farmersObcF +
            a.farmersScM + a.farmersScF + a.farmersStM + a.farmersStF;

        return {
            ...a,
            id: a.techWeekId,
            activityType: a.typeOfActivities,
            activityCount: a.numberOfActivities,
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
            'Start Date': a.startDate.toISOString().split('T')[0],
            'End Date': a.endDate.toISOString().split('T')[0],
            'Type Of Activities': a.typeOfActivities,
            'No. of activities': a.numberOfActivities,
            'Related Crop/Live Stock Technology': a.relatedTechnology,
            'No. of Participants': participants
        };
    }
};

module.exports = techWeekRepository;
