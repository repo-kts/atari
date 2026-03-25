const prisma = require('../../config/prisma.js');

const staffQuartersUtilizationRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.staffQuartersUtilization.create({
            data: {
                kvkId,
                dateOfCompletion: data.dateOfCompletion ? new Date(data.dateOfCompletion) : null,
                isCompleted: data.isCompleted,
                numberOfQuarters: parseInt(data.numberOfQuarters || 0),
                occupancyDetails: data.occupancyDetails,
                occupancyData: data.occupancyData ? (typeof data.occupancyData === 'string' ? data.occupancyData : JSON.stringify(data.occupancyData)) : null,
                remark: data.remark,
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.staffQuartersUtilization.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { staffQuartersUtilizationId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.staffQuartersUtilization.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { staffQuartersUtilizationId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.staffQuartersUtilization.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.staffQuartersUtilization.update({
            where: { staffQuartersUtilizationId: id },
            data: {
                dateOfCompletion: data.dateOfCompletion !== undefined ? (data.dateOfCompletion ? new Date(data.dateOfCompletion) : null) : existing.dateOfCompletion,
                isCompleted: data.isCompleted !== undefined ? data.isCompleted : existing.isCompleted,
                numberOfQuarters: data.numberOfQuarters !== undefined ? parseInt(data.numberOfQuarters || 0) : existing.numberOfQuarters,
                occupancyDetails: data.occupancyDetails !== undefined ? data.occupancyDetails : existing.occupancyDetails,
                occupancyData: data.occupancyData !== undefined ? (typeof data.occupancyData === 'string' ? data.occupancyData : JSON.stringify(data.occupancyData)) : existing.occupancyData,
                remark: data.remark !== undefined ? data.remark : existing.remark,
            }
        });
    },

    delete: async (id, user) => {
        const where = { staffQuartersUtilizationId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.staffQuartersUtilization.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.staffQuartersUtilization.delete({
            where: { staffQuartersUtilizationId: id }
        });
    }
};

module.exports = staffQuartersUtilizationRepository;
