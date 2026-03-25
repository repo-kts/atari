const prisma = require('../../config/prisma.js');

const functionalLinkageRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.functionalLinkage.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                organizationName: data.organizationName,
                natureOfLinkage: data.natureOfLinkage,
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

        return await prisma.functionalLinkage.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { functionalLinkageId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.functionalLinkage.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { functionalLinkageId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.functionalLinkage.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.functionalLinkage.update({
            where: { functionalLinkageId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                organizationName: data.organizationName !== undefined ? data.organizationName : existing.organizationName,
                natureOfLinkage: data.natureOfLinkage !== undefined ? data.natureOfLinkage : existing.natureOfLinkage,
            }
        });
    },

    delete: async (id, user) => {
        const where = { functionalLinkageId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.functionalLinkage.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.functionalLinkage.delete({
            where: { functionalLinkageId: id }
        });
    }
};

module.exports = functionalLinkageRepository;
