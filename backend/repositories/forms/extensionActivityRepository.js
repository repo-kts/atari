const prisma = require('../../config/prisma.js');

const extensionActivityRepository = {
    /**
     * Create a new Extension Activity
     */
    create: async (data, entityType = null) => {
        // Look up staffId by staffName if staffId is not a valid number
        let staffId = parseInt(data.staffId);
        if (isNaN(staffId) && data.staffName) {
            const staff = await prisma.kvkStaff.findFirst({
                where: { staffName: String(data.staffName) }
            });
            if (staff) staffId = staff.kvkStaffId;
        }

        // Look up activityId by extensionActivityType if activityId is not a valid number
        // Note: Schema uses FldActivity for KvkExtensionActivity and KvkOtherExtensionActivity
        let activityId = parseInt(data.activityId);
        if (isNaN(activityId) && data.extensionActivityType) {
            const activity = await prisma.fldActivity.findFirst({
                where: { activityName: String(data.extensionActivityType) }
            });
            if (activity) activityId = activity.activityId;
        }

        // Fallback IDs - ideally we should have meaningful defaults or throw errors
        // But for now we try to avoid DB crashes
        if (isNaN(staffId)) staffId = 1;
        if (isNaN(activityId)) activityId = 1;

        const kvkId = parseInt(data.kvkId || 1);
        const fldId = data.fldId ? parseInt(data.fldId) : null;

        // Determine which model to use. 
        // If not specified, default to kvkExtensionActivity
        const isOther = entityType === 'ACHIEVEMENT_OTHER_EXTENSION' || data.isOther;
        const model = isOther ? prisma.kvkOtherExtensionActivity : prisma.kvkExtensionActivity;

        return await model.create({
            data: {
                kvkId: kvkId,
                fldId: fldId,
                staffId: staffId,
                activityId: activityId,
                numberOfActivities: parseInt(data.numberOfActivities || data.activityCount || 1),
                startDate: new Date(data.startDate || new Date()),
                endDate: new Date(data.endDate || new Date()),
                // Achievement Extension fields - only if model is KvkExtensionActivity
                ...(model === prisma.kvkExtensionActivity ? {
                    farmersGeneralM: parseInt(data.farmersGeneralM || data.gen_m || 0),
                    farmersGeneralF: parseInt(data.farmersGeneralF || data.gen_f || 0),
                    farmersObcM: parseInt(data.farmersObcM || data.obc_m || 0),
                    farmersObcF: parseInt(data.farmersObcF || data.obc_f || 0),
                    farmersScM: parseInt(data.farmersScM || data.sc_m || 0),
                    farmersScF: parseInt(data.farmersScF || data.sc_f || 0),
                    farmersStM: parseInt(data.farmersStM || data.st_m || 0),
                    farmersStF: parseInt(data.farmersStF || data.st_f || 0),
                    officialsGeneralM: parseInt(data.officialsGeneralM || data.ext_gen_m || 0),
                    officialsGeneralF: parseInt(data.officialsGeneralF || data.ext_gen_f || 0),
                    officialsObcM: parseInt(data.officialsObcM || data.ext_obc_m || 0),
                    officialsObcF: parseInt(data.officialsObcF || data.ext_obc_f || 0),
                    officialsScM: parseInt(data.officialsScM || data.ext_sc_m || 0),
                    officialsScF: parseInt(data.officialsScF || data.ext_sc_f || 0),
                    officialsStM: parseInt(data.officialsStM || data.ext_st_m || 0),
                    officialsStF: parseInt(data.officialsStF || data.ext_st_f || 0),
                } : {}),
            },
        });
    },

    /**
     * Find all Extension Activities with relations
     */
    findAll: async (filters = {}) => {
        const isOther = filters.isOther === 'true' || filters.isOther === true;
        const model = isOther ? prisma.kvkOtherExtensionActivity : prisma.kvkExtensionActivity;

        return await model.findMany({
            where: {
                kvkId: filters.kvkId ? parseInt(filters.kvkId) : undefined,
                staffId: filters.staffId ? parseInt(filters.staffId) : undefined,
                activityId: filters.activityId ? parseInt(filters.activityId) : undefined,
            },
            include: {
                kvk: {
                    select: { kvkName: true }
                },
                activity: {
                    select: { activityName: true }
                },
                staff: {
                    select: { staffName: true }
                },
                fld: {
                    select: { kvkFldId: true, startDate: true }
                }
            },
            orderBy: {
                [isOther ? 'otherExtensionActivityId' : 'extensionActivityId']: 'desc',
            },
        });
    },

    /**
     * Find Extension Activity by ID
     */
    findById: async (id) => {
        return await prisma.kvkExtensionActivity.findUnique({
            where: { extensionActivityId: parseInt(id) },
            include: {
                kvk: true,
                activity: true,
                staff: true,
                fld: true
            }
        });
    },

    /**
     * Update Extension Activity
     */
    update: async (id, data, entityType = null) => {
        const parsedId = parseInt(id);
        const updateData = {};

        // Determine which model to use
        const isOther = entityType === 'ACHIEVEMENT_OTHER_EXTENSION' || data.isOther;
        const model = isOther ? prisma.kvkOtherExtensionActivity : prisma.kvkExtensionActivity;

        if (data.kvkId !== undefined) updateData.kvkId = parseInt(data.kvkId || 1);
        if (data.fldId !== undefined) updateData.fldId = data.fldId ? parseInt(data.fldId) : null;

        // Handle staff lookup
        if (data.staffId !== undefined || data.staffName !== undefined) {
            let staffId = parseInt(data.staffId);
            if (isNaN(staffId) && data.staffName) {
                const staff = await prisma.kvkStaff.findFirst({
                    where: { staffName: String(data.staffName) }
                });
                if (staff) staffId = staff.kvkStaffId;
            }
            if (!isNaN(staffId)) updateData.staffId = staffId;
        }

        // Handle activity lookup
        if (data.activityId !== undefined || data.extensionActivityType !== undefined) {
            let activityId = parseInt(data.activityId);
            if (isNaN(activityId) && data.extensionActivityType) {
                const activity = await prisma.fldActivity.findFirst({
                    where: { activityName: String(data.extensionActivityType) }
                });
                if (activity) activityId = activity.activityId;
            }
            if (!isNaN(activityId)) updateData.activityId = activityId;
        }

        if (data.numberOfActivities !== undefined || data.activityCount !== undefined) {
            updateData.numberOfActivities = parseInt(data.numberOfActivities || data.activityCount || 0);
        }
        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

        // Farmers and Officials mapping - only for KvkExtensionActivity
        if (model === prisma.kvkExtensionActivity) {
            if (data.farmersGeneralM !== undefined || data.gen_m !== undefined) updateData.farmersGeneralM = parseInt(data.farmersGeneralM || data.gen_m || 0);
            if (data.farmersGeneralF !== undefined || data.gen_f !== undefined) updateData.farmersGeneralF = parseInt(data.farmersGeneralF || data.gen_f || 0);
            if (data.farmersObcM !== undefined || data.obc_m !== undefined) updateData.farmersObcM = parseInt(data.farmersObcM || data.obc_m || 0);
            if (data.farmersObcF !== undefined || data.obc_f !== undefined) updateData.farmersObcF = parseInt(data.farmersObcF || data.obc_f || 0);
            if (data.farmersScM !== undefined || data.sc_m !== undefined) updateData.farmersScM = parseInt(data.farmersScM || data.sc_m || 0);
            if (data.farmersScF !== undefined || data.sc_f !== undefined) updateData.farmersScF = parseInt(data.farmersScF || data.sc_f || 0);
            if (data.farmersStM !== undefined || data.st_m !== undefined) updateData.farmersStM = parseInt(data.farmersStM || data.st_m || 0);
            if (data.farmersStF !== undefined || data.st_f !== undefined) updateData.farmersStF = parseInt(data.farmersStF || data.st_f || 0);

            if (data.officialsGeneralM !== undefined || data.ext_gen_m !== undefined) updateData.officialsGeneralM = parseInt(data.officialsGeneralM || data.ext_gen_m || 0);
            if (data.officialsGeneralF !== undefined || data.ext_gen_f !== undefined) updateData.officialsGeneralF = parseInt(data.officialsGeneralF || data.ext_gen_f || 0);
            if (data.officialsObcM !== undefined || data.ext_obc_m !== undefined) updateData.officialsObcM = parseInt(data.officialsObcM || data.ext_obc_m || 0);
            if (data.officialsObcF !== undefined || data.ext_obc_f !== undefined) updateData.officialsObcF = parseInt(data.officialsObcF || data.ext_obc_f || 0);
            if (data.officialsScM !== undefined || data.ext_sc_m !== undefined) updateData.officialsScM = parseInt(data.officialsScM || data.ext_sc_m || 0);
            if (data.officialsScF !== undefined || data.ext_sc_f !== undefined) updateData.officialsScF = parseInt(data.officialsScF || data.ext_sc_f || 0);
            if (data.officialsStM !== undefined || data.ext_st_m !== undefined) updateData.officialsStM = parseInt(data.officialsStM || data.ext_st_m || 0);
            if (data.officialsStF !== undefined || data.ext_st_f !== undefined) updateData.officialsStF = parseInt(data.officialsStF || data.ext_st_f || 0);
        }

        return await model.update({
            where: { [isOther ? 'otherExtensionActivityId' : 'extensionActivityId']: parsedId },
            data: updateData,
        });
    },

    /**
     * Delete Extension Activity
     */
    delete: async (id) => {
        return await prisma.kvkExtensionActivity.delete({
            where: { extensionActivityId: parseInt(id) },
        });
    },
};

module.exports = extensionActivityRepository;
