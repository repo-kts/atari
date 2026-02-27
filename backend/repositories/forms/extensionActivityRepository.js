const prisma = require('../../config/prisma.js');

const normalizeActivityName = (v) => {
    if (v === undefined || v === null) return null;
    const name = String(v).trim();
    return name.length > 0 ? name : null;
};

const extensionActivityRepository = {
    create: async (data, opts, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }
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
        if ((activityId === null || isNaN(activityId)) && data.extensionActivityType) {
            const activityName = normalizeActivityName(data.extensionActivityType);
            if (activityName) {
                // Use upsert or transaction to avoid race conditions. 
                // Since fldActivity might not have a unique constraint on activityName in some deployments, 
                // we'll use a transaction with a guarded check.
                const activity = await prisma.$transaction(async (tx) => {
                    let a = await tx.fldActivity.findFirst({
                        where: { activityName: { equals: activityName, mode: 'insensitive' } }
                    });
                    if (!a) {
                        a = await tx.fldActivity.create({ data: { activityName } });
                    }
                    return a;
                });
                activityId = activity.activityId;
            }
        }
        if (isNaN(activityId)) activityId = null;

        const numberOfActivities = parseInt(data.numberOfActivities ?? data.activityCount ?? 0);
        const startDate = data.startDate ? new Date(data.startDate).toISOString() : null;
        const endDate = data.endDate ? new Date(data.endDate).toISOString() : null;

        const farmersGeneralM = parseInt(data.farmersGeneralM ?? data.gen_m ?? 0);
        const farmersGeneralF = parseInt(data.farmersGeneralF ?? data.gen_f ?? 0);
        const farmersObcM = parseInt(data.farmersObcM ?? data.obc_m ?? 0);
        const farmersObcF = parseInt(data.farmersObcF ?? data.obc_f ?? 0);
        const farmersScM = parseInt(data.farmersScM ?? data.sc_m ?? 0);
        const farmersScF = parseInt(data.farmersScF ?? data.sc_f ?? 0);
        const farmersStM = parseInt(data.farmersStM ?? data.st_m ?? 0);
        const farmersStF = parseInt(data.farmersStF ?? data.st_f ?? 0);

        const officialsGeneralM = parseInt(data.officialsGeneralM ?? data.ext_gen_m ?? 0);
        const officialsGeneralF = parseInt(data.officialsGeneralF ?? data.ext_gen_f ?? 0);
        const officialsObcM = parseInt(data.officialsObcM ?? data.ext_obc_m ?? 0);
        const officialsObcF = parseInt(data.officialsObcF ?? data.ext_obc_f ?? 0);
        const officialsScM = parseInt(data.officialsScM ?? data.ext_sc_m ?? 0);
        const officialsScF = parseInt(data.officialsScF ?? data.ext_sc_f ?? 0);
        const officialsStM = parseInt(data.officialsStM ?? data.ext_st_m ?? 0);
        const officialsStF = parseInt(data.officialsStF ?? data.ext_st_f ?? 0);

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
        // Strict isolation for KVK roles
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            // Only allow filtering by kvkId if the user is an admin
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

    findById: async (id, user) => {
        const where = { extensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkExtensionActivity.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                staff: { select: { staffName: true } },
                activity: { select: { activityName: true } },
            },
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const where = { extensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const updateData = {};
        if (data.fldId !== undefined) updateData.fldId = data.fldId ? parseInt(data.fldId) : null;

        // Staff lookup
        if (data.staffName !== undefined) {
            const staffRows = await prisma.$queryRawUnsafe(
                `SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1 LIMIT 1`,
                String(data.staffName)
            );
            if (staffRows && staffRows.length > 0) {
                updateData.staffId = staffRows[0].kvk_staff_id;
            }
        } else if (data.staffId !== undefined) {
            updateData.staffId = data.staffId ? parseInt(data.staffId) : null;
        }

        // Activity lookup
        if (data.extensionActivityType !== undefined) {
            const activityName = normalizeActivityName(data.extensionActivityType);
            if (activityName) {
                const activity = await prisma.$transaction(async (tx) => {
                    let a = await tx.fldActivity.findFirst({
                        where: { activityName: { equals: activityName, mode: 'insensitive' } }
                    });
                    if (!a) {
                        a = await tx.fldActivity.create({ data: { activityName } });
                    }
                    return a;
                });
                updateData.activityId = activity.activityId;
            } else {
                updateData.activityId = null;
            }
        } else if (data.activityId !== undefined) {
            updateData.activityId = data.activityId ? parseInt(data.activityId) : null;
        }

        const numberOfActivities = data.activityCount !== undefined ? data.activityCount : data.numberOfActivities;
        if (numberOfActivities !== undefined) updateData.numberOfActivities = parseInt(numberOfActivities);

        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

        // Prefer frontend names (gen_m, etc.) for participant fields
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

        const result = await prisma.kvkExtensionActivity.updateMany({
            where,
            data: updateData
        });

        if (result.count === 0) throw new Error("Record not found or unauthorized");

        return await prisma.kvkExtensionActivity.findUnique({
            where: { extensionActivityId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                staff: { select: { staffName: true } },
                activity: { select: { activityName: true } },
            },
        });
    },

    delete: async (id, user) => {
        const where = { extensionActivityId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkExtensionActivity.deleteMany({
            where
        });

        if (result.count === 0) throw new Error("Record not found or unauthorized");

        return { success: true };
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

    const activityName = r.activity ? r.activity.activityName : undefined;
    const farmersSum = (r.farmersGeneralM || 0) + (r.farmersGeneralF || 0) + (r.farmersObcM || 0) + (r.farmersObcF || 0) + (r.farmersScM || 0) + (r.farmersScF || 0) + (r.farmersStM || 0) + (r.farmersStF || 0);
    const officialsSum = (r.officialsGeneralM || 0) + (r.officialsGeneralF || 0) + (r.officialsObcM || 0) + (r.officialsObcF || 0) + (r.officialsScM || 0) + (r.officialsScF || 0) + (r.officialsStM || 0) + (r.officialsStF || 0);
    const totalParticipants = farmersSum + officialsSum;

    return {
        ...r,
        id: r.extensionActivityId,
        extensionActivityId: r.extensionActivityId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        fldId: r.fldId,
        staffId: r.staffId,
        staffName: r.staff ? r.staff.staffName : undefined,
        activityId: r.activityId,
        extensionActivityType: activityName,
        numberOfActivities: r.numberOfActivities,
        startDate: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
        endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
        reportingYear,

        // Frontend friendly aliases
        'Reporting Year': reportingYear,
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Start Date': r.startDate ? new Date(r.startDate).toLocaleDateString('en-GB') : undefined,
        'End Date': r.endDate ? new Date(r.endDate).toLocaleDateString('en-GB') : undefined,
        'Name of Extension activities': activityName,
        'No. of Activities': r.numberOfActivities,
        'No. of Participants': totalParticipants,

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
