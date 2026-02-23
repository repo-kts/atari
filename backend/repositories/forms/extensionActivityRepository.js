const prisma = require('../../config/prisma.js');

const extensionActivityRepository = {
    create: async (data, opts, user) => {
        const kvkId = parseInt((user && user.kvkId) ? user.kvkId : (data.kvkId || 1));
        const fldId = data.fldId ? parseInt(data.fldId) : null;
        let staffId = data.staffId ? parseInt(data.staffId) : null;
        if ((staffId === null || isNaN(staffId)) && data.staffName) {
            const staffRows = await prisma.$queryRawUnsafe(
                `SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1 LIMIT 1`,
                String(data.staffName)
            );
            if (staffRows && staffRows.length > 0) staffId = staffRows[0].kvk_staff_id;
        }
        if (isNaN(staffId)) staffId = null;

        let activityId = data.activityId ? parseInt(data.activityId) : null;
        if (isNaN(activityId)) activityId = null;

        const numberOfActivities = parseInt(data.numberOfActivities || data.activityCount || 0);
        const startDate = data.startDate ? new Date(data.startDate).toISOString() : null;
        const endDate = data.endDate ? new Date(data.endDate).toISOString() : null;

        const farmersGeneralM = parseInt(data.farmersGeneralM || data.gen_m || 0);
        const farmersGeneralF = parseInt(data.farmersGeneralF || data.gen_f || 0);
        const farmersObcM = parseInt(data.farmersObcM || data.obc_m || 0);
        const farmersObcF = parseInt(data.farmersObcF || data.obc_f || 0);
        const farmersScM = parseInt(data.farmersScM || data.sc_m || 0);
        const farmersScF = parseInt(data.farmersScF || data.sc_f || 0);
        const farmersStM = parseInt(data.farmersStM || data.st_m || 0);
        const farmersStF = parseInt(data.farmersStF || data.st_f || 0);

        const officialsGeneralM = parseInt(data.officialsGeneralM || data.ext_gen_m || 0);
        const officialsGeneralF = parseInt(data.officialsGeneralF || data.ext_gen_f || 0);
        const officialsObcM = parseInt(data.officialsObcM || data.ext_obc_m || 0);
        const officialsObcF = parseInt(data.officialsObcF || data.ext_obc_f || 0);
        const officialsScM = parseInt(data.officialsScM || data.ext_sc_m || 0);
        const officialsScF = parseInt(data.officialsScF || data.ext_sc_f || 0);
        const officialsStM = parseInt(data.officialsStM || data.ext_st_m || 0);
        const officialsStF = parseInt(data.officialsStF || data.ext_st_f || 0);

        const result = await prisma.kvkExtensionActivity.create({
            data: {
                kvkId,
                fldId,
                staffId,
                activityId,
                numberOfActivities,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(),
                farmersGeneralM, farmersGeneralF,
                farmersObcM, farmersObcF,
                farmersScM, farmersScF,
                farmersStM, farmersStF,
                officialsGeneralM, officialsGeneralF,
                officialsObcM, officialsObcF,
                officialsScM, officialsScF,
                officialsStM, officialsStF,
            },
            include: {
                kvk: { select: { kvkName: true } },
                staff: { select: { staffName: true } },
                activity: { select: { activityName: true } },
            },
        });
        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        // Only allow kvkId filter override for non-KVK (admin) roles
        if (filters.kvkId && (!user || !['kvk_admin', 'kvk_user'].includes(user.role))) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.kvkExtensionActivity.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                staff: { select: { staffName: true } },
                activity: { select: { activityName: true } },
            },
            orderBy: { extensionActivityId: 'desc' },
        });
        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.kvkExtensionActivity.findUnique({
            where: { extensionActivityId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                staff: { select: { staffName: true } },
                activity: { select: { activityName: true } },
            },
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const updateData = {};
        if (data.fldId !== undefined) updateData.fldId = data.fldId ? parseInt(data.fldId) : null;
        if (data.staffId !== undefined) updateData.staffId = data.staffId ? parseInt(data.staffId) : null;
        if (data.activityId !== undefined) updateData.activityId = data.activityId ? parseInt(data.activityId) : null;
        if (data.numberOfActivities !== undefined) updateData.numberOfActivities = parseInt(data.numberOfActivities);
        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

        // Farmer fields
        if (data.farmersGeneralM !== undefined) updateData.farmersGeneralM = parseInt(data.farmersGeneralM);
        if (data.farmersGeneralF !== undefined) updateData.farmersGeneralF = parseInt(data.farmersGeneralF);
        if (data.farmersObcM !== undefined) updateData.farmersObcM = parseInt(data.farmersObcM);
        if (data.farmersObcF !== undefined) updateData.farmersObcF = parseInt(data.farmersObcF);
        if (data.farmersScM !== undefined) updateData.farmersScM = parseInt(data.farmersScM);
        if (data.farmersScF !== undefined) updateData.farmersScF = parseInt(data.farmersScF);
        if (data.farmersStM !== undefined) updateData.farmersStM = parseInt(data.farmersStM);
        if (data.farmersStF !== undefined) updateData.farmersStF = parseInt(data.farmersStF);

        // Officials fields
        if (data.officialsGeneralM !== undefined) updateData.officialsGeneralM = parseInt(data.officialsGeneralM);
        if (data.officialsGeneralF !== undefined) updateData.officialsGeneralF = parseInt(data.officialsGeneralF);
        if (data.officialsObcM !== undefined) updateData.officialsObcM = parseInt(data.officialsObcM);
        if (data.officialsObcF !== undefined) updateData.officialsObcF = parseInt(data.officialsObcF);
        if (data.officialsScM !== undefined) updateData.officialsScM = parseInt(data.officialsScM);
        if (data.officialsScF !== undefined) updateData.officialsScF = parseInt(data.officialsScF);
        if (data.officialsStM !== undefined) updateData.officialsStM = parseInt(data.officialsStM);
        if (data.officialsStF !== undefined) updateData.officialsStF = parseInt(data.officialsStF);

        const result = await prisma.kvkExtensionActivity.update({
            where: { extensionActivityId: parseInt(id) },
            data: updateData,
            include: {
                kvk: { select: { kvkName: true } },
                staff: { select: { staffName: true } },
                activity: { select: { activityName: true } },
            },
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.kvkExtensionActivity.delete({
            where: { extensionActivityId: parseInt(id) },
        });
    },
};

function _mapResponse(r) {
    if (!r) return null;
    const startDate = r.startDate ? new Date(r.startDate) : null;
    let reportingYear = null;
    if (startDate && !isNaN(startDate.getTime())) {
        const month = startDate.getMonth() + 1;
        const startYear = month >= 4 ? startDate.getFullYear() : startDate.getFullYear() - 1;
        reportingYear = `${startYear}-${(startYear + 1).toString().slice(2)}`;
    }
    return {
        extensionActivityId: r.extensionActivityId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        fldId: r.fldId,
        staffId: r.staffId,
        staffName: r.staff ? r.staff.staffName : undefined,
        activityId: r.activityId,
        extensionActivityType: r.activity ? r.activity.activityName : undefined,
        numberOfActivities: r.numberOfActivities,
        startDate: r.startDate,
        endDate: r.endDate,
        reportingYear,
        farmersGeneralM: r.farmersGeneralM,
        farmersGeneralF: r.farmersGeneralF,
        farmersObcM: r.farmersObcM,
        farmersObcF: r.farmersObcF,
        farmersScM: r.farmersScM,
        farmersScF: r.farmersScF,
        farmersStM: r.farmersStM,
        farmersStF: r.farmersStF,
        officialsGeneralM: r.officialsGeneralM,
        officialsGeneralF: r.officialsGeneralF,
        officialsObcM: r.officialsObcM,
        officialsObcF: r.officialsObcF,
        officialsScM: r.officialsScM,
        officialsScF: r.officialsScF,
        officialsStM: r.officialsStM,
        officialsStF: r.officialsStF,
    };
}

module.exports = extensionActivityRepository;
