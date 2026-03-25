const prisma = require('../../config/prisma.js');

const nicraRevenueRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraRevenueGenerated.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                revenue: parseFloat(data.revenue || 0),
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

        if (filters.reportingYearId) {
            where.reportingYearId = parseInt(filters.reportingYearId);
        }

        return await prisma.nicraRevenueGenerated.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: true
            },
            orderBy: { nicraRevenueGeneratedId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraRevenueGeneratedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraRevenueGenerated.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: true
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraRevenueGeneratedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraRevenueGenerated.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraRevenueGenerated.update({
            where: { nicraRevenueGeneratedId: parseInt(id) },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                revenue: data.revenue !== undefined ? parseFloat(data.revenue) : existing.revenue,
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraRevenueGeneratedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraRevenueGenerated.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraRevenueGenerated.delete({
            where: { nicraRevenueGeneratedId: parseInt(id) }
        });
    }
};

module.exports = nicraRevenueRepository;
