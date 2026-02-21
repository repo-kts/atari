const prisma = require('../../config/prisma.js');

const otherExtensionActivityRepository = {
    /**
     * Create a new Other Extension Activity
     */
    create: async (data) => {
        const kvkId = parseInt(data.kvkId || 1);
        const fldId = data.fldId ? parseInt(data.fldId) : null;

        let staffId = parseInt(data.staffId);
        if (isNaN(staffId) && (data.staffName || data.staffId)) {
            const staffStr = String(data.staffName || data.staffId);
            const staff = await prisma.kvkStaff.findFirst({
                where: { staffName: staffStr }
            });
            if (staff) staffId = staff.kvkStaffId;
        }

        // Handle activity lookup
        let activityId = parseInt(data.activityId || data.extensionActivityType || data.natureOfExtensionActivities || data['Nature of Extension Activies']);
        if (isNaN(activityId) && (data.extensionActivityType || data.natureOfExtensionActivities || data['Nature of Extension Activies'] || data.activityId)) {
            const activityName = String(data.extensionActivityType || data.natureOfExtensionActivities || data['Nature of Extension Activies'] || data.activityId);
            const activity = await prisma.fldActivity.findFirst({
                where: { activityName: activityName }
            });
            if (activity) activityId = activity.activityId;
        }

        if (isNaN(staffId)) staffId = 1;
        if (isNaN(activityId)) activityId = 1;

        return await prisma.kvkOtherExtensionActivity.create({
            data: {
                kvkId: kvkId,
                fldId: fldId,
                staffId: staffId,
                activityId: activityId,
                numberOfActivities: parseInt(data.numberOfActivities || data.activityCount || data['No. of activities'] || 1),
                startDate: new Date(data.startDate || new Date()),
                endDate: new Date(data.endDate || new Date()),
            },
        });
    },

    /**
     * Find all Other Extension Activities
     */
    findAll: async (filters = {}) => {
        return await prisma.kvkOtherExtensionActivity.findMany({
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
                    select: { kvkFldId: true }
                }
            },
            orderBy: {
                otherExtensionActivityId: 'desc',
            },
        });
    },

    /**
     * Find Other Extension Activity by ID
     */
    findById: async (id) => {
        return await prisma.kvkOtherExtensionActivity.findUnique({
            where: { otherExtensionActivityId: parseInt(id) },
            include: {
                kvk: true,
                activity: true,
                staff: true,
                fld: true
            }
        });
    },

    /**
     * Update Other Extension Activity
     */
    update: async (id, data) => {
        const parsedId = parseInt(id);
        const updateData = {};

        if (data.kvkId !== undefined) updateData.kvkId = parseInt(data.kvkId);
        if (data.fldId !== undefined) updateData.fldId = data.fldId ? parseInt(data.fldId) : null;

        if (data.staffId !== undefined || data.staffName !== undefined) {
            let staffId = parseInt(data.staffId);
            if (isNaN(staffId) && (data.staffName || data.staffId)) {
                const staffStr = String(data.staffName || data.staffId);
                const staff = await prisma.kvkStaff.findFirst({
                    where: { staffName: staffStr }
                });
                if (staff) staffId = staff.kvkStaffId;
            }
            if (!isNaN(staffId)) updateData.staffId = staffId;
        }

        if (data.activityId !== undefined || data.extensionActivityType !== undefined || data.natureOfExtensionActivities !== undefined || data['Nature of Extension Activies'] !== undefined) {
            let activityId = parseInt(data.activityId || data.extensionActivityType || data.natureOfExtensionActivities || data['Nature of Extension Activies']);
            if (isNaN(activityId) && (data.extensionActivityType || data.natureOfExtensionActivities || data['Nature of Extension Activies'] || data.activityId)) {
                const activityName = String(data.extensionActivityType || data.natureOfExtensionActivities || data['Nature of Extension Activies'] || data.activityId);
                const activity = await prisma.fldActivity.findFirst({
                    where: { activityName: activityName }
                });
                if (activity) activityId = activity.activityId;
            }
            if (!isNaN(activityId)) updateData.activityId = activityId;
        }

        if (data.activityCount !== undefined || data.numberOfActivities !== undefined || data['No. of activities'] !== undefined) {
            updateData.numberOfActivities = parseInt(data.activityCount ?? data.numberOfActivities ?? data['No. of activities'] ?? 0);
        }
        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

        return await prisma.kvkOtherExtensionActivity.update({
            where: { otherExtensionActivityId: parsedId },
            data: updateData,
        });
    },

    /**
     * Delete Other Extension Activity
     */
    delete: async (id) => {
        return await prisma.kvkOtherExtensionActivity.delete({
            where: { otherExtensionActivityId: parseInt(id) },
        });
    },
};

module.exports = otherExtensionActivityRepository;
